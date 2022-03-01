import { login } from './utils.js';
import Settings from './Settings.js';
import { ExpressServer, SlashCreator } from 'slash-create';
import { applicationID, publicKey } from './constants.js';
import { readdirSync } from 'fs';

const cache = new Settings();
const app = new SlashCreator({
	applicationID: applicationID,
	publicKey: publicKey,
	token: process.env.TOKEN,
	serverPort: 80,
	serverHost: '0.0.0.0'
});
//@ts-ignore
app.cache = cache;

async function init() {
	const cookie = await login(cache).catch(console.error);
	if (!cookie) return;

	cache.set('cookie', cookie);
	cache.set('lastLogin', Date.now());

	app.withServer(new ExpressServer()).startServer();
	const commands = (
		await Promise.all(
			readdirSync('./dist/commands')
				.filter((f) => f.endsWith('.js'))
				.map((f) => import(`./commands/${f}`))
		)
	).map((d) => d.default);
	app.registerCommands(commands);
	console.log('Ready!');
}

init();
