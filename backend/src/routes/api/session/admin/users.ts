import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';
import { TokenGenerator, TokenBase } from 'ts-token-generator';
const router = Router();

type orderList = 'asc' | 'desc' | undefined
type orderType = 'joinedAt' | 'requests' | undefined
export function run(client: Client) {

	router.get('/', isAdmin, async (req, res) => {
		const page = req.query.page;
		const orderDir = req.query.orderDir as orderList;
		const orderType = req.query.orderType as orderType;

		// If order is present make sure it's only ascend or descend
		if (orderDir && !['asc', 'desc'].includes(orderDir)) return Error.InvalidValue(res, 'order', ['asc', 'desc']);

		try {
			const [users, total] = await Promise.all([client.UserManager.fetchUsers({ page: (page && !Number.isNaN(page)) ? Number(page) : 0, orderDir, orderType }), client.UserManager.fetchCount()]);
			res.json({ users: users.map(i => ({ ...i, id: `${i.id}` })), total });
		} catch (err) {
			console.log(err);
			res.json({ users: [], total: 0 });
		}
	});

	router.get('/stats', isAdmin, async (_req, res) => {
		try {
			const [total, admin, premium, block] = await Promise.all([
				client.UserManager.fetchCount(),
				client.UserManager.fetchAdminCount(),
				client.UserManager.fetchBlockedCount(),
				client.UserManager.fetchPremiumCount()]);

			res.json({ total, admin, premium, block });
		} catch (err) {
			console.log(err);
			res.json({ total: 0, admin: 0, premium: 0, block: 0 });
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

	router.patch('/update', isAdmin, async (req, res) => {
		console.log(req.body);
		const { userId, isAdmin: isUserAdmin, isBlocked, isPremium } = req.body;

		try {
			await client.UserManager.update({ id: BigInt(userId), isAdmin: isUserAdmin == 'true', isPremium: isPremium == 'true', isBlocked: isBlocked == 'true' });
			res.json({ success: `Successfully updated user: ${userId}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error updating' });
		}
	});

	router.patch('/regenerate', isAdmin, async (req, res) => {
		const userId = req.query.userId as string;
		if (!userId) return Error.MissingQuery(res, 'userId');

		try {
			const token = new TokenGenerator({ bitSize: 512, baseEncoding: TokenBase.BASE62 }).generate();
			await client.UserManager.update({ id: BigInt(userId), newToken: token });
			res.json({ success: 'Successfully updated users token', token });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Failed to update users token' });
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
