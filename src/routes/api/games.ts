import { Router } from 'express';
const router = Router();
import axios from 'axios';
import R6API from '../../helpers/R6API';
import { status } from 'minecraft-server-util';
import CacheHandler from '../../helpers/CacheHandler';
const R6Handler = new R6API({ email: process.env.R6Email, password: process.env.R6Password });

export default function() {
	/**
	 * @API
	 * /games/fortnite:
	 *   get:
	 *     description: Get information on a fortnite player
	 *     tags: games
	 *			parameters:
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

		if (!platform || !username) return res.json({ error: 'Error' });

		try {
			console.log(process.env.fortniteAPI);
			const data = await axios.get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username as string)}`, {
				headers: { 'TRN-Api-Key': process.env.fortniteAPI as string },
			});
			res.json(data);
		} catch (err) {
			console.log(err);
			// check if error is an axios error
			res.json(err);
		}
	});

	/**
	 * @API
	 * /games/mc:
	 *   get:
	 *     description: Get information on a minecraft server.
	 *     tags: games
	 *			parameters:
	 *       - name: IP
	 *         description: The IP/address of the MC server
	 *         required: true
	 *         type: string
	 *       - name: port
	 *         description: The port that the server runs on.
	 *         required: false
	 *         type: string
	*/
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
	router.get('/r6', async () => {
		console.log(await R6Handler.findByUsername('5172a557-50b5-4665-b7db-e3f2e8c5041d', 'ThatGingerGuy02'));
	});

	/**
	 * @API
	 * /games/steam:
	 *   get:
	 *     description: Get information on a steam account
	 *     tags: games
	 *			parameters:
	 *       - name: platform
	 *         description: The platform, the user uses
	 *         required: true
	 *         type: string
	 *       - name: username
	 *         description: The username of the player
	 *         required: true
	 *         type: string
	*/
	const SteamHandler = new CacheHandler();
	router.get('/steam', async (req, res) => {
		const username = req.query.username as string;

		let data = {};
		if (SteamHandler.data.get(username)) {
			data = SteamHandler.data.get(username) as object;
		} else {
			try {
				// Convert steam username to steam ID
				const { response } = (await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.steam}&vanityurl=${username}`)).data;
				if (response.message == 'No match') return res.json({ error: 'No steam account with that name' });

				// Fetch player data + VAC bans
				const [{ data: { response: data1 } }, { data: data2 }] = await Promise.all([
					axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.steam}&steamids=${response.steamid}`),
					axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${process.env.steam}&steamids=${response.steamid}`),
				]);

				data = {
					id: data1.players[0].steamid,
					url: data1.players[0].profileurl,
					realname: data1.players[0].realname,
					avatar: data1.players[0].avatarfull,
					createdAt: data1.players[0].timecreated,
					CommunityBanned: data2.players[0].CommunityBanned,
					VACBanned: data2.players[0].VACBanned,
					NumberOfVACBans: data2.players[0].NumberOfVACBans,
					DaysSinceLastBan: data2.players[0].DaysSinceLastBan,
					NumberOfGameBans: data2.players[0].NumberOfGameBans,
				};
				SteamHandler._addData({ id: username, data: data });
			} catch (err) {
				console.log(err);
				data = { error: 'Error' };
			}
		}

		// Return the data
		res.json(data);
	});

	return router;
}
