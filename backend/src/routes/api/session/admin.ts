import { Router } from 'express';
import type Client from '../../../helpers/Client';
const router = Router();

export function run(client: Client) {

	router.patch('/endpoint', async (req, res) => {
		const { name, isBlocked } = req.body;

		try {
			await client.EndpointManager.update({ name, isBlocked });
			res.json({ success: `Successfully updated endpoint: ${name}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	router.delete('/history', async (req, res) => {
		const { id } = req.body;

		try {
			await client.UserHistoryManager.delete(id);
			res.json({ success: `Successfully deleted user history: ${id}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error deleting endpoint' });
		}
	});


	router.patch('/user', async (req, res) => {
		const { userId, isAdmin, isBlocked, isPremium } = req.body;

		try {
			await client.UserManager.update({ id: BigInt(userId), isAdmin, isPremium, isBlocked });
			res.json({ success: `Successfully updated user: ${userId}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	return router;
}
