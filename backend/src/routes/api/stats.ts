import { Router } from 'express';
import { fetchUsers } from '../../database/User';
import { fetchEndpointData } from '../../database/endpointData';
import { fetchAllEndpointUsage } from '../../database/userHistory';
import { fetchSystemHistoryData } from '../../database/systemHistory';
import { isAdmin } from '../../middleware/middleware';
import SystemManager from '../../helpers/SystemManager';
const router = Router();
const systemManager = new SystemManager();

export default function() {
	systemManager.init();

	router.get('/basic', async (_req, res) => {

		try {
			const [users, endpoints, endpointUsage] = await Promise.all([fetchUsers(), fetchEndpointData(), fetchAllEndpointUsage()]);
			res.json({
				userCount: users.length,
				endpointCount: endpoints.length,
				historyCount: endpointUsage.length,
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

	router.get('/users', isAdmin, async (_req, res) => {
		try {
			const users = await fetchUsers();
			res.json({ users: users });
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
			const history = await fetchAllEndpointUsage();
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
