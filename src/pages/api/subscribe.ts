import db from '@db';
import { sendNotification } from '@utils/notifications';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const {
		endpoint,
		keys: { p256dh, auth }
	} = req.body;

	if (!endpoint || !p256dh || !auth) {
		return res.status(400).end();
	}

	const subData = await db.notifications.upsert({
		create: {
			endpoint,
			p256dh,
			auth
		},
		update: {
			endpoint,
			p256dh,
			auth
		},
		where: {
			endpoint
		}
	});

	const payload = { title: 'LMS', body: 'This is a test message' };

	await sendNotification({ endpoint: subData.endpoint, keys: { p256dh, auth } }, payload);

	res.status(201).json({});
};

export default handler;
