import chalk from 'chalk';
import moment from 'moment';
import { createRollingFileLogger } from 'simple-node-logger';
const log = createRollingFileLogger({
	logDirectory: './src/utils/logs',
	fileNamePattern: 'roll-<DATE>.log',
	dateFormat: 'YYYY.MM.DD',
});

export type loggerTypes = 'log' | 'warn' | 'error' | 'debug' | 'ready'

export function logger(content: string, type: loggerTypes = 'log') {
	if (content == 'error') return;
	const timestamp = `[${moment().format('HH:mm:ss:SSS')}]:`;
	switch (type) {
		case 'log':
			log.info(content);
			console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
			break;
		case 'warn':
			log.warn(content);
			console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
			break;
		case 'error':
			log.error(content);
			console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
			break;
		case 'debug':
			log.debug(content);
			console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
			break;
		case 'ready':
			log.info(content);
			console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
			break;
		default:
			break;
	}
}

export function ready(content: string) {
	logger(content, 'ready');
}

export function warn(content: string) {
	logger(content, 'warn');
}
export function error(content: string) {
	logger(content, 'error');
}
export function debug(content: string) {
	logger(content, 'debug');
}
