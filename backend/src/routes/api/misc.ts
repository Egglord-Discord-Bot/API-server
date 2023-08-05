import { Router } from 'express';
const router = Router();
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { Error } from '../../utils';
import * as fs from 'fs';
import { DuckDuckGoHandler } from '../../helpers';
import validAnimals from '../../assets/JSON/animals.json';
import adviceList from '../../assets/JSON/advice.json';
import QRcode from 'qrcode';
import { PassThrough } from 'stream';
import type Client from '../../helpers/Client';

export function run(client: Client) {
	/**
		* @openapi
		* /misc/advice:
		*  get:
		*    description: Get some advice
	*/
	router.get('/advice', async (_req, res) => {
		try {
			const advice = adviceList[Math.floor((Math.random() * adviceList.length))];
			res.json({ data: advice });
		} catch (err: any) {
			client.Logger.error(err.message);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /misc/animal:
	 *  get:
	 *    description: Get a link to a picture of an animal
	 *    tags: misc
	 *    parameters:
	 *       - name: name
	 *         description: The name of animal
	 *         required: true
	 *         type: string
	*/
	router.get('/animal', async (req, res) => {
		let name = req.query.name as string;

		// IF no animal was mentioned then do a random animal
		if (!name) {
			name = validAnimals[Math.floor(Math.random() * validAnimals.length)];
		} else if (!validAnimals.includes(name)) {
			// Make sure the animal specifed is valid
			return Error.InvalidValue(res, 'name', validAnimals);
		}

		// Search for animal picture
		try {
			const DuckDuckGoCacheHandler = new DuckDuckGoHandler();
			const results = await DuckDuckGoCacheHandler.search(name);

			res.json({ data: results.slice(0, 10) });
		} catch (err) {
			client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
			Error.GenericError(res, 'Failed to search for images');
		}

	});

	router.get('/animal/raw', (_req, res) => {
		// Just return the array of all valid animals
		res.json({ data: validAnimals });
	});

	/**
	 * @openapi
	 * /misc/pokemon:
	 *  get:
	 *    description: Get information on a pokemon
	 *    tags: misc
	 *    parameters:
	 *       - name: pokemon
	 *         description: The name of the pokemon
	 *         required: true
	 *         type: string
	 */
	router.get('/pokemon', async (req, res) => {
		const pokemon = req.query.pokemon as string;
		if (!pokemon) return Error.MissingQuery(res, 'pokemon');

		try {
			const advice = await axios.get(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`);
			res.json({ data: advice.data });
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /misc/get-text:
	 *  get:
	 *    description: Update a users information
	 *    tags: misc
	 *    parameters:
	 *       - name: url
	 *         description: The URL of the image to extract text from.
	 *         required: true
	 *         type: string
	 */
	router.get('/get-text', async (req, res) => {
		const url = req.query.url as string;
		if (!url) return Error.MissingQuery(res, 'url');

		// Extract text from the image provided
		try {
			const { data } = await Tesseract.recognize(url, 'eng');
			if (!data.text) {
				res.json({ error: 'No text was found!' });
			} else {
				res.json({ data: data.text });
			}
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /misc/random-fact:
	 *  get:
	 *    description: Get a random fact
	 *    tags: misc
	 */
	router.get('/random-fact', async (_req, res) => {
		fs.readFile('./src/assets/JSON/random-facts.json', async (err, data) => {
			if (err) return Error.GenericError(res, err.message);

			const { facts } = JSON.parse(data.toString());
			const num = Math.floor((Math.random() * facts.length));

			res.json({ data: facts[num] });
		});
	});

	/**
	 * @openapi
	 * /misc/qrcode:
	 *  get:
	 *    description: Create a QR code based on the URL
	 *    tags: misc
	 *    parameters:
	 *       - name: url
	 *         description: The URL for the Qrcode to be created from
	 *         required: true
	 *         type: string
	 */
	router.get('/qrcode', async (req, res) => {
		const url = req.query.url as string;
		if (!url) return Error.MissingQuery(res, 'url');

		const qrStream = new PassThrough();
		await QRcode.toFileStream(qrStream, url, {
			type: 'png',
			width: 250,
			errorCorrectionLevel: 'H',
		});
		res.set('Content-Disposition', 'inline; filename=qrcode.png');
		res.setHeader('content-type', 'image/png');
		qrStream.pipe(res);
	});

	return router;
}
