import { Router } from 'express';
import { CacheHandler, TwitchHandler, TwitterHandler, SteamHandler } from '../../helpers';
import { DiscordAccount } from '../../types/socials/Discord';
import { GithubUser, GithubRepo } from '../../types/socials/Github';
import { Error } from '../../utils';
import axios from 'axios';
const router = Router();

export function run() {
	const DiscordHandler = new CacheHandler();
	const SteamCacheHandler = new SteamHandler({ token: process.env.steam as string });
	const GithubHandler = new CacheHandler();
	const TwitchCacheHandler = new TwitchHandler();
	const TwitterCacheHandler = new TwitterHandler();

	/**
	 * @openapi
	 * /socials/discord:
	 *  get:
	 *    description: Get information on a Discord user
	 *    tags: social
	 *    parameters:
	 *       - name: userId
	 *         description: The ID of the discord user
	 *         required: true
	 *         type: string
	*/
	router.get('/discord', async (req, res) => {
		const userId = req.query.userId as string;

		// validate ID
		if (!(/(\d{17,20})/g.test(userId))) return Error.GenericError(res, 'Invalid user ID');

		let sentData = {};
		if (DiscordHandler.data.get(userId)) {
			sentData = DiscordHandler.data.get(userId) as DiscordAccount;
		} else {
			try {
				const { data } = await axios.get(`https://discord.com/api/v10/users/${req.query.userId}`, {
					headers: {
						Authorization: `Bot ${process.env.discordToken}`,
					},
				});
				const user = new DiscordAccount(data);
				DiscordHandler._addData({ id: `${userId}`, data: user });
				sentData = user;
			} catch (err) {
				if (axios.isAxiosError(err)) {
					res.json({ error: err.response?.data });
				} else {
					console.log(err);
				}
			}
		}

		res.json({ data: sentData });
	});

	/**
	 * @openapi
	 * /socials/github:
	 *  get:
	 *    description: Get information on a Github user or repository
	 *    tags: social
	 *    parameters:
	 *       - name: username
	 *         description: The username of Github user
	 *         required: true
	 *         type: string
	 *       - name: repo
	 *         description: The name of the repository, the user owns.
	 *         required: false
	 *         type: string
	*/
	router.get('/github', async (req, res) => {
		const username = req.query.username as string;
		const repo = req.query.repo as string;
		if (!username) return Error.MissingQuery(res, 'username');

		let sentData = {};
		if (GithubHandler.data.get(`${username}_${repo}`)) {
			sentData = GithubHandler.data.get(`${username}_${repo}`) as object;
		} else {
			try {
				// Check repo or just user
				let obj;
				if (repo.length == 0) {
					const { data } = await axios.get(`https://api.github.com/users/${username}`);
					obj = new GithubUser(data);
				} else {
					const { data } = await axios.get(`https://api.github.com/repos/${username}/${repo}`);
					obj = new GithubRepo(data);
				}

				// Save data to cache
				GithubHandler._addData({ id: `${username}_${repo}`, data: obj });
				sentData = obj;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		res.json({ data: sentData });
	});

	/**
	 * @openapi
   * /socials/steam:
   *  get:
   *    description: Get information on a steam account
   *    tags: socials
   *    parameters:
   *       - name: username
   *         description: The username of the player
   *         required: true
   *         type: string
  */
	router.get('/steam', async (req, res) => {
		// Make sure the API admin has added the steam credentials
		if (process.env.steam?.length == 0) return Error.DisabledEndpoint(res);

		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		let data = {};
		if (SteamCacheHandler.data.get(username)) {
			data = SteamCacheHandler.data.get(username) as object;
		} else {
			try {
				// Convert steam username to steam ID
				const user = await SteamCacheHandler.getUserByUsername(username);
				if (user.message == 'No match') return Error.GenericError(res, 'No steam account with that name');

				// Fetch player data + VAC bans
				const [playerSum, playerBans] = await Promise.all([SteamCacheHandler.getUserSummariesById(user.steamid), SteamCacheHandler.getUserBansById(user.steamid)]);
				data = SteamCacheHandler.createAccount(playerSum, playerBans);
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		// Return the data
		res.json({ data: data });
	});

	/**
	 * @openapi
   * /socials/twitch:
   *  get:
   *    description: Get information on a twitch username
   *    tags: social
   *    parameters:
   *       - name: username
   *         description: The username of the twitch account.
   *         required: true
   *         type: string
  */

	router.get('/twitch', async (req, res) => {
		// Make sure the API admin has added the twitch credentials
		if (process.env.twitchId?.length == 0 || process.env.twitchSecret?.length == 0) return Error.DisabledEndpoint(res);

		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		let sentData = {};
		if (TwitchCacheHandler.data.get(username)) {
			sentData = TwitchCacheHandler.data.get(username) as object;
		} else {
			try {
				const twitchData = await TwitchCacheHandler.getUserByUsername(username);
				if (twitchData == undefined) return Error.GenericError(res, 'Incorrect Username.');

				// Fetch if their streaming + following count
				const [res2, followerCount] = await Promise.all([TwitchCacheHandler.getStreamByUsername(username), TwitchCacheHandler.getFollowersFromId(twitchData.id)]);

				const data = Object.assign(twitchData,
					{ followers: followerCount },
					{ steaming: res2?.viewer_count ? {
						title: res2.title,
						game: res2.game_name,
						started_at: res2.started_at,
						viewer_count: res2.viewer_count,
						is_mature: res2.is_mature,
						thumbnail_url: res2.thumbnail_url,
					} : null });

				TwitchCacheHandler._addData({ id: username, data: data });
				sentData = data;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		res.json({ data: sentData });
	});

	/**
	 * @openapi
   * /socials/twitter:
   *  get:
   *    description: Get information on a twitter username
   *    tags: social
   *    parameters:
   *       - name: username
   *         description: The username of the twitter account.
   *         required: true
   *         type: string
  */
	router.get('/twitter', async (req, res) => {
		const username = req.query.username as string;
		if (!username) return Error.MissingQuery(res, 'username');

		// Fetch user data if user is found
		let sentData = {};
		if (TwitterCacheHandler.data.get(username)) {
			sentData = TwitterCacheHandler.data.get(username) as object;
		} else {
			try {
				const data = await TwitterCacheHandler.fetchUser(username);
				if (data.errors) return Error.GenericError(res, data.errors[0].message);

				TwitterCacheHandler._addData({ id: username, data: data });
				sentData = data;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		res.json({ data: sentData });
	});

	return router;
}
