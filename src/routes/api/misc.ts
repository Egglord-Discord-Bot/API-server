import { Router } from 'express';
const router = Router();
// import Puppeteer from 'puppeteer';
import Image from '../../helpers/Image';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import Error from '../../utils/Errors';
import * as fs from 'fs';

export default function() {
	/**
	 * @API
	 * /misc/advice:
	 *   get:
	 *     description: Get some advice
	 *     tags: misc
	*/
	router.get('/advice', async (_req, res) => {
		try {
			const advice = await axios.get('https://api.adviceslip.com/advice');
			res.json({ data: advice.data.slip.advice });
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @API
	 * /misc/pokemon:
	 *   get:
	 *     description: Get a pokemon's stats
	 *     tags: misc
	 *			parameters:
	 *       - name: pokemon
	 *         description: The pokemon
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

	/*
	router.get('/screenshot', chechAuth, async (req, res) => {
		const { url } = req.query;
		try {
			console.log(url);
			const browser = await Puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
			const page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 720 });
			await page.goto(url as string);
			await new Promise(r => setTimeout(r, 1500));
			const data = await page.screenshot();
			await browser.close();
			res.json({ success: data });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});
	*/

	/**
	 * @API
	 * /misc/colour:
	 *   get:
	 *     description: Update a users information
	 *     tags: misc
	 *			parameters:
	 *       - name: colour
	 *         description: The colour of the square
	 *         required: true
	 *         type: string
	 */
	router.get('/colour', async (req, res) => {
		const colour = req.query.colour as string;
		if (!colour) return Error.MissingQuery(res, 'colour');

		try {
			const img = await Image.square(colour);
			res.json({ data: img.toString() });
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @API
	 * /misc/get-text:
	 *   get:
	 *     description: Update a users information
	 *     tags: misc
	 *			parameters:
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
	 * @API
	 * /misc/random-fact:
	 *   get:
	 *     description: Get a random fact
	 *     tags: misc
	 */
	router.get('/random-fact', async (_req, res) => {
		fs.readFile('./src/assets/json/random-facts.json', async (err, data) => {

			if (err) return Error.GenericError(res, err.message);

			const { facts } = JSON.parse(data.toString());
			const num = Math.floor((Math.random() * facts.length));

			res.json({ data: facts[num] });
		});
	});

	return router;
}
