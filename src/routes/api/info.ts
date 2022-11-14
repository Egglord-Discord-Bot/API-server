import { Router } from 'express';
const router = Router();
import CacheHandler from '../../helpers/CacheHandler';
import { CONSTANTS } from '../../utils/CONSTANTS';
import axios from 'axios';
import { Utils } from '../../utils/Utils';
import { RedditPost } from '../../utils/types';
import { translate } from '@vitalets/google-translate-api';
import languages from '../../assets/JSON/languages.json';

export type redditType = 'hot' | 'new';

type redditChild = {
	data: object
}
type redditData = {
	children: redditChild[]
}

export default function() {

	// Covid endpoint
	const CovidHandler = new CacheHandler();
	router.get('/covid', async (req, res) => {
		const country = (req.query.country ?? '/all') as string;
		let data = {};
		if (CovidHandler.data.get(country)) {
			console.log('Covid hit cache');
			data = CovidHandler.data.get(country) as object;
		} else {
			console.log('Didn\t hit cache');
			if (country != '/all') {
				data = (await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`)).data;
				CovidHandler.data.set(country, data);
			} else {
				data = (await axios.get('https://disease.sh/v3/covid-19/all')).data;
				CovidHandler.data.set('/all', data);
			}
			CovidHandler._addData({ id: country, data: data });
		}

		// Check cache first
		res.json(data);
	});

	// Reddit endpoint
	const RedditHandler = new CacheHandler();
	router.get('/reddit', async (req, res) => {
		if (!req.query.sub) return res.json({ error: CONSTANTS.REDDIT_MISSINGQUERY });
		const sub = req.query.sub as string,
			type = req.query.type ?? 'new';

		let sentData;
		if (RedditHandler.data.get(`${sub}_${type}`)) {
			console.log('Hit cache');
			const data = RedditHandler.data.get(`${sub}_${type}`) as redditData;
			sentData = new RedditPost(data.children[Utils.randomInteger(21)].data);
		} else {
			console.log('Didn\'t hit cache');
			const dataRes = (await axios.get(`https://reddit.com/r/${sub}/${type}.json?limit=20`)).data;

			// Make sure the subreddit has posts
			const post = dataRes.data.children[Utils.randomInteger(21)];
			const p = post?.data;
			if (!p) {
				res.json({ error: 'Subreddit does not exist or doesn\'t have any posts yet.' });
			}

			// Return the data
			RedditHandler._addData({ id: `${sub}_${type}`, data: dataRes.data });
			sentData = new RedditPost(p);
		}
		res.json(sentData);
	});

	router.get('/npm', async (req, res) => {
		if (!req.query.package) return res.json({ error: 'No NPM package was provided in the query' });

		const data = (await axios.get(`https://registry.npmjs.com/${encodeURIComponent(req.query.package as string)}`)).data;
		return res.json({
			version: Object.keys(data.versions).reverse(),
			description: data.description,
			contributors: data.contributors,
			homepage:  data.homepage,
			keywords: data.keywords,
			repository: data.repository,
			bugs: data.bugs,
			license: data.license,
		});
	});

	type stuff = 'English' | 'Afrikaans'
	router.get('/translate', async (req, res) => {
		// Get text to translate
		const text = req.query.text;
		if (!text) return res.json({ error: 'Missing text in query' });

		const lang = languages[req.query.lang as unknown as stuff ?? 'English'];
		if (!lang) return res.json({ error: 'Invalid language' });

		try {
			const { text: response } = await translate(text as string, { to: lang });
			res.json({ success: response });
		} catch (err: any) {
			res.json({ error: err.message });
		}
	});

	return router;
}
