const { Router } = require('express'),
	router = Router(),
	{ fortniteAPI, rainbow } = require('../config'),
	{ status } = require('minecraft-server-util'),
	R6API = require('r6api.js').default,
	{ findByUsername, getProgression, getRanks, getStats } = new R6API({ email: rainbow.email, password: rainbow.password }),
	fetch = require('node-fetch');

// Get random advice
router.get('/fortnite', async (req, res) => {
	const { platform, username } = req.query;
	try {
		const data = await fetch(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username)}`, {
			headers: { 'TRN-Api-Key': fortniteAPI },
		}).then(r => r.json());
		res.json(data);
	} catch (err) {
		res.json({ error: err.message });
	}
});

router.get('/mc', async (req, res) => {
	const { IP } = req.query;
	try {
		const response = await status(IP);
		res.json(response);
	} catch (err) {
		res.json({ error: err.message });
	}
});

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


module.exports = router;
