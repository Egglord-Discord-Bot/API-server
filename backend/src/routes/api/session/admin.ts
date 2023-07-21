import { Router } from 'express';
import type Client from '../../../helpers/Client';
import { isAdmin } from '../../../middleware/middleware';
const router = Router();

export function run(client: Client) {

	router.patch('/endpoint', isAdmin, async (req, res) => {
		const { name, isBlocked } = req.body;

		try {
			await client.EndpointManager.update({ name, isBlocked });
			res.json({ success: `Successfully updated endpoint: ${name}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	// JSON response for accessing /admin dashboard page
	router.get('/json', isAdmin, async (_req, res) => {
		const [hisTotal, userTotal, responseCodes, mostAccessedEndpoints] = await Promise.all([client.UserHistoryManager.fetchCount(),
			client.UserManager.fetchCount(),
			client.UserHistoryManager.fetchResponseCodeCounts(),
			client.UserHistoryManager.fetchMostAccessEndpoints(),
		]);

		res.json({ historyCount: hisTotal, userCount: userTotal, responseCodes, mostAccessedEndpoints });
	});

	router.get('/system', isAdmin, async (_req, res) => {
		const [systemHis, cpu, disk] = await Promise.all([client.SystemHistoryManager.fetchSystemHistoryData(), client.SystemHistoryManager.calculateCPUUsage(), client.SystemHistoryManager.calculateDiskUsage()]);
		const memory = client.SystemHistoryManager.calculateMemoryUsage();

		res.json({
			current: { memory, cpu, disk },
			history: systemHis,
			uptime: process.uptime(),
		});
	});


	return router;
}
