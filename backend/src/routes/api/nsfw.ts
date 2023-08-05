import { Router } from 'express';
const router = Router();
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import type { Tensor3D } from '@tensorflow/tfjs-node';
import { Error } from '../../utils';
import type Client from '../../helpers/Client';

export function run(client: Client) {
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
		const url = req.query.url as string;
		if (!url) return Error.MissingQuery(res, 'url');

		try {
			const model = await nsfwjs.load();
			const image = await axios.get(url, { responseType: 'arraybuffer' });
			const imageBuffer = new Uint8Array(Buffer.from(image.data, 'utf-8'));
			const decodedImage = tf.node.decodeImage(imageBuffer);
			const data = await model.classify(decodedImage as Tensor3D);
			decodedImage.dispose();

			res.json({ data: {
				isNSFW: (['Porn', 'Hentai', 'Sexy'].includes(data[0].className)),
				probabilities: data },
			});
		} catch (err) {
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
