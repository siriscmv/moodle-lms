// /lib/passport-google-auth.ts

import { Profile, Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: '/api/auth' // this is the endpoint you registered on google while creating your app. This endpoint would exist on your application for verifying the authentication
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

// passport.serializeUser stores user object passed in the cb method above in req.session.passport
passport.serializeUser((user, cb) => {
	process.nextTick(function () {
		return cb(null, user);
	});
});

// passport.deserializeUser stores the user object in req.user
passport.deserializeUser(function (user: any, cb: (arg0: null, arg1: any) => any) {
	process.nextTick(function () {
		return cb(null, user);
	});
});

// for broader explanation of serializeUser and deserializeUser visit https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

// An article that explains the concept of process.nextTick https://nodejs.dev/learn/understanding-process-nexttick

export default passport;
