import { Router } from 'express';
const router = Router();
import { checkImage } from '../../utils/middleware';
import Image from '../../helpers/Image';

export default function() {

	router.get('/affect', checkImage, async (req, res) => {
		const image = req.query.image;
		try {
			const img = await Image.affect(image as string);
			res.json({ success: img.toString() });
		} catch (err: any) {
			console.log(err);
			res.json({ error: err.message });
		}
	});

	return router;
}
