import db from '@db';
import { sendNotification } from '@utils/notifications';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).end();

	const { endpoint } = req.body;

	if (!endpoint) {
		return res.status(400).end();
	}

	db.notifications
		.delete({
			where: {
				endpoint
			}
		})
		.then(() => {
			res.status(200).json({
				success: true
			});
		})
		.catch(() => {
			res.status(200).json({
				success: false
			});
		});
};

export default handler;
