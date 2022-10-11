import axios from 'axios';
import CacheHandler from './CacheHandler';
export type redditType = 'hot' | 'new';

export default class Covid extends CacheHandler {

	async fetchData(country: string) {
		if (this.data.get(country ?? '/all')) {
			console.log('Covid hit cache');
			return this.data.get(country ?? '/all');
		} else {
			console.log('Didn\t hit cache');
			let data = {};
			if (country) {
				data = (await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`)).data;
				this.data.set(country, data);
			} else {
				data = (await axios.get('https://disease.sh/v3/covid-19/all')).data;
				this.data.set('/all', data);
			}
			this._addData({ id: country, data: data });
			return data;
		}
	}
}
