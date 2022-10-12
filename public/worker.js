self.addEventListener('push', (e) => {
	const data = e.data.json();
	self.registration.showNotification(data.title, {
		body: data.body
	});
});

self.addEventListener('pushsubscriptionchange', (e) => {
	e.waitUntil(
		fetch('/api/notifications/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				old_endpoint: e.oldSubscription ? e.oldSubscription.endpoint : null,
				new_endpoint: e.newSubscription ? e.newSubscription.endpoint : null,
				new_p256dh: e.newSubscription ? e.newSubscription.toJSON().keys.p256dh : null,
				new_auth: e.newSubscription ? e.newSubscription.toJSON().keys.auth : null
			})
		})
	);
});
