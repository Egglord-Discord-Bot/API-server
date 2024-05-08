import { Router } from 'express';
const router = Router();
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import { Error, Validator } from '../../utils';
import type Client from '../../helpers/Client';


export async function run(client: Client) {
	const model = await nsfwjs.load();
	/**
		* @openapi
		* /nsfw/check:
		*  get:
		*    description: Check if an image is NSFW or not
		*    parameters:
		*       - name: url
	  *         description: The url of the image.
	  *         required: true
	  *         type: string
	*/
	router.get('/check', async (req, res) => {
		// Valid URL
		const url = req.query.url as string;
		try {
			if (!url) return Error.MissingQuery(res, 'url');
			new URL(url);
		} catch {
			return Error.IncorrectType(res, 'url', 'url');
		}

		// Correctly parse the URL
		const parsedURL = Validator.parseURL(req.originalUrl);

		try {
			const image = await axios.get(parsedURL, { headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
			}, responseType: 'arraybuffer' });
			const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
			const decodedImage = tf.node.decodeImage(imageBuffer, 3);
			const data = await model.classify(decodedImage);
			decodedImage.dispose();

			res.json({ data: {
				isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)),
				probabilities: data },
			});
		} catch (err) {
			console.log(err);
			// See if image was failed to fetch
			if (axios.isAxiosError(err)) {
				client.Logger.error(JSON.stringify(err.response?.data));
				Error.GenericError(res, 'Failed to fetch image.');
			} else {
				client.Logger.error(err);
				Error.GenericError(res, 'Failed to decode image for NSFW content.');
			}
		}
	});

	/**
		* @openapi
		* /nsfw/image:
		*  get:
		*    description: Get a link to a NSFW image
		*    parameters:
		*       - name: type
	  *         description: Type of image
	  *         required: true
		*         enum: [hentai, ass, pgif, thigh, hass, boobs, hboobs, pussy, paizuri, pantsu, lewdneko, feet, hyuri, hthigh, hmidriff, anal, blowjob, gonewild, hkitsune, tentacle, 4k, hentai_anal, neko, holo, kemonomimi]
	  *         type: string
	*/
	router.get('/image', async (req, res) => {
		const type = req.query.type as string;
		if (!type) return Error.MissingQuery(res, 'type');

		// Make sure type is from set
		const allowedTypes = ['hentai', 'ass', 'pgif', 'thigh', 'hass', 'boobs', 'hboobs', 'pussy', 'paizuri',
			'pantsu', 'lewdneko', 'feet', 'hyuri', 'hthigh', 'hmidriff', 'anal', 'blowjob', 'gonewild', 'hkitsune', 'tentacle',
			'4k', 'hentai_anal', 'neko', 'holo', 'kemonomimi'];
		if (!allowedTypes.includes(type)) return Error.InvalidValue(res, 'type', allowedTypes);

		try {
			const { data } = await axios.get(`https://nekobot.xyz/api/image?type=${type}`);
			res.json({ data: data.message });
		} catch (err) {
			client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
			Error.GenericError(res, 'Failed to retrieve image.');
		}
	});

	return router;
}
