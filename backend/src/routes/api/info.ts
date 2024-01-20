import { Router } from 'express';
const router = Router();
import { CacheHandler } from '../../helpers';
import axios from 'axios';
import { Utils, Error } from '../../utils';
import { RedditPost } from '../../types/socials/Reddit';
import { translate } from '@vitalets/google-translate-api';
import languages from '../../assets/JSON/languages.json';
import radioStationData from '../../assets/JSON/radio-stations.json';
import type { RadioStation } from '../../types';
import { getSong } from 'genius-lyrics-api';
export type redditType = 'hot' | 'new';
import type Client from '../../helpers/Client';

type redditChild = {
	data: object;
};
type redditData = {
	children: redditChild[];
};

export function run(client: Client) {
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
		const country = (req.query.country ?? 'all') as string;

		let data = {};
		if (CovidHandler.data.get(country)) {
			data = CovidHandler.data.get(country) as object;
		} else {
			try {
				if (country != 'all') {
					data = (await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`)).data;
					CovidHandler.data.set(country, data);
				} else {
					data = (await axios.get('https://disease.sh/v3/covid-19/all')).data;
					CovidHandler.data.set('all', data);
				}
				CovidHandler._addData({
					id: country,
					data: data,
				});
			} catch (err) {
				client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
				return Error.GenericError(res, `Failed to look up COVID-19 statisic ${country !== 'all' ? `in country ${country}.` : '.'}`);
			}
		}

		res.json({
			data: data,
		});
	});

	/**
	 * @openapi
	 * /info/radio:
	 *  get:
	 *    description: Get a list of radio stations
	 *    parameters:
	 *       - name: search
	 *         description: The query to search for radio station
	 *         required: true
	 *         type: string
	 */
	router.get('/radio', async (req, res) => {
		const query = req.query.search as string;
		if (!query) return Error.MissingQuery(res, 'search');

		// Check if it's a website or not
		const WEBSITE_REGEX = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?/g,
			stations = [];
		if (WEBSITE_REGEX.test(query)) {
			stations.push(...(radioStationData as Array<RadioStation>).filter((r) => r.website == query));
		} else {
			stations.push(...(radioStationData as Array<RadioStation>).filter((r) => r.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10));
		}

		res.json({
			data: stations,
		});
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
				if (!p) return Error.GenericError(res, `Subreddit: ${sub} does not exist or doesn't have any posts yet.`);

				// Return the data
				RedditHandler._addData({
					id: `${sub}_${type}`,
					data: dataRes.data,
				});
				sentData = new RedditPost(p);
			} catch (err) {
				client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
				return Error.GenericError(res, `Failed to fetch posts from subreddit: ${sub}.`);
			}
		}
		res.json({
			data: sentData,
		});
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
		if (!npmPackage) {
			return res.json({
				error: 'No NPM package was provided in the query',
			});
		}

		let sentData = {};
		if (NPMHandler.data.get(npmPackage)) {
			sentData = NPMHandler.data.get(npmPackage) as object;
		} else {
			try {
				const { data } = await axios.get(`https://registry.npmjs.com/${encodeURIComponent(req.query.package as string)}`);
				const resp = {
					version: Object.keys(data.versions).reverse(),
					description: data.description,
					contributors: data.contributors,
					homepage: data.homepage,
					keywords: data.keywords,
					repository: data.repository,
					bugs: data.bugs,
					license: data.license,
				};
				NPMHandler._addData({
					id: npmPackage,
					data: resp,
				});
				sentData = resp;
			} catch (err) {
				const error = `Failed to fetch NPM data with name: ${npmPackage}.`;
				// Check if there isn't a package with the request name
				if (axios.isAxiosError(err)) {
					client.Logger.error(JSON.stringify(err.response?.data));
					return Error.GenericError(res, err.response?.status == 404 ? `No Package with the name ${npmPackage} exists on NPM.` : error);
				} else {
					client.Logger.error(err);
					return Error.GenericError(res, error);
				}
			}
		}
		res.json({
			data: sentData,
		});
	});

	/**
	 * @openapi
	 * /info/stable-diffusion:
	 *  get:
	 *    description: Translate a message
	 *    tags: info
	 *    parameters:
	 *       - name: text
	 *         description: The text to translate
	 *         required: true
	 *         type: string
	 */
	router.get('/stable-diffusion', async (_req, res) => {
		res.json({
			error: 'coming soon',
		});
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
	type stuff = 'English' | 'Afrikaans';
	router.get('/translate', async (req, res) => {
		// Get text to translate
		const text = req.query.text;
		if (!text) return Error.MissingQuery(res, 'text');

		const lang = languages[(req.query.lang as unknown as stuff) ?? 'English'];
		if (!lang) {
			return res.json({
				error: 'Invalid language',
			});
		}

		try {
			const { text: response } = await translate(text as string, {
				to: lang,
			});
			res.json({
				data: response,
			});
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, `Failed to translate text to language: ${lang}.`);
		}
	});

	/**
	 * @openapi
	 * /info/lyrics:
	 *   get:
	 *     description: Get lyrics of a song
	 *     tags: info
	 *     parameters:
	 *       - name: geniusApiKey
	 *         description: The api key from genius
	 *         required: true
	 *         type: string
	 *       - name: title
	 *         description: The title of the song
	 *         required: true
	 *         type: string
	 *       - name: artist
	 *         description: The artist of the song
	 *         required: false
	 *         type: string
	 *     responses:
	 *       200:
	 *         description: Successful response
	 *         content:
	 *           application/json:
	 *             example:
	 *               data:
	 *                 title: "Song Title"
	 *                 url: "https://genius.com/your-song"
	 *                 albumArt: "https://example.com/album-art.jpg"
	 *                 lyrics: ["Verse 1", "Chorus", "Verse 2", "Bridge"]
	 *       400:
	 *         description: Bad request
	 *         content:
	 *           application/json:
	 *             example:
	 *               error: "Missing required parameter: geniusApiKey"
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             example:
	 *               error: "Failed to fetch lyrics from song: Artist - Title."
	 */
	router.get('/lyrics', async (req, res) => {
		const geniusApiKey = req.query.apiKey as string;
		const title = req.query.title as string;
		const artist = req.query.artist as string;

		if (!geniusApiKey) return Error.MissingQuery(res, 'geniusApiKey');
		if (!title) return Error.MissingQuery(res, 'title');
		if (!artist) return Error.MissingQuery(res, 'artist');

		try {
			const options = {
				apiKey: geniusApiKey,
				title: title,
				artist: artist,
				optimizeQuery: true,
			};

			const songInfo = await getSong(options);

			if (!songInfo.lyrics) return Error.GenericError(res, `No lyrics could be found from a song called: ${title}.`);

			res.json({
				data: {
					title: songInfo.title,
					url: songInfo.url,
					albumArt: songInfo.albumArt,
					lyrics: songInfo.lyrics,
				},
			});
		} catch (err) {
			client.Logger.error(err);
			Error.GenericError(res, `Failed to fetch lyrics from song: ${artist} - ${title}.`);
		}
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
			const { data } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${phrase}`);
			res.json({
				data,
			});
		} catch (err) {
			client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
			Error.GenericError(res, `Failed to fetch definition(s) of word: ${phrase}.`);
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
	 */
	router.get('/weather', async (req, res) => {
		// Get location to get weather from
		const location = encodeURIComponent(req.query.location as string);
		if (!location) return Error.MissingQuery(res, 'location');

		let sentData = {};
		if (WeatherHandler.data.get(`${location}`)) {
			sentData = WeatherHandler.data.get(`${location}`) as object;
		} else {
			try {
				const { data } = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.weatherAPI}&q=${location}`);
				WeatherHandler._addData({
					id: `${location}`,
					data: data,
				});
				sentData = data;
			} catch (err) {
				client.Logger.error(axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : err);
				return Error.GenericError(res, `Failed to get weather for location: ${location}.`);
			}
		}
		res.json({
			data: sentData,
		});
	});

	router.get('/validate', (_req, res) => {
		res.json({
			data: 'Correct API token',
		});
	});

	return router;
}
