import { Router } from 'express';
const router = Router();
import { chechAuth, checkImage } from '../../utils/middleware';
import canvacord from 'canvacord';


export default function() {

	router.get('/affect', chechAuth, checkImage, async (req, res) => {
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
