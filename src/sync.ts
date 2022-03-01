import { SlashCreator } from 'slash-create';
import { applicationID, publicKey } from './constants.js';
import { readdirSync } from 'fs';
import Settings from './Settings.js';
import { getAllCourses } from './utils.js';

(async () => {
	const creator = new SlashCreator({
		applicationID: applicationID,
		publicKey: publicKey,
		token: process.env.TOKEN
	});
	const cache = new Settings(); //@ts-ignore
	creator.cache = cache;
	await getAllCourses(cache);

	const commands = (
		await Promise.all(
			readdirSync('./dist/commands')
				.filter((f) => f.endsWith('.js'))
				.map((f) => import(`./commands/${f}`))
		)
	).map((d) => d.default);

	creator.registerCommands(commands).syncCommands({ syncGuilds: true });
})();
