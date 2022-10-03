import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';


const client = new PrismaClient({ errorFormat: 'pretty',
	log: [
		{ level: 'info', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'error', emit: 'event' },
	] });

client.$use(async (params, next) => {
	const startTime = Date.now();
	const result = await next(params);
	const timeTook = Date.now() - startTime;

	logger(`Query ${params.model}.${params.action} took ${timeTook}ms`, 'debug');

	return result;
});

client.$on('info', (data) => {
	logger(data.message, 'log');
});

client.$on('warn', (data) => {
	logger(data.message, 'warn');
});

client.$on('error', (data) => {
	logger(data.message, 'error');
});

export default client;
