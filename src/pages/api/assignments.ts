import start, { getLastRefresh } from '@utils/cron';
import db from '@utils/db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();
	let lastRefresh = getLastRefresh();

	if (!lastRefresh) {
		await start();
		lastRefresh = getLastRefresh();
	}

	const assignments = await db.assignments.findMany({
		where: {
			due: {
				gt: Math.round(Date.now() / 1000) - 30 * 24 * 60 * 60
			}
		}
	});

	res.status(200).json({ assignments, lastRefresh });
};

export default handler;
