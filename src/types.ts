import type { Collection } from 'discord.js';
import type { Model, ModelStatic } from 'sequelize';

export type Cache = {
	lastLogin: number;
	cookie: string;
	sessionKey: string;
};

/*
{
	[index in typeof courses[number]]: string[];
} &
*/

export interface AssignmentsAttributes {
	id: number;
	name: string;
	file: string;
	due: number;
	course: number;
}

export interface AssignmentsInstance
	extends Model<AssignmentsAttributes, AssignmentsAttributes>,
		AssignmentsAttributes {}

declare module 'discord.js' {
	export interface Client {
		assignments: ModelStatic<AssignmentsInstance>;
		commands: Collection<
			string,
			{
				name: string;
				run(ctx: CommandInteraction): Promise<unknown>;
			}
		>;
		cache: Cache;
	}
}
