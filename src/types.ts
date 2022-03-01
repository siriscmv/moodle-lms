import type { courses } from './constants.js';

export type cache = {
	[index in typeof courses[number]]: string[];
} & {
	lastLogin: number;
	cookie: string;
	courses: { name: string; id: typeof courses[number] }[];
};
