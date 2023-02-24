import start from '@utils/syncAssignments';
import type { NextApiHandler } from 'next';

let initialised = false;

const handler: NextApiHandler = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).end();
	if (initialised) return res.status(401);

	initialised = true;
	res.status(204).end();

	await start();
};

export default handler;
