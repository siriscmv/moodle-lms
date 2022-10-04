import type { NextApiHandler } from 'next';
import start, { getLastRefresh } from '@utils/cron';
import db from '@utils/db';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();
	let lastRefresh = getLastRefresh();

	if (!lastRefresh) {
		await start();
		lastRefresh = getLastRefresh();
	}

	const assignments = await db.assignments.findMany();

	res.status(200).json({ assignments, lastRefresh });
};

export default handler;
