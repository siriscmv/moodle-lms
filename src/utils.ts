import fetch from 'node-fetch';
import type { AssignmentsInstance, Cache } from './types.js';
import type { Client } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';

export async function login(cache: Cache): Promise<{ cookie: string; sessionKey: string }> {
	const lastLogin = cache.lastLogin ?? 0;
	if (Date.now() - lastLogin < 10 * 60 * 1000) return { cookie: cache.cookie, sessionKey: cache.sessionKey };

	const initalCookie =
		(
			await fetch(`https://${process.env.HOST}/login/index.php`, {
				headers: defaultHeaders
			})
		).headers
			.get('set-cookie')
			?.split(';')[0] ?? '';

	const res = await fetch(`https://${process.env.HOST}/login/index.php`, {
		method: 'POST',
		headers: {
			Cookie: initalCookie,
			'Content-Type': 'application/x-www-form-urlencoded',
			...defaultHeaders
		},
		body: `logintoken=${'abc'}&username=${encodeURIComponent(process.env.EMAIL!)}&password=${encodeURIComponent(
			process.env.PASSWORD!
		)}`, //FIX: Reverse engineer the logintoken param
		redirect: 'manual',
		follow: 0
	});
	console.log(res.headers); //DEBUG
	const cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';

	const sessionKey = (
		await (
			await fetch(`https://${process.env.HOST}/`, {
				method: 'GET',
				headers: {
					Cookie: cookie,
					...defaultHeaders
				},
				redirect: 'manual',
				follow: 0
			})
		).text()
	).match(/"sesskey":"([a-zA-Z0-9]*)"/m)?.[1]!;

	cache.sessionKey = sessionKey;
	cache.cookie = cookie;
	cache.lastLogin = Date.now();
	return { cookie, sessionKey };
}

export async function getUpcomingAssignments(app: Client) {
	await login(app.cache);

	const assignments = await (
		await fetch(
			`https://lms.ssn.edu.in/lib/ajax/service.php?sesskey=${encodeURIComponent(
				app.cache.sessionKey
			)}&info=core_calendar_get_action_events_by_timesort`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Cookie: app.cache.cookie,
					...defaultHeaders
				},
				body: JSON.stringify([
					{
						index: 0,
						methodname: 'core_calendar_get_action_events_by_timesort',
						args: {
							aftereventid: 0,
							limitnum: 50,
							timesortfrom: Math.round(Date.now() / 1000),
							limittononsuspendedevents: true
						}
					}
				])
			}
		)
	).json();

	console.log(assignments); //DEBUG
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

const defaultHeaders = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
	Connection: 'keep-alive',
	'Accept-language': 'en-US,en;q=0.9',
	Host: process.env.HOST!,
	Origin: `https://${process.env.HOST}`,
	'Sec-Fetch-Site': 'same-origin',
	'Sec-Fetch-Mode': 'navigate',
	'Upgrade-Insecure-Requests': '1'
};

export async function sync(app: Client) {
	app;
}
