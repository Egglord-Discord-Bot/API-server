import { Router } from 'express';
const router = Router();
import Reddit from '../../helpers/Reddit';
import Covid from '../../helpers/Covid';
export default function() {

	// Covid endpoint
	const CovidHandler = new Covid();
	router.get('/covid', async (req, res) => {
		const data = CovidHandler.fetchData(req.query.country as string);
		// Check cache first
		res.json(data);
	});

	// Reddit endpoint
	const RedditHandler = new Reddit();
	router.get('/reddit', async (req, res) => {
		if (!req.query.sub) return res.json({ error: 'Error, specify a subreddit' });
		const data = await RedditHandler.fetchSubreddit(req.query.sub as string);
		return res.json(data);
	});

	return router;
}
