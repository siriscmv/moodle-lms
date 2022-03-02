import type { Collection } from 'discord.js';
import type { courses } from './constants.js';
import type Settings from './Settings.js';

export type cache = {
	[index in typeof courses[number]]: string[];
} & {
	lastLogin: number;
	cookie: string;
	courses: { name: string; id: typeof courses[number] }[];
};

declare module 'discord.js' {
	export interface Client {
		db: Settings;
		commands: Collection<
			string,
			{
				name: string;
				run(ctx: CommandInteraction): Promise<unknown>;
			}
		>;
	}
}
