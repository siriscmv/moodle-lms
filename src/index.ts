import { load, login, scrape } from './utils.js';
import Settings from './Settings.js';

const cache = new Settings();

async function init() {
	const cookie = await login(cache).catch(console.error);
	if (!cookie) return;

	cache.set('cookie', cookie);
	cache.set('lastLogin', Date.now());

	const page = await load(cache, '4730');

	console.log(scrape(page));
}

init();
