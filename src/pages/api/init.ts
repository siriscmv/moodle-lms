import kv from '@utils/kv';
import assignments from '@utils/syncAssignments';
import files from '@utils/syncFiles';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
	if (kv.get('init')) return res.status(404);
	if (req.method !== 'GET') return res.status(405).end();

	kv.set('init', true);
	await assignments();
	await files();

	res.status(204).end();
};

export default handler;
