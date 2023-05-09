import { Router } from 'express';
const router = Router();
import axios from 'axios';
import R6API from 'r6api.js';
import { status } from 'minecraft-server-util';
import Error from '../../utils/Errors';
const { findByUsername, getRanks, getStats, getProgression } = new R6API({ email: process.env.R6Email, password: process.env.R6Password });

export default function() {
	/**
	 * @API
	 * /games/fortnite:
	 *   get:
	 *     description: Get information on a fortnite player
	 *     tags: games
	 *		 responses:
	 *				'200':
	 *					- Schema:	FortnitePlayer
	 *		 parameters:
	 *       - name: platform
	 *         description: The platform, the user uses
	 *         required: true
	 *         type: string
	 *       - name: username
	 *         description: The username of the player
	 *         required: true
	 *         type: string
	*/
	router.get('/fortnite', async (req, res) => {
		const { platform, username } = req.query;

		if (!platform || !username) return Error.MissingQuery(res, username ? 'platform' : 'username');

		try {
			const data = await axios.get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username as string)}`, {
				headers: { 'TRN-Api-Key': process.env.fortniteAPI as string },
			});
			res.json({ data: data });
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @API
	 * /games/mc:
	 *   get:
	 *     description: Get information on a minecraft server.
	 *     tags: games
	 *			parameters:
	 *       - name: ip
	 *         description: The IP/address of the MC server
	 *         required: true
	 *         type: string
	 *       - name: port
	 *         description: The port that the server runs on.
	 *         required: false
	 *         type: string
	*/
	router.get('/mc', async (req, res) => {
		// Check query paramters
		const ip = req.query.ip as string;
		const port = req.query.port as string;

		if (!ip) return Error.MissingQuery(res, 'ip');

		if (port) {
			if (Number(port as string)) {
				if (Number(port) <= 0 || Number(port) >= 65536) return Error.InvalidRange(res, 'port', [0, 65535]);
			} else {
				return Error.IncorrectType(res, 'port', 'number');
			}
		}

		try {
			const response = await status(ip as string, port ? Number(port) : 25565);
			res.json({ data: response });
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @API
	 * /games/r6:
	 *   get:
	 *     description: Get information on a r6 player
	 *     tags: games
	 *			parameters:
	 *       - name: platform
	 *         description: The ID of the user
	 *         required: true
	 *         type: string
	 *       - name: username
	 *         description: The ID of the user
	 *         required: true
	 *         type: string
	*/
	router.get('/r6', async (req, res) => {
		// Make sure the API admin has added the r6 credentials
		if (process.env.R6Email?.length == 0 || process.env.R6Password?.length == 0) return Error.DisabledEndpoint(res);

		// Get the username, platform and region of the player
		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		const platform = req.query.platform as string;
		if (!platform) return Error.MissingQuery(res, 'platform');

		const region = req.query.region as string;
		if (!region) return Error.MissingQuery(res, 'region');

		// Make sure type is from set
		type platformType = 'uplay' | 'psn' | 'xbl'
		const platformAllowedTypes = ['uplay', 'psn', 'xbl'];
		if (!platformAllowedTypes.includes(platform)) return Error.InvalidValue(res, 'type', platformAllowedTypes);

		// Make sure type is from set
		type regionType = 'apac' | 'emea' | 'ncsa'
		const regionAllowedTypes = ['uplay', 'psn', 'xbl'];
		if (!regionAllowedTypes.includes(platform)) return Error.InvalidValue(res, 'type', regionAllowedTypes);

		const { 0: player } = await findByUsername(platform as platformType, username);
		if (!player) return res.json({ error: 'sdfdsdfs' });

		const [{ 0: playerRank }, { 0: playerStats }, { 0: playerGame }] = await Promise.all([getRanks(platform as platformType, player.id), getStats(platform as platformType, player.id), getProgression(platform as platformType, player.id)]);

		const { current, max } = playerRank.seasons[27].regions[region as regionType].boards.pvp_ranked;
		const { pvp, pve } = playerStats;
		const { level, xp } = playerGame;
		res.json({ data: {
			id: player.userId,
			username: player.username,
			platform: player.platform,
			profileURL: player.avatar[500],
			rank: {
				current: {
					name: current.name,
					mmr: current.mmr,
				},
				max: {
					name: max.name,
					mmr: max.mmr,
				},
			},
			pvp: pvp.general, pve: pve.general, level, xp,
		} });
	});

	return router;
}
