const express = require('express'),
	router = express.Router(),
	Canvas = require('canvas');

router.get('/affect', async (req, res) => {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });

	try {
		const img = await Canvas.loadImage(image);
		const bg = await Canvas.loadImage(`${process.cwd()}/src/assets/images/affect.png`);

		const canvas = Canvas.createCanvas(bg.width, bg.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(bg, 0, 0);
		ctx.drawImage(img, 180, 383, 200, 157);
		res.json({ success: canvas.toBuffer() });
	} catch (err) {
		res.json({ error: err.message });
	}
});

router.get('/beautiful', async (req, res) => {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });

	try {
		const img = await Canvas.loadImage(image);
		const base = await Canvas.loadImage(`${process.cwd()}/src/assets/images/beautiful.png`);
		const canvas = Canvas.createCanvas(376, 400);
		canvas.getContext('2d')
			.drawImage(base, 0, 0, canvas.width, canvas.height)
			.drawImage(img, 258, 28, 84, 95)
			.drawImage(img, 258, 229, 84, 95);

		res.json({ success: canvas.toBuffer() });
	} catch (err) {
		res.json({ error: err.message });
	}
});

router.get('/blur', async (req, res) => {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });

	try {
		const img = await Canvas.loadImage(image);
		const canvas = Canvas.createCanvas(img.width, img.height);
		canvas.getContext('2d')
			.fillStyle = '#ffffff'
				.fillRect(0, 0, canvas.width, canvas.height)
				.drawImage(img, 0, 0, canvas.width / 4, canvas.height / 4)
				.imageSmoothingEnabled = true
					.drawImage(canvas, 0, 0, canvas.width / 4, canvas.height / 4, 0, 0, canvas.width + 5, canvas.height + 5);

		res.json({ success: canvas.toBuffer() });
	} catch (err) {
		res.json({ error: err.message });
	}
});
module.exports = router;
