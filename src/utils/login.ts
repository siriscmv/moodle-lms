import fetch from 'node-fetch';

export default async function login(): Promise<{ cookie: string; sessionKey: string }> {
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

export const defaultHeaders = {
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
