import db from '@db';
import type { assignments } from '@prisma/client';
import { schedule } from 'node-cron';

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

const refresh = async () => {};
//TODO: Scrape all courses for files then save files to "files" folder
//TODO: Metadata about the raw files will be stored in DB
//TODO: Date to be stored ( can be used for sorting, grouping): Page count, sub topic, file name, course name, Unit number

export const getLastRefresh = () => lastRefresh;
