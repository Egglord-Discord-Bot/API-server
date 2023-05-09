import { Router } from 'express';
import { updateEndpointData } from '../../database/endpointData';
const router = Router();

export default function() {

	router.patch('/endpoint', async (req, res) => {
		const { name, isBlocked } = req.body;

		try {
			await updateEndpointData({ name, isBlocked });
			res.json({ success: 'Successfully updated endpoint data' });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	return router;
}
