import db from '@db';
import type { assignments } from '@prisma/client';
import { schedule } from 'node-cron';
import notifyAll from '@utils/notifications';
import login, { defaultHeaders } from '@utils/login';
import fetch from 'node-fetch';

export let lastRefresh: null | number = null;

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

export interface Assignment {
	id: number;
	name: string;
	due: number;
	modified: number;
	course: number;
}

export async function getAssignments() {
	const creds = await login();
	const dates = getMonths();

	const assignments: Assignment[] = [];
	let isSuccess = true;

	for (const date of dates) {
		try {
			//@ts-ignore
			const res = (
				await (
					await fetch(
						`https://${process.env.NEXT_PUBLIC_HOST}/lib/ajax/service.php?sesskey=${encodeURIComponent(
							creds.sessionKey
						)}&info=core_calendar_get_calendar_monthly_view`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Cookie: creds.cookie,
								...defaultHeaders
							},
							body: JSON.stringify([
								{
									index: 0,
									methodname: 'core_calendar_get_calendar_monthly_view',
									args: { year: date.year, month: date.month, courseid: 1, day: 1, view: 'monthblock' }
								}
							])
						}
					)
				).json()
			)[0] as any;

			assignments.push(
				...res.data.weeks
					.map((w: any) =>
						w.days?.map((d: any) =>
							d.events
								?.filter((e: any) => e.eventtype === 'due')
								.map((e: any) => ({
									id: e.instance,
									name: e.activityname,
									due: e.timestart,
									modified: e.timemodified,
									course: e.course.id
								}))
						)
					)
					.flat(10)
			);
		} catch (_) {
			isSuccess = false;
			break;
		}
	}

	if (!isSuccess) return false;

	return assignments;
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

export interface Diff {
	id: number;
	name: string;
	message: string;
}

const getMonths = () => {
	const date = new Date();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return [
		{ year: month === 1 ? year - 1 : year, month: month === 1 ? 12 : month - 1 },
		{ year, month },
		{ year: month === 12 ? year + 1 : year, month: month === 12 ? 1 : month + 1 }
	];
};
