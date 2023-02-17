import db from '@db';
import type { assignments } from '@prisma/client';
import { schedule } from 'node-cron';
import getAssignments, { Assignment } from '@utils/getAssignments';
import notifyAll from '@utils/notifications';

let lastRefresh: null | number = null;

export default async function start() {
	await refresh();
	schedule(
		'*/15 * * * *', // Every 15 minutes
		refresh,
		{
			scheduled: true,
			timezone: 'Asia/Kolkata'
		}
	);
}

const refresh = async () => {
	const newAssignments = await getAssignments();

	if (!newAssignments) {
		console.error('Unable to get New Assignments');
		return;
	}

	const oldAssignments = await db.assignments.findMany();

	if (JSON.stringify(oldAssignments) === JSON.stringify(newAssignments)) {
		lastRefresh = Date.now();
		return;
	}

	const diff = compare(oldAssignments, newAssignments);
	if (diff) {
		notifyAll(diff);
	}

	await db.assignments.deleteMany({ where: { id: { in: newAssignments.map((a) => a.id) } } });
	for (const a of newAssignments) {
		await db.assignments.create({
			data: a
		});
	}

	lastRefresh = Date.now();
};

const compare = (oldAssignments: assignments[], newAssignments: Assignment[]) => {
	const diff: Diff[] = [];

	const dueNewAssignments = newAssignments.filter((a) => a.due > Math.round(Date.now() / 1000));

	// Checking for new assignments
	for (const a of dueNewAssignments) {
		if (!oldAssignments.find((b) => b.id === a.id)) {
			diff.push({
				id: a.id,
				name: a.name,
				message: 'was added'
			});
		}
	}

	// Checking for postponed/preponed assignments
	for (const a of dueNewAssignments) {
		const old = oldAssignments.find((b) => b.id === a.id);
		if (!old) continue; // Is a new assignment

		if (a.due !== old.due) {
			diff.push({
				id: a.id,
				name: a.name,
				message: a.due > old.due ? 'was postponed' : 'was preponed'
			});
		}
	}

	// Checking for modified assignments (could be the question, pdf file, also possibly the due date)
	for (const a of dueNewAssignments) {
		const old = oldAssignments.find((b) => b.id === a.id);
		if (!old) continue; // Is a new assignment

		if (
			a.modified !== old.modified &&
			!diff.some((d) => d.id === a.id) // If it was already added to the diff array due to change in due date, don't add it again
		) {
			diff.push({
				id: a.id,
				name: a.name,
				message: 'was modified'
			});
		}
	}

	// We do not care about deleted assignments because it is probably because the assignment is overdue. The chances of an assignment actually being deleted is extremely low.

	return diff.length ? diff : null;
};

export const getLastRefresh = () => lastRefresh;

export interface Diff {
	id: number;
	name: string;
	message: string;
}
