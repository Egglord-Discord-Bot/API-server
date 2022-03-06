const { Router } = require('express'),
	router = Router(),
	{ get } = require('axios'),
	tf = require('@tensorflow/tfjs-node'),
	nsfwjs = require('nsfwjs');

/**
  * GET /nsfw/image
  * @summary Endpoint for fetching fortnite accounts
	* @tags NSFW
	* @param {string} type.query.required - The name of the pokemon
  * @return {object} 200 - success response - application/json
*/
router.get('/image', async (req, res) => {
	try {
		const { data } = await get(`https://nekobot.xyz/api/image?type=${req.query.type}`);
		res.json({ success: data.message });
	} catch (err) {
		res.json({ error: err.message });
	}
});

/**
  * GET /nsfw/check
  * @summary Endpoint for fetching fortnite accounts
	* @tags NSFW
	* @param {string} url.query.required - The name of the pokemon
  * @return {object} 200 - success response - application/json
*/
router.get('/check', async (req, res) => {
	try {
		const model = await nsfwjs.load();
		const image = await get(req.query.url, { responseType: 'arraybuffer' });
		const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
		const decodedImage = await tf.node.decodeImage(imageBuffer);
		const data = await model.classify(decodedImage);
		decodedImage.dispose();

		res.json({ success: { url: req.query.url, isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)) } });
	} catch (err) {
		res.json({ error: err.message });
	}
});

module.exports = router;
