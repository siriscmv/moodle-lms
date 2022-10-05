import { toast } from 'react-hot-toast';

const urlBase64ToUint8Array = (base64String: string) => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

export const getSubscribtion = async () => {
	if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported');

	const register = await navigator.serviceWorker.register('/worker.js', {
		scope: '/'
	});

	await navigator.serviceWorker.ready;

	const subscription = await register.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID!)
	});

	return subscription;
};

export default async function subscribe() {
	let registered = false;
	try {
		const subscription = await getSubscribtion();

		const res = await fetch('/api/notifications/subscribe', {
			method: 'POST',
			body: JSON.stringify(subscription),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (res.ok) registered = true;
	} catch (_) {}

	if (registered) toast.success('You are now subscribed to notifications!');
	else toast.error('Unable to register push notifications, seems like your browser does not support it.');
}

export const revoke = async () => {
	try {
		const subscription = await getSubscribtion();

		const res = await fetch('/api/notifications/revoke', {
			method: 'POST',
			body: JSON.stringify(subscription),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (!res.ok) toast.error('Unable to revoke push notifications');

		const body = await res.json();
		if (body.success) toast.success('You are now unsubscribed from notifications!');
		else toast.error('Unable to revoke push notifications');
	} catch (e) {
		toast.error('Unable to revoke push notifications');
	}
};
