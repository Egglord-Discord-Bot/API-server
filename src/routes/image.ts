import { Router } from 'express';
const router = Router();
import { checkImage } from '../utils/index';
import canvacord from 'canvacord';


export default function() {

	router.get('/affect', checkImage, async (req, res) => {
		const image = req.query.image;
		try {
			const img = await canvacord.Canvas.affect(image as string);
			res.json({ succes: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	return router;
}
