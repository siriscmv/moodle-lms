import { CommandInteraction, MessageEmbed } from 'discord.js';
import type { courses } from '../constants.js';
import { getAllCourses, load, scrapeAssignments } from '../utils.js';

export default {
	name: 'courses',
	async run(ctx: CommandInteraction) {
		await ctx.deferReply();

		if (ctx.options.getString('course')) {
			const assignments = await load(ctx.client.db, ctx.options.getString('course')! as typeof courses[number]);
			const data = scrapeAssignments(assignments);

			const em = new MessageEmbed()
				.setTitle(data.name.slice(0, 50))
				.setURL(`https://${process.env.HOST}/course/view.php?id=${ctx.options.getString('course')!}`)
				.addField(
					'Resources',
					data.resources.length ? data.resources.map((r) => `[${r.name}](${r.url})`).join('\n') : 'None',
					false
				)
				.addField(
					'Assignments',
					data.assignments.length ? data.assignments.map((a) => `[${a.name}](${a.url})`).join('\n') : 'None',
					false
				);

			return ctx.editReply({ embeds: [em] });
		} else {
			const courses = await getAllCourses(ctx.client.db);
			const em = new MessageEmbed()
				.setTitle('Courses')
				.setDescription(
					courses
						.map((c) => `[${c.name}](https://${process.env.HOST}/course/view.php?id=${c.id})・**${c.id}**`)
						.join('\n')
				);

			return ctx.editReply({ embeds: [em] });
		}
	}
};
