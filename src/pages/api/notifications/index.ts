import db from '@db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const { endpoint } = req.body;

	if (!endpoint) {
		return res.status(400).end();
	}

	const subData = await db.notifications.findUnique({
		where: {
			endpoint
		}
	});

	return res.status(200).json({ subscribed: subData ? true : false });
};

export default handler;
