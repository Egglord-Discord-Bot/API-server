import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { chechAuth } from '../utils/middleware';
import { fetchSubreddit } from '../utils/index';

export default function() {
	router.get('/covid', chechAuth, async (req, res) => {
		console.log(req.headers);
		const rese = await axios.get('https://disease.sh/v3/covid-19/all');
		res.json(rese.data);
	});

	router.get('/reddit', chechAuth, async (req, res) => {
		if (!req.query.sub) return res.json({ error: 'Error, specify a subreddit' });
		const data = await fetchSubreddit(req.query.sub as string);
		return res.json(data);
	});

	return router;
}
