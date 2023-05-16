import { Router } from 'express';
import type Client from '../../helpers/Client';
import { isAdmin } from '../../middleware/middleware';
import SystemManager from '../../helpers/SystemManager';
const router = Router();


export function run(client: Client) {
	const systemManager = new SystemManager(client);

	router.get('/basic', async (_req, res) => {
		try {
			const [users, endpoints, endpointUsage] = await Promise.all([client.UserManager.fetchCount(), client.EndpointManager.fetchCount(), client.UserHistoryManager.fetchCount()]);
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

	router.get('/users', isAdmin, async (req, res) => {
		const page = req.query.page;
		try {
			const users = await client.UserManager.fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 });
			res.json({ users: users.map(i => ({ ...i, id: i.id.toString() })) });
		} catch (err) {
			console.log(err);
			res.json({ users: [] });
		}
	});

	router.get('/endpoints', isAdmin, async (_req, res) => {
		try {
			const endpoints = await client.EndpointManager.fetchEndpointData();
			res.json({ endpoints: endpoints });
		} catch (err) {
			console.log(err);
			res.json({ endpoints: [] });
		}
	});

	router.get('/history', isAdmin, async (req, res) => {
		const page = req.query.page;
		try {
			const history = await client.UserHistoryManager.fetchAllEndpointUsage({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 });
			res.json({ history: history });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	router.get('/system', isAdmin, async (_req, res) => {
		const [systemHis, cpu, disk] = await Promise.all([client.SystemHistoryManager.fetchSystemHistoryData(), systemManager.calculateCPUUsage(), systemManager.calculateDiskUsage()]);
		const memory = systemManager.calculateMemoryUsage();

		res.json({
			current: { memory, cpu, disk },
			history: systemHis,
		});
	});
	return router;
}
