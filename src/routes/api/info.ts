import { Router } from 'express';
const router = Router();
import Reddit from '../../helpers/Reddit';
import Covid from '../../helpers/Covid';
import { CONSTANTS } from '../../utils/CONSTANTS';
import axios from 'axios';

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

	router.get('/npm', async (req, res) => {
		if (!req.query.package) return res.json({ error: 'No npm package was provided in the query' });

		const data = (await axios.get(`https://registry.npmjs.com/${encodeURIComponent(req.query.package as string)}`)).data;
		return res.json({
			contributors: data.contributors,
			homepage:  data.homepage,
			keywords: data.keywords,
			repository: data.repository,
			bugs: data.bugs,
			license: data.license,
		});
	});

	return router;
}
