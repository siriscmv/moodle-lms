import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: process.env.CB_URL
		},
		async (_accessToken, _refreshToken, profile, cb: any) => {
			const allowedToAccess = profile.emails?.some(
				(e) => e.verified && e.value.split('@')[1] === process.env.EMAIL_DOMAIN!
			);
			if (allowedToAccess) return cb(null, profile);
			else throw new Error('Not a valid email');
		}
	)
);

passport.serializeUser((user, cb) => {
	process.nextTick(function () {
		return cb(null, user);
	});
});

passport.deserializeUser(function (user: any, cb: (arg0: null, arg1: any) => any) {
	process.nextTick(function () {
		return cb(null, user);
	});
});

export default passport;
