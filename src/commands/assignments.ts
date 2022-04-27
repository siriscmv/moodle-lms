import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Op } from 'sequelize';

export default {
	name: 'assignments',
	async run(ctx: CommandInteraction) {
		await ctx.deferReply();

		const latest = await ctx.client.assignments.findAll({
			limit: 10,
			where: {
				due: {
					[Op.gt]: Date.now()
				}
			},
			order: [['due', 'ASC']]
		});

		const embed = new MessageEmbed()
			.setTitle('Next 10 Assignments')
			.setColor(0x00ff00)
			.setDescription(
				latest
					.map((a) => {
						return `[${a.name}](https://${process.env.HOST}/mod/assign/view.php?id=${a.id}) <t:${Math.round(
							a.due / 100
						)}:R>`;
					})
					.join('\n')
			);

		return ctx.editReply({ embeds: [embed] });
	}
};
