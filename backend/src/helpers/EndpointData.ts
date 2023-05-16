import type Client from './Client';
import { join } from 'path';
import { Utils } from '../utils/Utils';
import { Logger } from '../utils/Logger';

export default async function EndpointData(client: Client) {
	Logger.debug('Checking database for new endpoints');

	const endpointsBasedOnFiles = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');
	const fileData = await Promise.all(endpointsBasedOnFiles.map(e => import(`${e.path}`)));
	const files = fileData
		.map(e => e.run(client))
		.map((j, index) => {
			return [...new Set(j.stack.map((l:any) => l.regexp.toString().replace('/^\\/', '').replace('\\/?$/i', '')))].map(i => `${endpointsBasedOnFiles[index].route}/${i}`);
		}).flat();

	const endpointsBasedOnDB = await client.EndpointManager.fetchEndpointData();
	const endpointsNotOnDB = files.filter(e => !endpointsBasedOnDB.map(end => end.name).includes(e) && e.startsWith('/api/'));

	Logger.debug(`Found ${endpointsNotOnDB.length} new endpoints`);
	for (const newEndpoint of endpointsNotOnDB) {
		await client.EndpointManager.create({ name: newEndpoint });
	}
}
