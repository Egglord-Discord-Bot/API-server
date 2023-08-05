import CacheHandler from './CacheHandler';
import type { ImageRawRequest, ImageObject } from '../../types/misc/DuckDuckGo';
import axios from 'axios';

export default class DuckDuckGoHandler extends CacheHandler {
	public headers: { [key: string]: string };
	public url: string;
	constructor() {
		super();
		this.url = 'https://duckduckgo.com/i.js';
		this.headers = {
			'dnt': '1',
			'accept-encoding': 'gzip, deflate, sdch',
			'x-requested-with': 'XMLHttpRequest',
			'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6,ms;q=0.4',
			'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': 'https://duckduckgo.com/',
			'authority': 'duckduckgo.com',
		};
	}

	/**
    * Search for images
    * @param {string} query The query to search for
  */
	async search(query: string): Promise<Array<ImageObject>> {
		const token = await this._fetchToken(query);
		const { data } = await axios.get(this.url, {
			headers: this.headers,
			params: {
				'l': 'wt-wt',
				'o': 'json',
				'q': query,
				'vqd': token,
				'f': ',,,',
				'p': -1,
			},
		});

		return this.createImageObject(data.results);
	}

	/**
    * Fetch user token
    * @param {string} name The query to search for
  */
	private async _fetchToken(name: string): Promise<string> {
		const { data: tokenFetched } = await axios.get('https://duckduckgo.com/', {
			params: {
				q: name,
			},
		});
		return tokenFetched.match(/vqd=([\d-]+)/)[1];
	}

	/**
		* Convert RAW image data to clean data
		* @param {Array<ImageRawRequest> | ImageRawRequest} obj The raw image data from request
	*/
	createImageObject(obj: Array<ImageRawRequest>): Array<ImageObject> {
		return obj.map(i => ({
			imageURL: i.image,
			height: i.height,
			width: i.width,
		}));
	}
}
