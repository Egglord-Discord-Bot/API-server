const { Router } = require('express'),
	router = Router(),
	Puppeteer = require('puppeteer'),
	{ createCanvas } = require('canvas'),
	Tesseract = require('tesseract.js'),
	fetch = require('node-fetch');

/**
  * GET /misc/advice
  * @summary Endpoint for fetching fortnite accounts
	* @tags Misc
  * @return {object} 200 - success response - application/json
*/
router.get('/advice', async (req, res) => {
	try {
		const advice = await fetch('https://api.adviceslip.com/advice').then(data => data.json());
		res.json({ success: advice.slip.advice });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /misc/pokemon
  * @summary Endpoint for fetching fortnite accounts
	* @tags Misc
	* @param {string} pokemon.query.required - The name of the pokemon
  * @return {object} 200 - success response - application/json
*/
router.get('/pokemon', async (req, res) => {
	const { pokemon } = req.query;
	try {
		const advice = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`).then(info => info.json());
		res.json({ success: advice.slip.advice });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /misc/screenshot
  * @summary Endpoint for fetching fortnite accounts
	* @tags Misc
	* @param {string} URL.query.required - The URL of the website.
  * @return {Buffer} 200 - success response - application/json
*/
router.get('/screenshot', async (req, res) => {
	const { URL } = req.query;
	try {
		const browser = await Puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 720 });
		await page.goto(URL);
		await new Promise(r => setTimeout(r, 1500));
		const data = await page.screenshot();
		await browser.close();
		res.json({ success: data });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /misc/colour
  * @summary Endpoint for fetching fortnite accounts
	* @tags Misc
	* @param {string} colour.query.required - The URL of the website.
  * @return {Buffer} 200 - success response - application/json
*/
router.get('/colour', (req, res) => {
	if (!req.query.colour) return res.json({ error: 'Missing colour query' });
	try {
		const canvas = createCanvas(200, 200),
			context = canvas.getContext('2d');
		context.fillStyle = req.query.colour;
		context.fillRect(0, 0, 200, 200);
		res.json({ success: canvas.toBuffer('image/png') });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /misc/get-text
  * @summary Endpoint for fetching fortnite accounts
	* @tags Misc
	* @param {string} url.query.required - The url of the image
  * @return {string} 200 - success response - application/json
*/
router.get('/get-text', async (req, res) => {
	if (!req.query.url) return res.json({ error: 'Missing URL query' });

	// Extract text from the image provided
	try {
		const { data } = await Tesseract.recognize(req.query.url, 'eng');
		if (!data.text) {
			res.json({ error: 'No text was found!' });
		} else {
			res.json({ text: data.text });
		}
	} catch (err) {
		res.json({ error: err.message });
	}
});

module.exports = router;
