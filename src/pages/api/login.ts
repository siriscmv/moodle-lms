import passport from '@utils/passport';
import nextConnect from 'next-connect';

export default nextConnect()
	.use(passport.initialize())
	.get(
		passport.authenticate('google', {
			scope: ['profile', 'email']
		})
	);
