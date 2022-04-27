import { CommandInteraction, MessageEmbed } from 'discord.js';
import type { courses } from '../constants.js';
import { getAllCourses, load, scrapeAssignments } from '../utils.js';

export default {
	name: 'courses',
	async run(ctx: CommandInteraction) {
		await ctx.deferReply();

		if (ctx.options.getString('course')) {
			const assignments = await load(ctx.client.cache, ctx.options.getString('course')! as typeof courses[number]);
			const data = scrapeAssignments(assignments);

			const main = new MessageEmbed()
				.setTitle(data.name.slice(0, 50))
				.setURL(`https://${process.env.HOST}/course/view.php?id=${ctx.options.getString('course')!}`);

			const embeds: MessageEmbed[] = [];

			if (data.resources.length) {
				const pages = data.resources.length / 15;
				for (let i = 0; i < pages; i++) {
					const embed = new MessageEmbed().setTitle(`Resources #${i + 1}`).setDescription(
						data.resources
							.slice(i * 15, (i + 1) * 15)
							.map((r) => `[${r.name}](${r.url})`)
							.join('\n')
					);

					embeds.push(embed);
				}
			}

			if (data.assignments.length) {
				const pages = data.assignments.length / 15;

				const stored = await ctx.client.assignments.findAll({
					where: { course: parseInt(ctx.options.getString('course')!) }
				});

				for (let i = 0; i < pages; i++) {
					const embed = new MessageEmbed().setTitle(`Assignments #${i + 1}`).setDescription(
						data.assignments
							.slice(i * 15, (i + 1) * 15)
							.map((a) => {
								const id = new URL(a.url).searchParams.get('id')!
								return `[${a.name}](${a.url}) ${stored.some((s) => `${s.id}` === `${id}`)? `<t:${stored.find(s => s.name === a.name)}:R>`: ''}`
							})
							.join('\n')
					);

					embeds.push(embed);
				}
			}

			return ctx.editReply({ embeds: [main, ...embeds] });
		} else {
			const courses = await getAllCourses(ctx.client.cache);
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
