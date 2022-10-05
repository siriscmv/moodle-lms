import fetch from 'node-fetch';

async function login(): Promise<{ cookie: string; sessionKey: string }> {
	const initial = await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/login/index.php`, {
		headers: defaultHeaders
	});

	const initalCookie = initial.headers.get('set-cookie')?.split(';')[0] ?? '';
	const loginToken = new RegExp(/<input type="hidden" name="logintoken" value="(.+)">/gm).exec(
		await initial.text()
	)?.[1];

	const res = await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/login/index.php`, {
		method: 'POST',
		headers: {
			Cookie: initalCookie,
			'Content-Type': 'application/x-www-form-urlencoded',
			...defaultHeaders
		},
		body: `logintoken=${loginToken}&username=${encodeURIComponent(process.env.EMAIL!)}&password=${encodeURIComponent(
			process.env.PASSWORD!
		)}`,
		redirect: 'manual',
		follow: 0
	});
	const cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';

	const sessionKey = (
		await (
			await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/`, {
				method: 'GET',
				headers: {
					Cookie: cookie,
					...defaultHeaders
				},
				redirect: 'manual',
				follow: 0
			})
		).text()
	).match(/"sesskey":"([a-zA-Z0-9]*)"/m)?.[1]!;

	return { cookie, sessionKey };
}

export default async function getAssignments() {
	const creds = await login();
	//@ts-ignore
	const res = (
		await (
			await fetch(
				`https://${process.env.NEXT_PUBLIC_HOST}/lib/ajax/service.php?sesskey=${encodeURIComponent(
					creds.sessionKey
				)}&info=core_calendar_get_action_events_by_timesort`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Cookie: creds.cookie,
						...defaultHeaders
					},
					body: JSON.stringify([
						{
							index: 0,
							methodname: 'core_calendar_get_action_events_by_timesort',
							args: {
								aftereventid: 0,
								limitnum: 50,
								timesortfrom: Math.round(Date.now() / 1000),
								limittononsuspendedevents: true
							}
						}
					])
				}
			)
		).json()
	)[0] as any;

	if (res.error) return false;

	const assignments: Assignment[] = res.data.events.map((event: any) => ({
		id: event.instance,
		name: event.activityname,
		due: event.timestart,
		modified: event.timemodified,
		course: event.course.id
	}));

	return assignments;
}

const defaultHeaders = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
	Connection: 'keep-alive',
	'Accept-language': 'en-US,en;q=0.9',
	Host: process.env.NEXT_PUBLIC_HOST!,
	Origin: `https://${process.env.NEXT_PUBLIC_HOST}`,
	'Sec-Fetch-Site': 'same-origin',
	'Sec-Fetch-Mode': 'navigate',
	'Upgrade-Insecure-Requests': '1'
};

export interface Assignment {
	id: number;
	name: string;
	due: number;
	modified: number;
	course: number;
}
