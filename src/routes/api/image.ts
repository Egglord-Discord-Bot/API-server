import { Router } from 'express';
const router = Router();
import { checkImage } from '../../middleware/middleware';
import Image from '../../helpers/Image';

export default function() {

	router.get('/affect', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.affect(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/beautiful', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.beautiful(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/bed', checkImage(2), async (req, res) => {
		const image = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.bed(image as string, image2 as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/blur', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.blur(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/changemymind', async (req, res) => {
		const text = req.query.text;
		if (!text) return res.json({ error: 'Missing text in query' });

		try {
			const img = await Image.changemymind(text as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/circle', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.circle(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/distracted', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		const image3 = req.query.image3;
		try {
			const img = await Image.distracted(image1 as string, image2 as string, image3 as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/facepalm', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.facepalm(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/invert', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.invert(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/joke-over-head', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.jokeOverHead(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/kiss', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.kiss(image1 as string, image2 as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/ohno', async (req, res) => {
		const text = req.query.text;
		if (!text) return res.json({ error: 'Missing text in query' });

		try {
			const img = await Image.ohno(text as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/rip', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.rip(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/slap', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.slap(image1 as string, image2 as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/spank', checkImage(2), async (req, res) => {
		const image1 = req.query.image1;
		const image2 = req.query.image2;
		try {
			const img = await Image.spank(image1 as string, image2 as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	router.get('/trigger', checkImage(1), async (req, res) => {
		const image = req.query.image1;
		try {
			const img = await Image.trigger(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	return router;
}
