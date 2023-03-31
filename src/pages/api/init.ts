import prisma from '@utils/db';
import kv from '@utils/kv';
import assignments from '@utils/syncAssignments';
import files from '@utils/syncFiles';
import type { NextApiHandler } from 'next';
import { execSync } from 'node:child_process';

const handler: NextApiHandler = async (req, res) => {
	if (kv.get('init')) return res.status(404);
	if (req.method !== 'GET') return res.status(405).end();

	const force = req.query.force as string;

	if (force) {
		await prisma.files.deleteMany();
		execSync('rm -rf ./files/* && mkdir ./files');
	}

	kv.set('init', true);
	await assignments();
	await files();

	res.status(204).end();
};

export default handler;
