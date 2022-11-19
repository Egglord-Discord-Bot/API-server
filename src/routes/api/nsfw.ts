import { Router } from 'express';
const router = Router();
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import type { Tensor3D } from '@tensorflow/tfjs-node';

export default function() {
	/**
	  * @API
	  * /v1/nsfw/image
	  *   get:
	  *     description: Get a link to a NSFW image
	  *     tags: nsfw
	  *			parameters:
	  *       - name: type
	  *         description: Type of image
	  *         required: true
	  *         type: string
	*/
	router.get('/image', async (req, res) => {
		if (!req.query.type) return res.json({ error: 'Stuff' });

		try {
			const { data } = await axios.get(`https://nekobot.xyz/api/image?type=${req.query.type}`);
			res.json({ success: data.message });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	/**
	  * @API
	  * /v1/nsfw/check
	  *   get:
	  *     description: Check if an image is NSFW or not
	  *     tags: nsfw
	  *			parameters:
	  *       - name: type
	  *         description: The url of the image.
	  *         required: true
	  *         type: string
	*/
	router.get('/check', async (req, res) => {
		if (!req.query?.url) return res.json({ error: 'Error' });

		try {
			const model = await nsfwjs.load();
			const image = await axios.get(req.query.url as string, { responseType: 'arraybuffer' });
			const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
			const decodedImage = tf.node.decodeImage(imageBuffer);
			const data = await model.classify(decodedImage as Tensor3D);
			decodedImage.dispose();

			res.json({ success: {
				url: req.query.url,
				isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)),
				probabilities: data },
			});
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	return router;
}
