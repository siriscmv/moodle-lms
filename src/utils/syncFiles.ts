import db from '@db';
import { schedule } from 'node-cron';
import login, { defaultHeaders } from '@utils/login';
import { courseIDs } from '@utils/courses';
import * as cheerio from 'cheerio';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { createWriteStream, readFileSync } from 'node:fs'; //@ts-ignore
import * as pdf from 'pdf-page-counter';
import fetch from 'node-fetch';

const streamPipeline = promisify(pipeline);

export interface File {
	name: string;
	id: number;
	topic: string;
	course: number;
	pages: number;
	modified: number;
}

let lastRefresh: null | number = null;

export default async function start() {
	await refresh();
	schedule(
		'0 3 * * *', // Every day at 3 AM
		refresh,
		{
			scheduled: true,
			timezone: 'Asia/Kolkata'
		}
	);
}

const refresh = async () => {
	const files = await db.files.findMany({
		select: { id: true, name: false, topic: false, course: false, pages: false, modified: false }
	});

	const newFiles = await getFiles(files.map((f) => f.id));
	console.log(newFiles); //DEBUG
	if (!newFiles) return;

	for (const f of newFiles) {
		await db.files.create({
			data: f
		});
	}

	lastRefresh = Date.now();
};

export const getLastRefresh = () => lastRefresh;

export async function getFiles(idsToIgnore: number[]) {
	const creds = await login();

	const newFiles: File[] = [];
	let isSuccess = true;

	for (const course of courseIDs) {
		try {
			const html = await (
				await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/course/view.php?id=${course}`, {
					method: 'GET',
					headers: {
						'Content-Type': '*',
						Cookie: creds.cookie,
						...defaultHeaders
					}
				})
			).text();

			const $ = cheerio.load(html);
			const topics = $('ul[class="topics"] > li').toArray();

			for (const topic of topics) {
				const subTopic = $(topic).find('div:first > div:first > h3').text().trim();
				console.log($(topic).find('div:last > ul').toArray().length); //DEBUG
				const files = $(topic).find('div:last > ul > li').toArray();
				console.log(files.length); //DEBUG

				for (const f of files) {
					const file = $(f)
						.find('div > div:first > div:first > div:first > div:first > div:last > div:last > a')
						.contents();
					const url = $(file).attr('href')!;
					const name = $(file).find('span').text();
					const id = parseInt(url.split('id=')[1]);

					//console.log(name); //DEBUG

					if (!idsToIgnore.includes(id) && url.includes('resource')) {
						const downloaded = await fetch(url, {
							method: 'GET',
							headers: {
								'Content-Type': '*',
								Cookie: creds.cookie,
								...defaultHeaders
							}
						});

						const ext = downloaded.headers
							.get('content-disposition')!
							.split('; ')
							.find((s) => s.startsWith('filename='))!
							.split('.')[1];

						await streamPipeline(
							//@ts-ignore
							downloaded.body!,
							createWriteStream(`.files/${id}.${ext})}`)
						);

						const { numpages } = await pdf(readFileSync(`.files/${id}.${ext}`));

						newFiles.push({
							name,
							id,
							topic: subTopic,
							course,
							pages: numpages,
							modified: new Date(downloaded.headers.get('last-modified')!).getTime()
						});
					}
				}
			}
		} catch (_) {
			isSuccess = false;
			break;
		}
	}

	if (!isSuccess) return false;

	return newFiles;
}
