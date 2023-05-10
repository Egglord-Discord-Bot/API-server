import { Router } from 'express';
import { updateEndpointData } from '../../database/endpointData';
import { updateUser } from '../../database/User';
import { deleteEndpoint } from '../../database/userHistory';
const router = Router();

export default function() {

	router.patch('/endpoint', async (req, res) => {
		const { name, isBlocked } = req.body;

		try {
			await updateEndpointData({ name, isBlocked });
			res.json({ success: `Successfully updated endpoint: ${name}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	router.delete('/history', async (req, res) => {
		const { id } = req.body;

		try {
			await deleteEndpoint(id);
			res.json({ success: `Successfully deleted user history: ${id}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error deleting endpoint' });
		}
	});


	router.patch('/user', async (req, res) => {
		const { userId, isAdmin, isBlocked, isPremium } = req.body;

		try {
			await updateUser({ id: userId, isAdmin, isPremium, isBlocked });
			res.json({ success: `Successfully updated user: ${userId}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	return router;
}
