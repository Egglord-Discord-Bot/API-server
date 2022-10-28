import { createEndpointData, fetchEndpointData } from '../database/endpointData';
import { join } from 'path';
import { Utils } from '../utils/Utils';

export default async function EndpointData() {
	console.log('Checking database for new endpoints');

	const endpointsBasedOnFiles = Utils.generateRoutes(join(__dirname, '../', 'routes')).filter(e => e.route !== '/index');
	const fileData = await Promise.all(endpointsBasedOnFiles.map(e => import(`${e.path}`)));
	const files = fileData
		.map(e => e.default())
		.map((j, index) => {
			return [...new Set(j.stack.map((l:any) => l.regexp.toString().replace('/^\\/', '').replace('\\/?$/i', '')))].map(i => `${endpointsBasedOnFiles[index].route}/${i}`);
		}).flat();

	const endpointsBasedOnDB = await fetchEndpointData();
	const endpointsNotOnDB = files.filter(e => !endpointsBasedOnDB.map(end => end.name).includes(e) && e.startsWith('/api/'));

	console.log(`Found ${endpointsNotOnDB.length} new endpoints`);
	for (const newEndpoint of endpointsNotOnDB) {
		await createEndpointData({ name: newEndpoint });
	}
}
