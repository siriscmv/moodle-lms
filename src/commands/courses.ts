import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from 'slash-create';
import { mainServers } from '../constants.js';
import { getAllCourses, load, scrapeAssignments } from '../utils.js';

export default class CoursesCommand extends SlashCommand {
	constructor(app: SlashCreator) {
		super(app, {
			name: 'courses',
			description: 'View a list of courses and specific assignments',
			guildIDs: mainServers,
			options: [
				{
					name: 'course',
					type: CommandOptionType.STRING,
					description: 'The course to view assignments for',
					required: false, //@ts-ignore
					choices: app.cache.get('courses')?.map((c) => ({ name: c.name.slice(0, 50), value: c.id }))
				}
			]
		});
	}

	override async run(ctx: CommandContext) {
		await ctx.defer(true);
		if (ctx.options.course) {
			//@ts-ignore
			const assignments = await load(ctx.creator.cache, ctx.options.course);
			const data = scrapeAssignments(assignments);
			return ctx.send(
				`[${data.name}](https://${process.env.HOST}/course/view.php?id=${ctx.options.course})\n\n
				__**Resources**__\n${data.resources.map((r) => `[${r.name}](${r.url})`).join('\n')}\n\n
				__**Assignments**__\n${data.assignments.map((a) => `[${a.name}](${a.url})`).join('\n')}`
			);
		} else {
			//@ts-ignore
			const courses = await getAllCourses(ctx.creator.cache);
			ctx.send(
				courses
					.map((c) => `**${c.id}**・[${c.name.slice(0, 50)}](https://${process.env.HOST}/course/view.php?id=${c.id})`)
					.join('\n')
			);
		}
	}
}
