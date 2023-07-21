import { Router } from 'express';
import type Client from '../../../../helpers/Client';
import { isAdmin } from '../../../../middleware/middleware';
const router = Router();

export function run(client: Client) {

	router.get('/', isAdmin, async (req, res) => {
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

	router.get('/autocomplete', isAdmin, async (req, res) => {
		const text = req.query.text as string;
		try {
			const history = await client.UserHistoryManager.fetchEndpointByName(text);
			res.json({ history: history.map(h => ({ ...h, userId: `${h.userId}` })) });
		} catch (err) {
			console.log(err);
			res.json({ history: [] });
		}
	});

	router.get('/responseCode', isAdmin, async (_req, res) => {
		try {
			const history = await client.UserHistoryManager.fetchResponseCodeCounts();
			res.json({ history: history });
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
	return router;
}
