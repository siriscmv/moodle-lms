import type { Assignment } from '@utils/getAssignments';
import { Client } from '@notionhq/client';
import courses from '@utils/courses';

const notion = new Client({
	auth: process.env.NOTION_TOKEN
});

export default async function sync(newAssignments: Assignment[]) {
	const existing = (await notion.databases.query({ database_id: process.env.NOTION_DATABASE! })).results.map(
		(r) => r.id
	);

	for (const e of existing) {
		await notion.pages.update({
			page_id: e,
			archived: true
		});

		await delay(500);
	}

	for (const a of newAssignments) {
		await notion.pages.create({
			parent: {
				type: 'database_id',
				database_id: process.env.NOTION_DATABASE!
			},
			properties: {
				Name: {
					title: [
						{
							text: {
								content: a.name,
								link: { url: `https://${process.env.NEXT_PUBLIC_HOST!}/mod/assign/view.php?id=${a.id}` }
							}
						}
					]
				},
				Course: {
					rich_text: [
						{
							text: {
								content: courses[a.course]
							}
						}
					]
				},
				Due: {
					number: a.due
				},
				ID: {
					number: a.id
				}
			}
		});

		await delay(500);
	}
}

const delay = (time: number) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};
