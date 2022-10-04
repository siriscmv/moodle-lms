import db from '@db';
import webpush, { PushSubscription } from 'web-push';
import { Diff } from './cron';

export default async function notifyAll(diff: Diff[]) {
	const msg = diff.map((d) => `${d.name} ${d.message}`).join(', ');

	const recipients = await db.notifications.findMany();

	for (const recipient of recipients) {
		try {
			await sendNotification(
				{
					endpoint: recipient.endpoint,
					keys: {
						p256dh: recipient.p256dh,
						auth: recipient.auth
					}
				},
				{
					title: 'LMS',
					body: msg
				}
			);
		} catch (_) {}
	}
}

webpush.setVapidDetails(process.env.NEXT_PUBLIC_VAPID_SUB!, process.env.NEXT_PUBLIC_VAPID!, process.env.VAPID_PRIVATE!);

export const sendNotification = async (subscription: PushSubscription, payload: { title: string; body: string }) => {
	try {
		await webpush.sendNotification(subscription, JSON.stringify(payload));
	} catch (err) {
		console.error(err);
	}
};
