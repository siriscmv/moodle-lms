import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import { courses } from './constants.js';
import { load as cherrioLoad } from 'cheerio';
import type Settings from './Settings.js';

export async function login(cache: Settings, timeout = 15 * 1000) {
	return new Promise<string>(async (resolve, reject) => {
		const lastLogin = cache.get('lastLogin') ?? 0;
		if (Date.now() - lastLogin < 30 * 60 * 1000) return resolve(cache.get('cookie'));

		setTimeout(() => {
			reject(`Timed out after ${timeout}ms`);
		}, timeout);
		const browser = await puppeteer.launch({
			args: ['--no-sandbox']
		});
		const page = await browser.newPage();

		let isAuthenticated = false;
		page.on('response', (res) => {
			if (isAuthenticated && res.headers()['set-cookie']) {
				const cookie = res.headers()['set-cookie'].split(';')[0];
				return resolve(cookie);
			} else if (res.headers()['set-cookie']) isAuthenticated = true;
		});

		await page.goto(`https://${process.env.HOST}/login/index.php`);
		await page.type('#username', process.env.EMAIL!);
		await page.type('#password', process.env.PASSWORD!);
		await page.click('#loginbtn');
	});
}

export async function load(cache: Settings, courseId: typeof courses[number]) {
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

export async function getAllCourses(cache: Settings) {
	if (cache.get('courses')) return cache.get('courses');

	const res = await fetch(`https://${process.env.HOST}/my/`, {
		headers: {
			Cookie: await login(cache)
		}
	});

	const html = await res.text();
	const $ = cherrioLoad(html);
	const currentCourses: { name: string; id: typeof courses[number] }[] = [];

	$('[class="card mb-3 courses-view-course-item"]').each((_, el) => {
		if (courses.includes($(el).find('a').attr('href')!.split('=')[1] as typeof courses[number])) {
			currentCourses.push({
				name: $(el).find('div > div > div > h4 > a').text(),
				id: $(el).find('a').attr('href')!.split('=')[1] as typeof courses[number]
			});
		}
	});

	if (!cache.get('courses')) {
		cache.set('courses', currentCourses);
	}

	return currentCourses;
}
