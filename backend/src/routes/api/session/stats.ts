import { Router } from 'express';
import type Client from '../../../helpers/Client';
import { isAdmin } from '../../../middleware/middleware';
const router = Router();


export function run(client: Client) {
	router.get('/', async (_req, res) => {
		try {
			const [users, endpoints, endpointUsage] = await Promise.all([client.UserManager.fetchCount(), client.EndpointManager.fetchCount(), client.UserHistoryManager.fetchCount()]);
			console.log(users, endpoints, endpointUsage);
			res.json({
				userCount: users,
				endpointCount: endpoints,
				historyCount: endpointUsage,
			});
		} catch (err) {
			res.json({
				userCount: 0,
				endpointCount: 0,
				historyCount: 0,
			});
		}
	});


	router.get('/history', isAdmin, async (req, res) => {
		const page = req.query.page;
		try {
			const [history, total] = await Promise.all([await client.UserHistoryManager.fetchAllEndpointUsage({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 }),
				await client.UserHistoryManager.fetchCount()]);

			res.json({ history: history.map(h => ({ ...h, userId: `${h.userId}` })), total });
		} catch (err) {
			console.log(err);
			res.json({ history: [], total: 0 });
		}
	});

	return router;
}
