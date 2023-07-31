import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import { isAdmin } from '../../../../middleware/middleware';
import { Error } from '../../../../utils';
const router = Router();

type orderList = 'asc' | 'desc' | undefined
type orderType = 'accessedAt' | 'statusCode' | undefined

export function run(client: Client) {

	router.get('/', isAdmin, async (req, res) => {
		const page = req.query.page;
		const orderDir = req.query.orderDir as orderList;
		const orderType = req.query.orderType as orderType;

		// If order is present make sure it's only ascend or descend
		if (orderDir && !['asc', 'desc'].includes(orderDir)) return Error.InvalidValue(res, 'orderDir', ['asc', 'desc']);

		try {
			const [history, total] = await Promise.all([client.UserHistoryManager.fetchHistory({ page: (page && !Number.isNaN(page)) ? Number(page) : 0, orderDir, orderType }),
				client.UserHistoryManager.fetchCount()]);
			res.json({ history: history.map(i => ({ ...i, userId: `${i.userId}` })), total });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	type frameEnum = 'yearly' | 'monthly' | 'daily' | 'hourly';
	router.get('/growth', isAdmin, async (req, res) => {
		type countEnum = { [key: string]: number }
		const frame = req.query.frame as frameEnum;
		if (!frame || !['yearly', 'monthly', 'daily', 'hourly'].includes(frame)) return Error.InvalidValue(res, 'frame', ['yearly', 'monthly', 'daily', 'hourly']);

		switch (frame) {
			// Last 10 years
			case 'yearly': {
				const years: countEnum = {};
				for (let i = 0; i <= 9; i++) {
					const users = await client.UserHistoryManager.fetchHistoryCountByYear(new Date().getFullYear() - i);
					years[new Date().getFullYear() - i] = users;
				}
				return res.json({ years });
			}
			// Last 12 months
			case 'monthly': {
				const months: countEnum = { 'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0, 'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0 };
				const d = new Date();
				d.setDate(1);
				for (let i = 0; i <= 11; i++) {
					const y = Object.keys(months).at(d.getMonth());
					// IF i is bigger than the current month then it has reached the previous year
					const year = new Date().getFullYear() - (new Date().getMonth() < i ? 1 : 0);
					if (y !== undefined) months[y] = await client.UserHistoryManager.fetchHistoryCountByMonth(d.getMonth(), year);
					d.setMonth(d.getMonth() - 1);
				}
				return res.json({ months });
			}
			// last 14 days
			case 'daily': {
				// Get last 14 days
				const days: countEnum = {};
				for (let i = 0; i <= 14; i++) {
					days[`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate() - i}`] = await client.UserHistoryManager.fetchHistoryCountByDate(new Date().getDate() - i, new Date().getMonth(), new Date().getFullYear());
				}
				return res.json({ days });
			}
			// Last 24 hours
			case 'hourly': {
				const hours: countEnum = {};
				for (let i = 0; i <= 24; i++) {
					hours[`${new Date().getHours() - i}`] = await client.UserHistoryManager.fetchHistoryCountByHour(new Date().getHours() - i);
				}
				return res.json({ hours });
			}
		}
	});

	router.get('/search', isAdmin, async (req, res) => {
		const name = req.query.name as string;
		if (!name) return Error.MissingQuery(res, 'name');

		try {
			const history = await client.UserHistoryManager.fetchHistoryByName(name);
			res.json({ history: history.map(i => ({ ...i, userId: `${i.userId}` })) });
		} catch (err: any) {
			Error.GenericError(res, err.message);
		}
	});

	router.get('/responseCode', isAdmin, async (_req, res) => {
		try {
			const history = await client.ResponseCodeManager.fetchResponseCodeCounts();
			res.json({ history });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	router.delete('/', isAdmin, async (req, res) => {
		const { id } = req.body;

		try {
			await client.UserHistoryManager.delete(id);
			res.json({ success: `Successfully deleted user history: ${id}` });
		} catch (err) {
			console.log(err);
			res.json({ error: 'Error deleting endpoint' });
		}
	});

	router.get('/download', isAdmin, async (_req, res) => {
		const history = await client.UserHistoryManager.fetchAll();
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-disposition', 'attachment; filename=history.json');
		res.send({ history: history.map(i => ({ ...i, userId: `${i.userId}` })) });
	});

	return router;
}
