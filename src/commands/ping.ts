import { CommandInteraction, SnowflakeUtil } from 'discord.js';

export default {
	name: 'ping',
	async run(ctx: CommandInteraction) {
		const sent = await ctx.reply({ content: 'Pinging...', ephemeral: true, fetchReply: true });
		const ping = SnowflakeUtil.deconstruct(sent.id).timestamp - BigInt(ctx.createdTimestamp);
		return ctx.editReply(`Pong! Latency is \`${ping}\`ms.`);
	}
};
