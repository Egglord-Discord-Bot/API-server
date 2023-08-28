import { join } from 'path';
import { Utils } from '../utils';
import endpointData from '../database/endpointData';
import type { swaggerJsdocType, APIEndpointData } from '../types';
import type { Endpoint } from '@prisma/client';
import type { Router }from 'express';
import type Client from './Client';
import fs from 'fs';


export default class EndpointManager extends endpointData {

	/**
		* Create an endpoint data
		* @returns The new endpoint data
	*/
	async fetchEndpointData(): Promise<Array<Endpoint & { data: APIEndpointData }>> {
		const endpoints = [...(await this.fetchEndpoints()).values()];
		const openapiSpecification = JSON.parse(fs.readFileSync(`${process.cwd()}/src/assets/JSON/endpoints.json`).toString()) as swaggerJsdocType;
		return endpoints.map(e => ({ ...e, data: openapiSpecification.paths[`${e.name.replace('/api', '')}`]?.get }));
	}

	/**
		* Check to see if endpoints have changed
		* @param {Client} client The client for interacting with database
	*/
	async checkEndpointData(client: Client) {
		const endpointsBasedOnFiles = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');
		const fileData = await Promise.all(endpointsBasedOnFiles.map(e => import(`${e.path}`)));
		const files = fileData
			.map(e => e.run(client))
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
