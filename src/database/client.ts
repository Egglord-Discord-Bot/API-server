import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/Logger';


const client = new PrismaClient({ errorFormat: 'pretty',
	log: [
		{ level: 'info', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'error', emit: 'event' },
	] });

client.$use(async (params, next) => {
	const startTime = Date.now(),
		result = await next(params),
		timeTook = Date.now() - startTime;

	Logger.debug(`Query ${params.model}.${params.action} took ${timeTook}ms`);

	return result;
});

client.$on('info', (data) => {
	Logger.log(data.message, 'log');
});

client.$on('warn', (data) => {
	Logger.warn(data.message);
});

client.$on('error', (data) => {
	Logger.error(data.message);
});

export default client;
