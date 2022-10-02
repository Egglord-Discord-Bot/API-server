import { Router } from 'express';
const router = Router();
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import type { Tensor3D } from '@tensorflow/tfjs-node';

export default function() {

	router.get('/image', async (req, res) => {
		try {
			const { data } = await axios.get(`https://nekobot.xyz/api/image?type=${req.query.type}`);
			res.json({ success: data.message });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	router.get('/check', async (req, res) => {
		if (!req.query?.url) return res.json({ error: 'Error' });

		try {
			const model = await nsfwjs.load();
			const image = await axios.get(req.query.url as string, { responseType: 'arraybuffer' });
			const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
			const decodedImage = tf.node.decodeImage(imageBuffer);
			const data = await model.classify(decodedImage as Tensor3D);
			decodedImage.dispose();

			res.json({ success: { url: req.query.url, isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)) } });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('*', (_req, res) => {
		res.json({ error: 'Missing endpoint' });
	});

	return router;
}
