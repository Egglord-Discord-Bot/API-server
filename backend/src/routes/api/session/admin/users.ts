import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';
const router = Router();

type orderList = 'asc' | 'desc' | undefined
export function run(client: Client) {

	router.get('/', isAdmin, async (req, res) => {
		const page = req.query.page;
		const order = req.query.order as orderList;

		// If order is present make sure it's only ascend or descend
		if (order && !['asc', 'desc'].includes(order)) return Error.InvalidValue(res, 'order', ['asc', 'desc']);

		try {
			const [users, total] = await Promise.all([client.UserManager.fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0, order }), client.UserManager.fetchCount()]);
			res.json({ users: users.map(i => ({ ...i, id: `${i.id}` })), total });
		} catch (err) {
			console.log(err);
			res.json({ users: [], total: 0 });
		}
	});


	router.get('/json', isAdmin, async (req, res) => {
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

	router.get('/history', isAdmin, async (_req, res) => {
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

	router.get('/search', isAdmin, async (req, res) => {
		const name = req.query.name as string;
		if (!name) return Error.MissingQuery(res, 'name');

		try {
			const users = await client.UserManager.fetchByUsername(name);
			res.json({ users: users.map(i => ({ ...i, id: `${i.id}` })) });
		} catch (err) {
			console.log(err);
			res.json({ errors: 'dfd' });
		}
	});

	router.patch('/', isAdmin, async (req, res) => {
		const { userId, isAdmin: isUserAdmin, isBlocked, isPremium } = req.body;

		try {
			await client.UserManager.update({ id: BigInt(userId), isAdmin: isUserAdmin, isPremium, isBlocked });
			res.json({ success: `Successfully updated user: ${userId}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	router.get('/download', isAdmin, async (_req, res) => {
		const users = await client.UserManager.fetchAll();
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-disposition', 'attachment; filename=users.json');
		res.send({ users: users.map(i => ({ ...i, id: `${i.id}` })) });
	});

	return router;
}
