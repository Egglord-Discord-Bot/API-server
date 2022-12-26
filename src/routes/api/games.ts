import { Router } from 'express';
const router = Router();
import axios from 'axios';
// import R6API from '../../helpers/R6API';
import { status } from 'minecraft-server-util';
import Error from '../../utils/Errors';
// const R6Handler = new R6API({ email: process.env.R6Email, password: process.env.R6Password });

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
	router.get('/r6', async (_req, res) => {
		// console.log(await R6Handler.findByUsername('5172a557-50b5-4665-b7db-e3f2e8c5041d', 'ThatGingerGuy02'));
		res.json({ error: 'Coming soon' });
	});

	return router;
}
