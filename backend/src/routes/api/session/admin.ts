import { Router } from 'express';
import type { swaggerJsdocType } from '../../../types/';
import swaggerJsdoc from 'swagger-jsdoc';
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

	// JSON response for accessing /admin dashboard page
	router.get('/json', async (_req, res) => {
		const [hisTotal, userTotal, responseCodes] = await Promise.all([client.UserHistoryManager.fetchCount(),
			client.UserManager.fetchCount(),
			client.UserHistoryManager.fetchResponseCodeCounts()]);

		res.json({ historyCount: hisTotal, userCount: userTotal, responseCodes });
	});

	router.get('/users/json', async (req, res) => {
		const page = req.query.page;
		try {
			const [users, total, admin, premium, block] = await Promise.all([client.UserManager.fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0 }),
				client.UserManager.fetchCount(),
				client.UserManager.fetchAdminCount(),
				client.UserManager.fetchBlockedCount(),
				client.UserManager.fetchPremiumCount()]);

			res.json({ users: users.map(i => ({ ...i, id: `${i.id}` })), total, admin, premium, block });
		} catch (err) {
			console.log(err);
			res.json({ users: [], total: 0 });
		}
	});

	router.get('/endpoints/json', async (_req, res) => {
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

	router.get('/system', async (_req, res) => {
		const [systemHis, cpu, disk] = await Promise.all([client.SystemHistoryManager.fetchSystemHistoryData(), client.SystemHistoryManager.calculateCPUUsage(), client.SystemHistoryManager.calculateDiskUsage()]);
		const memory = client.SystemHistoryManager.calculateMemoryUsage();

		res.json({
			current: { memory, cpu, disk },
			history: systemHis,
			uptime: process.uptime(),
		});
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

	router.get('/user/history', async (_req, res) => {
		type countEnum = { [key: string]: number }
		const months: countEnum = { 'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0, 'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0 };
		const d = new Date();
		d.setDate(1);
		for (let i = 0; i <= 11; i++) {
			const y = Object.keys(months).at(d.getMonth());
			// IF i is bigger than the current month then it has reached the previous year
			const year = new Date().getFullYear() - (new Date().getMonth() < i ? 1 : 0);
			if (y !== undefined) months[y] = await client.UserManager.fetchUsersByMonth(d.getMonth(), year);
			d.setMonth(d.getMonth() - 1);
		}
		return res.json({ months });
	});

	router.get('/history', async (req, res) => {
		type countEnum = { [key: string]: number }
		const timeFrame = req.query.time as string;

		switch (timeFrame) {
			case 'year' : {
				const months: countEnum = { 'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0, 'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0 };
				const d = new Date();
				d.setDate(1);
				for (let i = 0; i <= 11; i++) {
					const y = Object.keys(months).at(d.getMonth());
					// IF i is bigger than the current month then it has reached the previous year
					const year = new Date().getFullYear() - (new Date().getMonth() < i ? 1 : 0);
					if (y !== undefined) months[y] = await client.UserHistoryManager.fetchEndpointsByMonth(d.getMonth(), year);
					d.setMonth(d.getMonth() - 1);
				}
				return res.json({ months });
			}
		}
	});

	return router;
}
