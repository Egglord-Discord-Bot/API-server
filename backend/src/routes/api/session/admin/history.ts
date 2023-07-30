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

	router.get('/growth', isAdmin, async (req, res) => {
		type countEnum = { [key: string]: number }
		const timeFrame = req.query.time as string;
		if (!timeFrame) return Error.InvalidValue(res, 'timeFrame', ['year', 'month', 'day']);

		switch (timeFrame) {
			// Last year
			case 'year': {
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
			// Last 30 days
			case 'month': {
				const count = await client.UserHistoryManager.fetchEndpointsbyLast30Days();
				return res.json({ count });
			}
			// last 24hours
			case 'day': {
				const count = await client.UserHistoryManager.fetchEndpointsbyLast24hours();
				return res.json({ count });
			}
			default:
				return res.json({ months: [] });
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
