import fetch from 'node-fetch';
import { courses, updates } from './constants.js';
import { load as cherrioLoad } from 'cheerio';
import type { AssignmentsInstance, Cache } from './types.js';
import { Client, EmbedBuilder, BaseGuildTextChannel } from 'discord.js';
import { Sequelize, DataTypes } from 'sequelize';

export async function login(cache: Cache) {
	const lastLogin = cache.lastLogin ?? 0;
	if (Date.now() - lastLogin < 10 * 60 * 1000) return cache.cookie;

	const initalCookie =
		(
			await fetch(`https://${process.env.HOST}/login/index.php`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
					Accept: '*/*',
					'Accept-Encoding': 'gzip, deflate, br',
					Connection: 'keep-alive',
					Host: process.env.HOST!,
					Referer: `https://${process.env.HOST}/login/index.php`
				}
			})
		).headers
			.get('set-cookie')
			?.split(';')[0] ?? '';

	const res = await fetch(`https://${process.env.HOST}/login/index.php`, {
		method: 'POST',
		headers: {
			Cookie: initalCookie,
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
			Connection: 'keep-alive',
			'Accept-language': 'en-US,en;q=0.9',
			Host: process.env.HOST!,
			Origin: `https://${process.env.HOST}`,
			Referer: `https://${process.env.HOST}/login/index.php`,
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-Mode': 'navigate',
			'Upgrade-Insecure-Requests': '1'
		},
		body: `anchor=&username=${encodeURIComponent(process.env.EMAIL!)}&password=${encodeURIComponent(
			process.env.PASSWORD!
		)}`,
		redirect: 'manual',
		follow: 0
	});

	const cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
	cache.lastLogin = Date.now();
	cache.cookie = cookie;
	return cookie;
}

export async function load(cache: Cache, courseId: typeof courses[number]) {
	const res = await fetch(`https://${process.env.HOST}/course/view.php?id=${courseId}`, {
		headers: {
			Cookie: await login(cache)
		}
	});

	return res.text();
}

export function scrapeAssignments(html: string) {
	const $ = cherrioLoad(html);
	const data: {
		name: string;
		resources: { name: string; url: string }[];
		assignments: { name: string; url: string }[];
	} = {
		name: $('#page-header h1').text(),
		resources: [],
		assignments: []
	};

	$('[class="activity resource modtype_resource "]').each((_, el) => {
		const element = $(el).find('a');
		data.resources.push({ name: element.text(), url: element.attr('href')! });
	});

	$('[class="activity assign modtype_assign "]').each((_, el) => {
		const element = $(el).find('div > div > div > div > a');
		data.assignments.push({ name: element.find('span').text(), url: element.attr('href')! });
	});

	return data;
}

export async function getAllCourses(cache: Cache) {
	if (cache.courses.length) return cache.courses;

	const res = await fetch(`https://${process.env.HOST}/my/`, {
		headers: {
			Cookie: await login(cache)
		}
	});

	const html = await res.text();
	const $ = cherrioLoad(html);
	const currentCourses: { name: string; id: typeof courses[number] }[] = [];

	const elements = $('[class="card mb-3 courses-view-course-item"]').toArray();

	for (const el of elements) {
		if (courses.includes($(el).find('a').attr('href')!.split('=')[1] as typeof courses[number])) {
			currentCourses.push({
				name: $(el).find('div > div > div > h4 > a').text(),
				id: $(el).find('a').attr('href')!.split('=')[1] as typeof courses[number]
			});
		}
	}

	if (cache.courses.length === 0) {
		cache.courses = currentCourses;
	}

	return currentCourses;
}

export async function initDB(app: Client) {
	const sequelize = new Sequelize({
		dialect: 'sqlite',
		storage: 'database.sqlite',
		logging: false
	});

	app.assignments = sequelize.define<AssignmentsInstance>('assignments', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		file: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		due: {
			type: DataTypes.NUMBER,
			allowNull: false
		},
		course: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	});

	await app.assignments.sync();
}

export async function sync(app: Client) {
	const newAssignments: { file: String; name: String; course: number; id: number; due: number }[] = [];

	await getAllCourses(app.cache);
	console.log('[SYNC]: Starting...');

	for await (const course of app.cache.courses) {
		console.log(`[SYNC]: Scraping ${course.name}`);
		const assignments = await load(app.cache, course.id);
		const data = scrapeAssignments(assignments);

		const prev = await app.assignments.findAll({
			where: {
				course: course.id
			}
		});

		const _new = data.assignments.filter((d) => d.url && !prev.some((a) => d.url.includes(`${a.id}`)));
		for (const assignment of _new) {
			const a = await fetchAssignmentDetails(app.cache, assignment.url, parseInt(course.id));
			newAssignments.push(a);
			await app.assignments.create(a);
		}
	}

	console.log(`[SYNC]: Sending ${newAssignments.length} new assignments`);
	const log = (await app.channels.fetch(updates)) as BaseGuildTextChannel;

	for (const a of newAssignments) {
		const em = new EmbedBuilder().setTitle('New assignment').addFields([
			{ name: 'Course', value: app.cache.courses.find((c) => `${c.id}` === `${a.course}`)!.name.slice(0, 20) },
			{ name: 'Name', value: `[${a.name}](https://${process.env.HOST}/mod/assign/view.php?id=${a.id})` },
			{ name: 'Due', value: `<t:${Math.round(a.due / 1000)}:R>` }
		]);

		log.send({ embeds: [em] });
	}
}

export async function fetchAssignmentDetails(cache: Cache, url: string, course: number) {
	const res = await fetch(url, {
		headers: {
			Cookie: await login(cache)
		}
	});

	const html = await res.text();
	const $ = cherrioLoad(html);

	return {
		id: parseInt(new URL(url).searchParams.get('id')!),
		name: $('div[role="main"] h2').text(), //@ts-ignore
		due: new Date($('tr[class=""] > td:nth-child(2)')[2].firstChild.data).getTime() - (5 * 60 + 30) * 60 * 1000,
		file: $('#ygtvcontentel1 a')?.[0]?.attribs?.href ?? '',
		course
	};
}
