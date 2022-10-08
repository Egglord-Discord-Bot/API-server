import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { chechAuth } from '../../utils/middleware';
import { fetchSubreddit } from '../../utils/index';

const covidCache = new Map();

export default function() {
	router.get('/covid', chechAuth, async (req, res) => {
		// Check cache first
		let data = {};
		const country = req.query.country as string;
		if (covidCache.get(country ?? '/all')) {
			console.log('Covid hit cache');
			data = covidCache.get(country ?? '/all');
		} else {
			console.log('Didn\t hit cache');
			if (req.query.country) {
				data = (await axios.get(`https://disease.sh/v3/covid-19/countries/${req.query.country}`)).data;
				covidCache.set(country, data);
			} else {
				data = (await axios.get('https://disease.sh/v3/covid-19/all')).data;
				covidCache.set('/all', data);
			}
		}

		res.json(data);
	});

	router.get('/reddit', chechAuth, async (req, res) => {
		if (!req.query.sub) return res.json({ error: 'Error, specify a subreddit' });
		const data = await fetchSubreddit(req.query.sub as string);
		return res.json(data);
	});

	return router;
}
