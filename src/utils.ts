import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import type { courses } from './constants.js';
import { load as cherrioLoad } from 'cheerio';
import type Settings from './Settings.js';

export async function login(cache: Settings, timeout = 15 * 1000) {
	return new Promise<string>(async (resolve, reject) => {
		const lastLogin = cache.get('lastLogin') ?? 0;
		if (Date.now() - lastLogin < 30 * 60 * 1000) return resolve(cache.get('cookie'));

		setTimeout(() => {
			reject(`Timed out after ${timeout}ms`);
		}, timeout);
		const browser = await puppeteer.launch();
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

export function scrape(html: string) {
	const $ = cherrioLoad(html);
	const data: {
		name: string;
		assignments: { name: string; url: string }[];
	} = {
		name: $('#page-header h1').text(),
		assignments: []
	};

	$('[class="activity resource modtype_resource "]').each((_, el) => {
		data.assignments.push({ name: $(el).find('a').text(), url: $(el).find('a').attr('href')! });
	});

	return data;
}
