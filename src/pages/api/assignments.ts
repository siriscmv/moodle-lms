import { getLastRefresh } from '@utils/syncAssignments';
import db from '@utils/db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();

	const lastRefresh = getLastRefresh() ?? 0;
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
