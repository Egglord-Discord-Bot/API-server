import { Router } from 'express';
const router = Router();
import { CacheHandler } from '../../helpers';
import axios from 'axios';
import { Utils, Error } from '../../utils';
import { RedditPost } from '../../types/socials/Reddit';
import { translate } from '@vitalets/google-translate-api';
import languages from '../../assets/JSON/languages.json';
import ud from 'urban-dictionary';
import { parseString } from 'xml2js';
export type redditType = 'hot' | 'new';

type redditChild = {
	data: object
}
type redditData = {
	children: redditChild[]
}

export function run() {
	const CovidHandler = new CacheHandler();
	const RedditHandler = new CacheHandler();
	const NPMHandler = new CacheHandler();
	const WeatherHandler = new CacheHandler();


	/**
	  * @openapi
	  * /info/covid:
	  *  get:
	  *    description: Get COVID stats on a country or the world.
	  *    parameters:
		*       - name: country
 	  *         description: The country to get COVID stats from
 	  *         required: false
 	  *         type: string
		*         default: all
	*/
	router.get('/covid', async (req, res) => {
		const country = (req.query.country ?? '/all') as string;

		let data = {};
		if (CovidHandler.data.get(country)) {
			data = CovidHandler.data.get(country) as object;
		} else {
			try {
				if (country != '/all') {
					data = (await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`)).data;
					CovidHandler.data.set(country, data);
				} else {
					data = (await axios.get('https://disease.sh/v3/covid-19/all')).data;
					CovidHandler.data.set('/all', data);
				}
				CovidHandler._addData({ id: country, data: data });
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}

		res.json({ data: data });
	});

	/**
	 * @openapi
	 * /info/reddit:
	 *  get:
	 *    description: Get a post from a subreddit
	 *    tags: info
	 *    parameters:
	 *       - name: sub
	 *         description: The subreddit to get the post from.
	 *         required: true
	 *         type: string
	 *       - name: type
	 *         description: The subreddit to get the post from.
	 *         required: false
	 *         default: new
	 *         enum: [new, hot, top]
	 *         type: string
	 */
	router.get('/reddit', async (req, res) => {
		const sub = req.query.sub as string,
			type = req.query.type ?? 'new';
		if (!sub) return Error.MissingQuery(res, 'sub');

		let sentData;
		if (RedditHandler.data.get(`${sub}_${type}`)) {
			const data = RedditHandler.data.get(`${sub}_${type}`) as redditData;
			sentData = new RedditPost(data.children[Utils.randomInteger(data.children.length)].data);
		} else {
			try {
				const dataRes = (await axios.get(`https://reddit.com/r/${sub}/${type}.json?limit=20`)).data;

				// Make sure the subreddit has posts
				const post = dataRes.data.children[Utils.randomInteger(21)];
				const p = post?.data;
				if (!p) return Error.GenericError(res, 'Subreddit does not exist or doesn\'t have any posts yet.');

				// Return the data
				RedditHandler._addData({ id: `${sub}_${type}`, data: dataRes.data });
				sentData = new RedditPost(p);
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}
		res.json({ data: sentData });
	});

	/**
	 * @openapi
	 * /info/npm:
	 *  get:
	 *    description: Get information on a NPM package
	 *    tags: info
	 *    parameters:
	 *       - name: package
	 *         description: The name of the package
	 *         required: true
	 *         type: string
	*/
	router.get('/npm', async (req, res) => {
		const npmPackage = req.query.package as string;
		if (!npmPackage) return res.json({ error: 'No NPM package was provided in the query' });

		let sentData = {};
		if (NPMHandler.data.get(npmPackage)) {
			sentData = NPMHandler.data.get(npmPackage) as object;
		} else {
			try {
				const data = (await axios.get(`https://registry.npmjs.com/${encodeURIComponent(req.query.package as string)}`)).data;
				const resp = {
					version: Object.keys(data.versions).reverse(),
					description: data.description,
					contributors: data.contributors,
					homepage:  data.homepage,
					keywords: data.keywords,
					repository: data.repository,
					bugs: data.bugs,
					license: data.license,
				};
				NPMHandler._addData({ id: npmPackage, data: resp });
				sentData = resp;
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}
		res.json({ data: sentData });
	});

	/**
	 * @openapi
	 * /info/translate:
	 *  get:
	 *    description: Translate a message
	 *    tags: info
	 *    parameters:
	 *       - name: text
	 *         description: The text to translate
	 *         required: true
	 *         type: string
	 *       - name: lang
	 *         description: The language to translate to
	 *         required: false
	 *         type: string
	 *         default: English
	*/
	type stuff = 'English' | 'Afrikaans'
	router.get('/translate', async (req, res) => {
		// Get text to translate
		const text = req.query.text;
		if (!text) return Error.MissingQuery(res, 'text');

		const lang = languages[req.query.lang as unknown as stuff ?? 'English'];
		if (!lang) return res.json({ error: 'Invalid language' });

		try {
			const { text: response } = await translate(text as string, { to: lang });
			res.json({ data: response });
		} catch (err: any) {
			return Error.GenericError(res, err.message);
		}
	});

	/**
	 * @openapi
	 * /info/lyrics:
	 *  get:
	 *    description: Get lyrics of a song
	 *    tags: info
	 *    parameters:
	 *       - name: title
	 *         description: The title of the song
	 *         required: true
	 *         type: string
	*/
	router.get('/lyrics', async (req, res) => {
		// Get text to translate
		const title = req.query.title;
		if (!title) return Error.MissingQuery(res, 'title');
		/*
		const info = await getSong({
			apiKey: bot.config.api_keys.genius,
			title: title,
			artist: '‎',
			optimizeQuery: true,
		});
		*/
		res.json({ data: 'Coming soon' });
	});

	/**
 * @openapi
 * /info/urban-dictionary:
 *  get:
 *    description: Translate a message
 *    tags: info
 *    parameters:
 *       - name: phrase
 *         description: The text to translate
 *         required: true
 *         type: string
*/
	router.get('/urban-dictionary', async (req, res) => {
		// Get text to translate
		const phrase = req.query.phrase as string;
		if (!phrase) return Error.MissingQuery(res, 'phrase');

		try {
			const data = await ud.define(phrase);
			res.json({ data });
		} catch (err: any) {
			return Error.GenericError(res, err.message);
		}
	});

	/**
 * @openapi
 * /info/weather:
 *  get:
 *    description: Get the weather of a location
 *    tags: info
 *    parameters:
 *       - name: location
 *         description: The location for the weather
 *         required: true
 *         type: string
 *       - name: tempType
 *         description: Either C or F (Celsuis or Fahrenheit)
 *         required: false
 *         type: string
 *         enum: [C, F]
*/
	router.get('/weather', async (req, res) => {
		// Get location to get weather from
		const location = encodeURIComponent(req.query.location as string);
		if (!location) return Error.MissingQuery(res, 'location');

		// Optional query param (temperature type Fahrenheit or Celsuis)
		let tempType = req.query.type as string;
		if (tempType) {
			if (!['C', 'F'].includes(tempType)) return Error.InvalidValue(res, tempType, ['C', 'F']);
		} else {
			tempType = 'C';
		}

		let sentData = {};
		if (WeatherHandler.data.get(`${location}_${tempType}`)) {
			sentData = WeatherHandler.data.get(`${location}_${tempType}`) as object;
		} else {
			try {
				const { data } = await axios.get(`http://weather.service.msn.com/find.aspx?src=outlook&weadegreetype=${tempType}&culture=en-US&weasearchstr=${location}`);

				parseString(data, function(err, result) {
					if (err) return Error.GenericError(res, err.message);

					const resp = {
						location: result.weatherdata.weather[0].$.weatherlocationname,
						current: result.weatherdata.weather[0].current[0].$,
						forecast: result.weatherdata.weather[0].forecast.map((d: any) => d.$),
					};
					WeatherHandler._addData({ id: `${location}_${tempType}`, data: resp });
					sentData = resp;
				});
			} catch (err: any) {
				console.log(err);
				return Error.GenericError(res, err.message);
			}
		}
		res.json({ data: sentData });
	});

	router.get('/validate', (_req, res) => {
		res.json({ data: 'Correct API token' });
	});

	return router;
}
