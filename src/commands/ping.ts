import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { mainServers } from '../constants.js';

export default class PingCommand extends SlashCommand {
	constructor(app: SlashCreator) {
		super(app, {
			name: 'ping',
			description: "Test the bot's ping",
			guildIDs: mainServers
		});
	}

	override async run(ctx: CommandContext) {
		await ctx.send('Pinging...', { ephemeral: true });
		const sent = await ctx.fetch();

		await sent.edit(`Pong! Latency is \`${ctx.invokedAt - sent.timestamp}\`ms.`);
	}
}
