import { Router } from 'express';
import { fetchUsers, fetchUserCount } from '../../database/User';
import { fetchEndpointData } from '../../database/endpointData';
import { fetchEndpointTotal, fetchAllEndpointUsage } from '../../database/userHistory';
import { fetchSystemHistoryData } from '../../database/systemHistory';
import { isAdmin } from '../../middleware/middleware';
import SystemManager from '../../helpers/SystemManager';
const router = Router();
const systemManager = new SystemManager();

export default function() {
	// systemManager.init();

	router.get('/basic', async (_req, res) => {

		try {
			const [users, endpoints, endpointUsage] = await Promise.all([fetchUserCount(), fetchEndpointData(), fetchEndpointTotal()]);
			res.json({
				userCount: users,
				endpointCount: endpoints.length,
				historyCount: endpointUsage,
			});
		} catch (err) {
			console.log(err);
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
			const users = await fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 });
			res.json({ users: users.map(i => ({ ...i, id: i.id.toString() })) });
		} catch (err) {
			console.log(err);
			res.json({ users: [] });
		}
	});

	router.get('/endpoints', isAdmin, async (_req, res) => {
		try {
			const endpoints = await fetchEndpointData();
			res.json({ endpoints: endpoints });
		} catch (err) {
			console.log(err);
			res.json({ endpoints: [] });
		}
	});

	router.get('/history', isAdmin, async (_req, res) => {
		try {
			const history = await fetchAllEndpointUsage(1);
			res.json({ history: history });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	router.get('/system', isAdmin, async (_req, res) => {
		const [systemHis, cpu, disk] = await Promise.all([fetchSystemHistoryData(), systemManager.calculateCPUUsage(), systemManager.calculateDiskUsage()]);
		const memory = systemManager.calculateMemoryUsage();

		res.json({
			current: {
				memory, cpu, disk,
			},
			history: systemHis });
	});
	return router;
}
