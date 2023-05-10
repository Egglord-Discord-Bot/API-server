import { Router } from 'express';
import { updateEndpointData } from '../../database/endpointData';
import { updateUser } from '../../database/User';
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

	/*
	router.delete('/endpoint', async (req, res) => {

	});
	*/
	router.patch('/user', async (req, res) => {
		const { userId, isAdmin, isBlocked, isPremium } = req.body;

		try {
			await updateUser({ id: userId, isAdmin, isPremium, isBlocked });
			res.json({ success: 'Successfully updated user' });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	return router;
}
