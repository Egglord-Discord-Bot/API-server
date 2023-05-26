import { Router } from 'express';
import type Client from '../../../helpers/Client';
import { isAdmin } from '../../../middleware/middleware';
import type { swaggerJsdocType } from '../../../types/';
import swaggerJsdoc from 'swagger-jsdoc';
const router = Router();


export function run(client: Client) {
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
			const [users, total] = await Promise.all([client.UserManager.fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 }), client.UserManager.fetchCount()]);
			res.json({ users: users.map(i => ({ ...i, id: `${i.id}` })), total });
		} catch (err) {
			console.log(err);
			res.json({ users: [], total: 0 });
		}
	});

	router.get('/endpoints', isAdmin, async (_req, res) => {
		try {
			const endpoints = await client.EndpointManager.fetchEndpointData();
			const openapiSpecification = swaggerJsdoc({
				failOnErrors: true,
				definition: {
					openapi: '3.0.0',
					info: {
						title: 'Hello World',
						version: '1.0.0',
					},
				},
				apis: ['./src/routes/api/*.ts'],
			}) as swaggerJsdocType;
			const el = endpoints.map(e => ({ ...e, data: openapiSpecification.paths[`${e.name.replace('/api', '')}`]?.get }));

			res.json({ endpoints: el });
		} catch (err) {
			console.log(err);
			res.json({ endpoints: [] });
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

	router.get('/history/autocomplete', isAdmin, async (req, res) => {
		const text = req.query.text as string;
		try {
			const history = await client.UserHistoryManager.fetchEndpointByName(text);
			res.json({ history: history.map(h => ({ ...h, userId: `${h.userId}` })) });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	router.get('/history/responseCode', isAdmin, async (_req, res) => {
		try {
			const history = await client.UserHistoryManager.fetchResponseCodeCounts();
			res.json({ history: history });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
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
