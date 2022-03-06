const { Router } = require('express'),
	router = Router(),
	{ fortniteAPI, rainbow } = require('../config'),
	{ status } = require('minecraft-server-util'),
	R6API = require('r6api.js').default,
	Profile = require('../utils/classes'),
	{ findByUsername, getProgression, getRanks, getStats } = new R6API({ email: rainbow.email, password: rainbow.password }),
	platforms = { pc: 5, xbox: 1, psn: 2 },
	fetch = require('node-fetch');

/**
  * GET /games/fortnite
  * @summary Endpoint for fetching fortnite accounts
	* @tags Games
	* @param {string} platform.query.required - The platform the user is on
	* @param {string} username.query.required - The username of the account.
  * @return {Profile} 200 - success response - application/json
*/
router.get('/fortnite', async (req, res) => {
	const { platform, username } = req.query;
	try {
		const data = await fetch(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username)}`, {
			headers: { 'TRN-Api-Key': fortniteAPI },
		}).then(r => r.json());
		res.json(new Profile(data));
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /games/mc
  * @summary Minecraft
	* @tags Games
	* @param {string} IP.query.required - name param description
  * @return {object} 200 - success response - application/json
*/
router.get('/mc', async (req, res) => {
	const { IP } = req.query;
	try {
		const response = await status(IP);
		res.json(response);
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /games/r6
  * @summary Minecraft
	* @tags Games
	* @param {string} platform.query.required - name param description
	* @param {string} player.query.required - name param description
  * @return {object} 200 - success response - application/json
*/
router.get('/r6', async (req, res) => {
	let { platform, player } = req.query;
	if (platform === 'xbl') player = player.replace('_', '');

	try {
		player = await findByUsername(platform, player);
	} catch (err) {
		return res.json({ error: err.message });
	}

	// Makes sure that user actually exist
	if (!player.length) res.json({ error: 'No player found.' });

	// get statistics of player
	player = player[0];
	let playerRank, playerStats, playerGame;
	try {
		playerRank = await getRanks(platform, player.id);
		playerStats = await getStats(platform, player.id);
		playerGame = await getProgression(platform, player.id);
		res.json(Object.assign(playerRank, playerGame, playerStats));
	} catch (err) {
		res.json({ err: err.message });
	}
});

/**
  * GET /games/apex
  * @summary Minecraft
	* @tags Games
	* @param {string} platform.query.required - name param description
	* @param {string} username.query.required - name param description
  * @return {object} 200 - success response - application/json
*/
router.get('/apex', async (req, res) => {
	const { platform, username } = req.query;

	// Get platform
	const pltm = platforms[platform.toLowerCase()];
	if (!pltm) return res.json({ error: 'There\'s are the available platforms: px, xbox, psn' });

	// Get username
	if (!username) return res.json({ error: 'Missing username.' });

	// Fetch apex data
	const data = await fetch(`https://public-api.tracker.gg/apex/v1/standard/profile/${pltm}/${encodeURIComponent(username)}`, {
		headers: { 'TRN-Api-Key': fortniteAPI },
	}).then(r => r.json());

	res.json(data);
});
module.exports = router;
