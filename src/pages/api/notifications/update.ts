import db from '@db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const { old_endpoint, new_endpoint, new_p256dh, new_auth } = req.body as Record<string, string>;

	if (!old_endpoint || !new_endpoint || !new_p256dh || !new_auth) {
		return res.status(400).end();
	}

	await db.notifications.upsert({
		create: {
			endpoint: new_endpoint,
			p256dh: new_p256dh,
			auth: new_auth
		},
		update: {
			endpoint: new_endpoint,
			p256dh: new_p256dh,
			auth: new_auth
		},
		where: {
			endpoint: old_endpoint
		}
	});

	return res.status(200).json({ success: true });
};

export default handler;
