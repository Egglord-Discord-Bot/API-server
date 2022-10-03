import { Router } from 'express';
const router = Router();
import Puppeteer from 'puppeteer';
import { createCanvas } from 'canvas';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { chechAuth } from '../utils/middleware';

export default function() {
	router.get('/advice', chechAuth, async (_req, res) => {
		try {
			const advice = await axios.get('https://api.adviceslip.com/advice');
			res.json({ success: advice.data.slip.advice });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	router.get('/pokemon', chechAuth, async (req, res) => {
		const { pokemon } = req.query;
		try {
			const advice = await axios.get(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`);
			res.json(advice.data);
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

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

	router.get('/colour', chechAuth, (req, res) => {
		if (!req.query.colour) return res.json({ error: 'Missing colour query' });
		try {
			const canvas = createCanvas(200, 200),
				context = canvas.getContext('2d');
			context.fillStyle = req.query.colour as string;
			context.fillRect(0, 0, 200, 200);
			res.json({ success: canvas.toBuffer('image/png') });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	router.get('/get-text', chechAuth, async (req, res) => {
		if (!req.query.url) return res.json({ error: 'Missing URL query' });

		// Extract text from the image provided
		try {
			const { data } = await Tesseract.recognize(req.query.url as string, 'eng');
			if (!data.text) {
				res.json({ error: 'No text was found!' });
			} else {
				res.json({ text: data.text });
			}
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	return router;

}
