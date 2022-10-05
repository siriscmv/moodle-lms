import db from '@db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const { endpoint } = req.body;

	if (!endpoint) {
		return res.status(400).end();
	}

	const deleted = await db.notifications.delete({ where: { endpoint } }).catch(() => null);

	if (deleted) return res.status(200).json({ success: true });
	return res.status(200).json({ success: false });
};

export default handler;
