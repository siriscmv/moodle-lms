import fetch from 'node-fetch';

async function login(): Promise<{ cookie: string; sessionKey: string }> {
	const initial = await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/login/index.php`, {
		headers: defaultHeaders
	});

	const initialCookie = initial.headers.get('set-cookie')?.split(';')[0] ?? '';
	const loginToken = new RegExp(/<input type="hidden" name="logintoken" value="(.+)">/gm).exec(
		await initial.text()
	)?.[1];

	const res = await fetch(`https://${process.env.NEXT_PUBLIC_HOST}/login/index.php`, {
		method: 'POST',
		headers: {
			Cookie: initialCookie,
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
	const dates = getMonths();

	const assignments: Assignment[] = [];
	let isSuccess = true;

	for (const date of dates) {
		try {
			//@ts-ignore
			const res = (
				await (
					await fetch(
						`https://${process.env.NEXT_PUBLIC_HOST}/lib/ajax/service.php?sesskey=${encodeURIComponent(
							creds.sessionKey
						)}&info=core_calendar_get_calendar_monthly_view`,
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
									methodname: 'core_calendar_get_calendar_monthly_view',
									args: { year: date.year, month: date.month, courseid: 1, day: 1, view: 'monthblock' }
								}
							])
						}
					)
				).json()
			)[0] as any;

			assignments.push(
				...res.data.weeks
					.map((w: any) =>
						w.days?.map((d: any) =>
							d.events
								?.filter((e: any) => e.eventtype === 'due')
								.map((e: any) => ({
									id: e.instance,
									name: e.activityname,
									due: e.timestart,
									modified: e.timemodified,
									course: e.course.id
								}))
						)
					)
					.flat(10)
			);
		} catch (_) {
			isSuccess = false;
			break;
		}
	}

	if (!isSuccess) return false;

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

const getMonths = () => {
	const date = new Date();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return [
		{ year: month === 1 ? year - 1 : year, month: month === 1 ? 12 : month - 1 },
		{ year, month },
		{ year: month === 12 ? year + 1 : year, month: month === 12 ? 1 : month + 1 }
	];
};
