import { Router } from 'express';
const router = Router();
import passport from 'passport';
import { fetchEndpointUsagesPerUser } from '../database/userHistory';
import { updateUser } from '../database/User';
import type { Profile } from 'passport-discord';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
import { fetchEndpointData } from '../database/endpointData';
import build from '../helpers/RouteParser';

export default function() {

	// home page
	router.get('/', async (req, res) => {
		res.render('index', {
			user: req.isAuthenticated() ? req.user : null,
		});
	});

	// login page
	router.get('/login', passport.authenticate('discord'));

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

		// Render the page
		const history = await fetchEndpointUsagesPerUser((req.user as Profile).id);
		res.render('settings', {
			user: req.user, history,
		});
	});

	router.patch('/settings', async (req, res) => {
		// Updating/Changing the user's token
		try {
			await updateUser({ id: (req.user as Profile).id, newToken: new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate() });
			res.json({ success: 'Success' });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	router.get('/docs', async (req, res) => {
		const endpoints = await fetchEndpointData();
		const endpointData = build();
		res.render('endpoints', {
			user: req.isAuthenticated() ? req.user : null,
			endpoints, endpointData,
		});
	});

	return router;
}
