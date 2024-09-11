import { Router } from 'express';
const router = Router();
import axios from 'axios';
import R6API from 'r6api.js';
import { status } from 'minecraft-server-util';
import { Error } from '../../utils';
import { LeagueHandler } from '../../helpers';
import { R6Account } from '../../types/games/R6';
import { LOLSummoner, LolActiveGame, validRegions } from '../../types/games/LeagueOfLegends';
import type Client from '../../helpers/Client';
const { findByUsername, getRanks, getStats, getProgression } = new R6API({ email: process.env.R6Email, password: process.env.R6Password });

export function run(client: Client) {
	const LeagueCacheHandler = new LeagueHandler({ token: process.env.riotToken as string });

	/**
	 * @openapi
	 * /games/fortnite:
	 *  get:
	 *   description: Get information on a fortnite player
	 *   parameters:
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
		// Make sure the API admin has added the fortnite credentials
		if (process.env.fortniteAPI?.length == 0) return Error.DisabledEndpoint(res);

		const { platform, username } = req.query;
		if (!platform || !username) return Error.MissingQuery(res, username ? 'platform' : 'username');

		try {
			const data = await axios.get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username as string)}`, {
				headers: { 'TRN-Api-Key': process.env.fortniteAPI as string },
			});
			res.json({ data: data });
		} catch (err) {
			client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
			Error.GenericError(res, `Failed to look up ${username}'s fortnite statistics.`);
		}
	});

	/**
	 * @openapi
	 * /games/mc:
	 *  get:
	 *    description: Get information on a minecraft server
	 *    parameters:
	 *       - name: ip
	 *         description: The IP/address of the MC server
	 *         required: true
	 *         type: string
	 *       - name: port
	 *         description: The port that the server runs on.
	 *         required: false
	 *         type: number
	 *         default: 25565
 	 *         minimum: 1
   *         maximum: 65536
	*/
	router.get('/mc', async (req, res) => {
		// Check query paramters
		const ip = req.query.ip as string;
		let port = req.query.port as string;
		if (!ip) return Error.MissingQuery(res, 'ip');

		// Verify port is a number and inbetween 0 and 65535
		if (port) {
			if (Number(port as string)) {
				if (Number(port) <= 0 || Number(port) >= 65536) return Error.InvalidRange(res, 'port', [0, 65535]);
			} else {
				return Error.IncorrectType(res, 'port', 'number');
			}
		}

		// Check if the user accidently added the port to the IP section
		if (ip.split(':').length == 1) port = ip.split(':')?.[1] ?? false;

		try {
			const response = await status(ip.split(':')[0], port ? Number(port) : 25565);
			res.json({ data: response });
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, `Failed to get a response from: ${ip.split(':')[0]}:${port}.`);
		}
	});

	/**
	 * @openapi
	 * /games/r6:
	 *  get:
	 *    description: Get information on a r6 player
	 *    parameters:
	 *       - name: platform
	 *         description: The platform the user plays on
	 *         required: true
	 *         type: string
	 *         enum: [uplay, psn, xbl]
	 *       - name: region
	 *         description: The region of the user
	 *         required: true
	 *         type: string
	 *         enum: [apac, emea, ncsa]
	 *       - name: username
	 *         description: The username of the player
	 *         required: true
	 *         type: string
	*/
	router.get('/r6', async (req, res) => {
		// Make sure the API admin has added the r6 credentials
		if (process.env.R6Email?.length == 0 || process.env.R6Password?.length == 0) return Error.DisabledEndpoint(res);

		// Get the username, platform and region of the player
		const { username, platform, region } = req.query as { [key: string]: any};

		if (!username) return Error.MissingQuery(res, 'username');
		if (!platform) return Error.MissingQuery(res, 'platform');
		if (!region) return Error.MissingQuery(res, 'region');

		// Make sure type is from set
		type platformType = 'uplay' | 'psn' | 'xbl'
		const platformAllowedTypes = ['uplay', 'psn', 'xbl'] as Array<platformType>;
		if (!platformAllowedTypes.includes(platform)) return Error.InvalidValue(res, 'platform', platformAllowedTypes);

		// Make sure type is from set
		type regionType = 'apac' | 'emea' | 'ncsa'
		const regionAllowedTypes = ['apac', 'emea', 'ncsa'] as Array<regionType>;
		if (!regionAllowedTypes.includes(region)) return Error.InvalidValue(res, 'region', regionAllowedTypes);

		// Get basic player info
		const { 0: player } = await findByUsername(platform as platformType, username);
		if (!player) return Error.GenericError(res, `User: ${username} does not exist on that platform (${platform}) or region (${region}).`);

		try {
			// Get player stats
			const [{ 0: playerRank }, { 0: playerStats }, { 0: playerGame }] = await Promise.all([getRanks(platform, player.id),
				getStats(platform, player.id), getProgression(platform, player.id)]);

			const { current, max } = playerRank.seasons[27].regions[region as regionType].boards.pvp_ranked;
			const { pvp, pve } = playerStats;
			const { level, xp } = playerGame;

			const data = new R6Account({
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
			});

			res.json({ data: data });
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, `Failed to fetch ${username} R6 user statistics.`);
		}
	});

	/**
	 * @openapi
	 * /games/league-of-legends:
	 *  get:
	 *    description: Get information on a league of legends player
	 *    parameters:
	 *       - name: name
	 *         description: The username of the player
	 *         required: true
	 *         type: string
	 *       - name: region
	 *         description: The region of the user
	 *         required: true
	 *         type: string
	 *         enum: [BR1, EUN1, EUW1, JP1, KR, LA1, LA2, NA1, OC1, PH2, RU, SG2, TH2, TR1, TW2, VN2]
	*/
	router.get('/league-of-legends', async (req, res) => {
		const username = req.query.name as string;
		const region = req.query.region as string;

		// Validate region input
		const regionAllowedTypes = ['BR1', 'EUN1', 'EUW1', 'JP1', 'KR', 'LA1', 'LA2', 'NA1', 'OC1', 'PH2', 'RU', 'SG2', 'TH2', 'TR1', 'TW2', 'VN2'];
		if (!regionAllowedTypes.includes(region)) return Error.InvalidValue(res, 'region', regionAllowedTypes);

		// Fetch summoner details from cache or API (Don't cache activeGame as that can change frequently)
		let summoner = {} as LOLSummoner;
		if (LeagueCacheHandler.data.get(`${region}_${username}`)) {
			summoner = LeagueCacheHandler.data.get(`${region}_${username}`) as LOLSummoner;
		} else {
			// Fetch summoner information
			try {
				summoner = await LeagueCacheHandler.getSummonerByUsername(region as validRegions, username);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					// Create the notification
					client.NotificationManager.create({
						header: 'RIOT API failed to respond correctly.',
						content: `${JSON.stringify(err.response?.data)}`,
					});
				}
				client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
				return Error.GenericError(res, `Failed to find summoner with name ${username} in region ${region}.`);
			}
		}

		// Fetch active game if summoner is in one.
		let activeGame = {} as LolActiveGame;
		try {
			activeGame = await LeagueCacheHandler.getActiveGameByUsername(region as validRegions, summoner.id);
		} catch (err) {
			if (axios.isAxiosError(err)) client.Logger.error(JSON.stringify(err.response?.data));
		}

		// Create object for showing data
		const data = LeagueCacheHandler.createAccount(summoner, activeGame.gameId == null ? undefined : activeGame);
		LeagueCacheHandler._addData({ id: `${summoner.name}`, data: data });

		res.json({ data: data });
	});

	return router;
}
