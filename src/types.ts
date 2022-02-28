import type { courses } from './constants.js';

export type cache = {
	[index in typeof courses[number]]: string[];
} & {
	lastLogin: number;
	cookie: string;
};
