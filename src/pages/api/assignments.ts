import db from '@utils/db';
import kv from '@utils/kv';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();

	const lastRefresh = kv.get('alr') ?? 0;
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
