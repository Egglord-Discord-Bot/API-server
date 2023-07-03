import { Router } from 'express';
const router = Router();
import { checkImage } from '../../middleware/middleware';
import Error from '../../utils/Errors';
import Image from '../../helpers/Image';

export function run() {
	/**
	  * @openapi
	  * /image/3000years:
	  *  get:
	  *    description: Create an 3000years image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/3000years', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.threeThousandYears(image as string);
			res.set('Content-Disposition', 'inline; filename=3000years.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/affect:
	  *  get:
	  *    description: Create an affect image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/affect', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.affect(image as string);
			res.set('Content-Disposition', 'inline; filename=affect.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/approved:
	  *  get:
	  *    description: Create an approved image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/approved', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.approved(image as string);
			res.set('Content-Disposition', 'inline; filename=approved.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/beautiful:
	  *  get:
	  *    description: Create an affect image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/beautiful', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.beautiful(image as string);
			res.set('Content-Disposition', 'inline; filename=beautiful.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /image/bed:
	 *  get:
	 *    description: Create an bed image
	 *    parameters:
	 *       - name: image1
	 *         description: The URL of the message
	 *         required: true
	 *         type: string
	 *       - name: image2
	 *         description: The URL of the message
	 *         required: true
	 *         type: string
	 */
	router.get('/bed', checkImage(2), async (req, res) => {
		const image = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.bed(image as string, image2 as string);
			res.set('Content-Disposition', 'inline; filename=bed.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/blur:
	  *  get:
	  *    description: Create an blur image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/blur', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.blur(image as string);
			res.set('Content-Disposition', 'inline; filename=blur.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/changemymind:
	  *  get:
	  *    description: Create an change my mind image
	  *    parameters:
	  *       - name: text
	  *         description: The text to put on the sign
	  *         required: true
	  *         type: string
	*/
	router.get('/changemymind', async (req, res) => {
		const text = req.query.text;
		if (!text) return res.json({ error: 'Missing text in query' });

		try {
			const img = await Image.changemymind(text as string);
			res.set('Content-Disposition', 'inline; filename=changemymind.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/circle:
	  *  get:
	  *    description: Create an circle image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/circle', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.circle(image as string);
			res.set('Content-Disposition', 'inline; filename=circle.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/clyde:
	  *  get:
	  *    description: Create an clyde image
	  *    parameters:
		*       - name: text
 	 *         description: The text for clyde to show
 	 *         required: true
 	 *         type: string
	*/
	router.get('/clyde', async (req, res) => {
		const text = req.query.text as string;
		if (text == undefined) return Error.MissingQuery(res, 'text');

		try {
			const img = await Image.clyde(text);
			res.set('Content-Disposition', 'inline; filename=clyde.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /image/distracted:
	 *  get:
	 *    description: Create an distracted image
	 *    tags: image
	 *    parameters:
	 *       - name: image1
	 *         description: The URL of the message
	 *         required: true
	 *         type: string
	 *       - name: image2
	 *         description: The URL of the message
	 *         required: true
	 *         type: string
	 */
	router.get('/distracted', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		const image3 = req.query.image3;
		try {
			const img = await Image.distracted(image1 as string, image2 as string, image3 as string);
			res.set('Content-Disposition', 'inline; filename=distracted.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/facepalm:
	  *  get:
	  *    description: Create an facepalm image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/facepalm', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.facepalm(image as string);
			res.set('Content-Disposition', 'inline; filename=facepalm.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/invert:
	  *  get:
	  *    description: Create an invert image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/invert', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.invert(image as string);
			res.set('Content-Disposition', 'inline; filename=invert.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/joke-over-head:
	  *  get:
	  *    description: Create an joke over head image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/joke-over-head', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.jokeOverHead(image as string);
			res.set('Content-Disposition', 'inline; filename=joke-over-head.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/kiss:
	  *  get:
	  *    description: Create an kiss image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
		*       - name: image2
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/kiss', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.kiss(image1 as string, image2 as string);
			res.set('Content-Disposition', 'inline; filename=kiss.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /image/ohno:
	 *  get:
	 *    description: Create an ohno image
	 *    tags: image
	 *    parameters:
	 *       - name: text
	 *         description: The text to for silly dog.
	 *         required: true
	 *         type: string
	 */
	router.get('/ohno', async (req, res) => {
		const text = req.query.text;
		if (!text) return res.json({ error: 'Missing text in query' });

		try {
			const img = await Image.ohno(text as string);
			res.set('Content-Disposition', 'inline; filename=ohno.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/rip:
	  *  get:
	  *    description: Create an rip image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/rip', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.rip(image as string);
			res.set('Content-Disposition', 'inline; filename=rip.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/slap:
	  *  get:
	  *    description: Create an slap image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
		*       - name: image2
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/slap', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.slap(image1 as string, image2 as string);
			res.set('Content-Disposition', 'inline; filename=slap.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/spank:
	  *  get:
	  *    description: Create an spank image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
		*       - name: image2
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/spank', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.spank(image1 as string, image2 as string);
			res.set('Content-Disposition', 'inline; filename=spank.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/trigger:
	  *  get:
	  *    description: Create an trigger image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/trigger', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.trigger(image as string);
			res.set('Content-Disposition', 'inline; filename=trigger.gif');
			res.setHeader('content-type', 'image/gif');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/wanted:
	  *  get:
	  *    description: Create an wanted image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/wanted', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.wanted(image as string);
			res.set('Content-Disposition', 'inline; filename=wanted.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/wasted:
	  *  get:
	  *    description: Create an wasted image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/wasted', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.wasted(image as string);
			res.set('Content-Disposition', 'inline; filename=wasted.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});

	/**
	  * @openapi
	  * /image/whowouldwin:
	  *  get:
	  *    description: Create an who would win image
	  *    parameters:
	  *       - name: image1
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
		*       - name: image2
	  *         description: The URL of the message
	  *         required: true
	  *         type: string
	*/
	router.get('/whowouldwin', checkImage(2), async (req, res) => {
		const image = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.whowouldwin(image as string, image2 as string);
			res.set('Content-Disposition', 'inline; filename=whowouldwin.png');
			res.setHeader('content-type', 'image/png');
			res.send(img);
		} catch (err: any) {
			console.log(err);
			Error.GenericError(res, err.message);
		}
	});
	return router;
}
