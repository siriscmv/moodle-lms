import assignments from '@utils/syncAssignments';
import files from '@utils/syncFiles';
import type { NextApiHandler } from 'next';

let initialised = false;

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();
	if (initialised) return res.status(401);

	initialised = true;
	res.status(204).end();

	await assignments();
	await files();
};

export default handler;
