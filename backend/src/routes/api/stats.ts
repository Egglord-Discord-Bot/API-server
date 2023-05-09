import { Router } from 'express';
import { fetchUsers } from '../../database/User';
import { fetchEndpointData } from '../../database/endpointData';
import { fetchAllEndpointUsage } from '../../database/userHistory';
import { isAdmin } from '../../middleware/middleware';
const router = Router();

export default function() {

	router.get('/basic', async (_req, res) => {
		const [users, endpoints, endpointUsage] = await Promise.all([fetchUsers(), fetchEndpointData(), fetchAllEndpointUsage()]);

		res.json({
			userCount: users.length,
			endpointCount: endpoints.length,
			historyCount: endpointUsage.length,
		});
	});

	router.get('/users', isAdmin, async (_req, res) => {
		const users = await fetchUsers();
		res.json({ users: users });
	});

	router.get('/endpoints', isAdmin, async (_req, res) => {
		const endpoints = await fetchEndpointData();
		res.json({ endpoints: endpoints });
	});

	router.get('/history', isAdmin, async (_req, res) => {
		const history = await fetchAllEndpointUsage();
		res.json({ history: history });
	});

	return router;
}
