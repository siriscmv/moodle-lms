import { login, sync, initDB } from './utils.js';
import { Client, Collection, Options } from 'discord.js';
import { readdirSync } from 'fs';

const cache = {
	lastLogin: 0,
	cookie: '',
	courses: []
};

const app = new Client({
	intents: [],
	makeCache: Options.cacheWithLimits({
		PresenceManager: 0,
		StageInstanceManager: 0,
		GuildInviteManager: 0,
		GuildBanManager: 0,
		MessageManager: 0,
		UserManager: {
			maxSize: 1,
			keepOverLimit: (user, id) => user.client.user!.id === id
		},
		GuildMemberManager: {
			maxSize: 1,
			keepOverLimit: (member, id) => member.client.user!.id === id
		},
		GuildEmojiManager: 0,
		BaseGuildEmojiManager: 0,
		GuildStickerManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		VoiceStateManager: 0,
		ThreadMemberManager: 0,
		ApplicationCommandManager: 0
	})
});

app.cache = cache;
app.commands = new Collection();

async function init() {
	const cookie = await login(app.cache, 45 * 1000).catch(console.error);
	if (!cookie) return;

	app.cache.cookie = cookie;
	app.cache.lastLogin = Date.now();

	const commands = (
		await Promise.all(
			readdirSync('./dist/commands')
				.filter((f) => f.endsWith('.js'))
				.map((f) => import(`./commands/${f}?d=${Date.now()}`))
		)
	).map((d) => d.default);

	for (const c of commands) {
		app.commands.set(c.name, c);
	}
	await initDB(app);
	await sync(app);
}

app.on('ready', () => init());

app.on('interactionCreate', (ctx) => {
	if (ctx.isCommand()) {
		app.commands.get(ctx.commandName)?.run(ctx);
	}
});

setInterval(async () => await sync(app), 30 * 60 * 1000);
app.login(process.env.TOKEN!);

process.on('unhandledRejection', (e) => console.error(e));
process.on('uncaughtException', (e) => console.error(e));
