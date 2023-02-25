import db from '@utils/db';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();

	const course = req.query.course as string;
	if (!course) return res.status(400).end();

	const files = await db.files.findMany({
		where: {
			course: parseInt(course)
		}
	});

	res.status(200).json({ files });
};

export default handler;
