import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from '@utils/passport';

export default nextConnect().get(
	passport.authenticate('google', { session: false }),
	(req: NextApiRequest & { user: any }, res: NextApiResponse) => {
		res.setHeader('Set-Cookie', `auth=${process.env.AUTH_COOKIE!}; Secure; HttpOnly; Max-Age=${7 * 24 * 60 * 60}`);
		res.redirect('/');
	}
);
