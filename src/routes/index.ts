import { Router } from 'express';
const router = Router();
import passport from 'passport';
import { Strategy } from 'passport-discord';
import config from '../config';
import { fetchUser, createUser } from '../database/User';
import { fetchEndpointUsagesPerUser } from '../database/endpointUsage';
import type { Profile } from 'passport-discord';

export default function() {
	// Works in background for user storage
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((obj, done) => {
		done(null, obj as false);
	});

	// Discord Ouath2 data
	passport.use(new Strategy({
		clientID: config.bot.id,
		clientSecret:config.bot.clientSecret,
		callbackURL: 'http://localhost:4500/callback',
		scope: ['identify'],
	}, (_accessToken, _refreshToken, profile, done) => {
		process.nextTick(() => done(null, profile));
	}));

	// home page
	router.get('/', async (req, res) => {
		res.render('index', {
			user: req.isAuthenticated() ? req.user : null,
		});
	});

	// login page
	router.get('/login', (_req, _res, next) => {
		// Forward the request to the passport middleware.
		next();
	}, passport.authenticate('discord'));

	// Gets login details
	router.get('/callback', passport.authenticate('discord', {
		failureRedirect: '/',
	}), (_req, res) => {
		res.redirect('/');
	});

	// Logout the user
	router.get('/logout', (req, res) => {
		req.logout(() => null);
		res.redirect('/');
	});

	router.get('/settings', async (req, res) => {
		// Make sure the person trying to connect is logged in
		if (!req.isAuthenticated()) return res.redirect('/login');

		// Create the user if one doesn't exist already
		let user = await fetchUser({ id: (req.user as Profile).id });
		if (!user) user = await createUser({ id: (req.user as Profile).id });
		user = Object.assign(req.user, user);
		const history = await fetchEndpointUsagesPerUser({ id: (req.user as Profile).id });
		// Render the page
		res.render('settings', {
			user, history,
		});
	});


	return router;
}
