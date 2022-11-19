import { Router } from 'express';
const router = Router();
import axios from 'axios';
import R6API from '../../helpers/R6API';
import { status } from 'minecraft-server-util';
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
		try {
			const data = await axios.get(`https://api.fortnitetracker.com/v1/profile/${platform}/${encodeURIComponent(username as string)}`, {
				headers: { 'TRN-Api-Key': process.env.fortniteAPI as string },
			});
			res.json(data);
		} catch (err) {
			// check if error is an axios error
			if (axios.isAxiosError(err)) {
				switch (err.response?.status) {
					case (400):
						return console.log('Missing Username or Password');
					case (401):
						return console.log('Unauthorized');
				}
			}
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

	return router;
}
