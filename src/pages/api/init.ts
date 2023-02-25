import assignments from '@utils/syncAssignments';
import files from '@utils/syncFiles';
import type { NextApiHandler } from 'next';

let initialised = false;

const handler: NextApiHandler = async (req, res) => {
	if (initialised) return res.status(404);
	if (req.method !== 'GET') return res.status(405).end();

	initialised = true;
	await assignments();
	await files();

	res.status(204).end();
};

export default handler;
