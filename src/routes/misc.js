const { Router } = require('express'),
	router = Router(),
	Puppeteer = require('puppeteer'),
	fetch = require('node-fetch');

// Get random advice
router.get('/advice', async (req, res) => {
	try {
		const advice = await fetch('https://api.adviceslip.com/advice').then(data => data.json());
		res.json({ success: advice.slip.advice });
	} catch (err) {
		res.json({ error: err.message });
	}
});

// Get information on a random pokemon
router.get('/pokemon', async (req, res) => {
	const pokemon = req.query.pokemon;
	try {
		const advice = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${pokemon}`).then(info => info.json());
		res.json({ success: advice.slip.advice });
	} catch (err) {
		res.json({ error: err.message });
	}
});

// Get a screenshot of a website
router.get('/screenshot', async (req, res) => {
	let data;
	try {
		const browser = await Puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 720 });
		await page.goto(URL);
		await new Promise(r => setTimeout(r, 1500));
		data = await page.screenshot();
		await browser.close();
		res.json({ success: data });
	} catch (err) {
		res.json({ error: err.message });
	}
});

module.exports = router;
