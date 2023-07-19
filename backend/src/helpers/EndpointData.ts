import type Client from './Client';
import { join } from 'path';
import { Utils, Logger } from '../utils';

export default async function EndpointData(client: Client) {
	Logger.debug('Checking database for new endpoints');

	const endpointsBasedOnFiles = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');
	const fileData = await Promise.all(endpointsBasedOnFiles.map(e => import(`${e.path}`)));
	const files = fileData
		.map(e => e.run(client))
		.map((j, index) => {
			return [...new Set(j.stack.map((l: any) => {
				const text = l.regexp.toString() as string;
				return text.substring(4, text.length - 6).split('\\/').join('/');
			}))].filter(i => i !== '/').map(i => `${endpointsBasedOnFiles[index].route}/${i}`);
		}).flat();

	const endpointsFromOnDB = await client.EndpointManager.fetchEndpointData();
	const endpointsNotOnDB = files.filter(e => !endpointsFromOnDB.map(end => end.name).includes(e) && e.startsWith('/api/'));

	// Delete old endpoints
	const endpointsToBeDeleted = endpointsFromOnDB.filter(d => files.indexOf(d.name) == -1);
	Logger.debug(`Found ${endpointsToBeDeleted.length} old endpoints`);
	for (const oldEndpoint of endpointsToBeDeleted) {
		await client.EndpointManager.delete(oldEndpoint.name);
	}

	// Add new endpoints
	Logger.debug(`Found ${endpointsNotOnDB.length} new endpoints`);
	for (const newEndpoint of endpointsNotOnDB) {
		await client.EndpointManager.create({ name: newEndpoint });
	}
}
