import { Router } from 'express';
const router = Router();
import axios from 'axios';
import type { AxiosError } from 'axios';
import R6API from 'r6api.js';
import { status } from 'minecraft-server-util';
const { findByUsername, getProgression, getRanks, getStats } = new R6API({ email: process.env.R6Email, password: process.env.R6Password });

export default function() {
	router.get('/fortnite', async (req, res) => {
		const { platform, username } = req.query;
		try {
			const data = await axios.get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username as string)}`, {
				headers: { 'TRN-Api-Key': process.env.fortniteAPI as string },
			});
			res.json(data);
		} catch (err: unknown | Error | AxiosError) {
			console.log(err);
		}
	});

	router.get('/mc', async (req, res) => {
		if (!req.query.IP) return res.json({ error: 'Missing parameter: IP.' });
		try {
			const response = await status(req.query.IP as string);
			res.json(response);
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/r6', async (req, res) => {
		type Platform = 'xbl' | 'uplay' | 'psn';
		let { player } = req.query;
		const { platform } = req.query;
		if (platform === 'xbl') player = (player as string).replace('_', '');

		let foundPlayer;
		try {
			foundPlayer = await findByUsername(platform as Platform, player as string);
		} catch (err: any) {
			return res.json({ error: err.message });
		}
		// Makes sure that user actually exist
		if (foundPlayer.length == 0) res.json({ error: 'No player found.' });

		// get statistics of player
		try {
			const [playerRank, playerStats, playerGame] = await Promise.all([getRanks(platform as Platform, foundPlayer[0].id), getStats(platform as Platform, foundPlayer[0].id), getProgression(platform as Platform, foundPlayer[0].id)]);
			res.json(Object.assign(playerRank, playerGame, playerStats));
		} catch (err: any) {
			console.log(err);
			res.json({ err: err.message });
		}
	});

	return router;
}
