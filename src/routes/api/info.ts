import { Router } from 'express';
const router = Router();
import Reddit from '../../helpers/Reddit';
import Covid from '../../helpers/Covid';
import { CONSTANTS } from '../../utils/CONSTANTS';
export default function() {

	// Covid endpoint
	const CovidHandler = new Covid();
	router.get('/covid', async (req, res) => {
		const data = await CovidHandler.fetchData(req.query.country as string);
		// Check cache first
		res.json(data);
	});

	// Reddit endpoint
	const RedditHandler = new Reddit();
	router.get('/reddit', async (req, res) => {
		if (!req.query.sub) return res.json({ error: CONSTANTS.REDDIT_MISSINGQUERY });
		const data = await RedditHandler.fetchSubreddit(req.query.sub as string);
		res.json(data);
	});

	return router;
}
