import { Strategy } from 'passport-discord';
import type { Profile } from 'passport-discord';
import { fetchUser, createUser } from '../database/User';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
import type { VerifyCallback } from 'passport-oauth2';

export default function(passport: any) {
	// Discord Oauth2 data
	passport.use(new Strategy({
		clientID: process.env.discordBotId as string,
		clientSecret: process.env.discordBotClientSecret as string,
		callbackURL: 'http://localhost:4500/callback',
		scope: ['identify'],
	}, async (_accessToken, _refreshToken, profile, done) => {
		// See if they have connected before (if not create the account)
		try {
			let user = await fetchUser(profile.id);
			if (!user) {
				user = await createUser({ id: profile.id, token: new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate() });
			}
			profile = Object.assign(profile, { token: user.token });
			return done(null, profile);
		} catch (err) {
			return done(null, false);
		}
	}));

	// serialize the user (Log them in)
	passport.serializeUser((user: Profile, done: VerifyCallback) => {
		done(null, user);
	});

	// deserialize the user (Log them out)
	passport.deserializeUser((obj: Profile, done: VerifyCallback) => {
		done(null, obj);
	});
}
