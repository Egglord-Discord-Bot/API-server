import { join } from 'path';
import { Utils } from '../utils';
import endpointData from '../database/endpointData';
import type { swaggerJsdocType } from '../types';
import type { ExtendedEndpoint } from '../types/database';
import type { Router }from 'express';
import type Client from './Client';
import fs from 'fs';


export default class EndpointManager extends endpointData {

	/**
		* Create an endpoint data
		* @returns The new endpoint data
	*/
	async fetchEndpointData(): Promise<Array<ExtendedEndpoint>> {
		// Check cache
		if (this.cache.random()?.data != undefined) {
			return [...this.cache.values()];
		} else {
			const endpoints: Array<ExtendedEndpoint> = [...(await this.fetchEndpoints(true, true)).values()];
			const openapiSpecification = JSON.parse(fs.readFileSync(`${process.cwd()}/src/assets/JSON/endpoints.json`).toString()) as swaggerJsdocType;
			const endpointsWithData = endpoints.map(e => ({ ...e, data: openapiSpecification.paths[`${e.name.replace('/api', '')}`]?.get }));

			// Update cache with the addition data
			endpointsWithData.forEach(e => this.cache.set(e.name, e));
			return endpointsWithData;
		}
	}

	/**
		* Check to see if endpoints have changed
		* @param {Client} client The client for interacting with database
	*/
	async checkEndpointData(client: Client) {
		const endpointsBasedOnFiles = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');
		const fileData = await Promise.all(endpointsBasedOnFiles.map(e => import(`${e.path}`)));
		const funFunctions = await Promise.all(fileData.map(async e => await e.run(client)));
		const files = funFunctions
			.map((j: Router, index) => {
				return [...new Set(j.stack.map(l => {
					const text = l.regexp.toString();
					return text.substring(4, text.length - 6).split('\\/').join('/');
				}))].filter(i => i !== '/').map(i => `${endpointsBasedOnFiles[index].route}/${i}`);
			}).flat();

		// Make sure if they are on the database update it
		const endpointsFromOnDB = [...(await this.fetchEndpoints()).values()];
		for (const endpoints of endpointsFromOnDB.filter(e => !e.isValid)) {
			await this.update({ name: endpoints.name, isValid: true });
		}

		const endpointsNotOnDB = files.filter(e => !endpointsFromOnDB.map(end => end.name).includes(e) && e.startsWith('/api/'));

		for (const newEndpoint of endpointsNotOnDB) {
			await this.create({ name: newEndpoint, isValid: true });
		}
	}
}
