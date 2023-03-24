import db from '@utils/db';
import type { NextApiHandler } from 'next';
import { readFile } from 'node:fs/promises';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();

	const id = req.query.id as string;
	if (!id) return res.status(400).end();

	const file = await db.files.findUnique({
		where: {
			id: parseInt(id)
		}
	});

	if (!file) return res.status(404).end();

	const resource = await readFile(`./files/${file.id}.${file.ext}`);

	res.setHeader('Content-Type', `application/${file.ext}`);
	res.setHeader('Content-Disposition', `inline; filename="${file.name}.${file.ext}"`);
	res.setHeader('Cache-Control', 'public, max-age=86400');
	res.send(resource);
};

export default handler;

export const config = {
	api: {
		responseLimit: false
	}
};
