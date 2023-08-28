import chalk from 'chalk';
import moment from 'moment';
import { createRollingFileLogger } from 'simple-node-logger';
import onFinished from 'on-finished';
import type { loggerTypes, time } from '../types';
import type { Request, Response } from 'express';
import CONSTANTS from './CONSTANTS';

const log = createRollingFileLogger({
	logDirectory: './src/utils/logs',
	fileNamePattern: 'roll-<DATE>.log',
	dateFormat: 'YYYY.MM.DD',
	level: 'all',
});

export default class Logger {

	log(content: string, type: loggerTypes = 'log') {
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
				if (!process.env.debug) return;
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

	ready(content: string) {
		this.log(content, 'ready');
	}

	warn(content: string) {
		this.log(content, 'warn');
	}

	error(content: string | unknown) {
		this.log(`${content}`, 'error');
	}

	debug(content: string) {
		this.log(content, 'debug');
	}

	async connection(req: Request & time, res: Response & time) {
		// Update request
		await new Promise((resolve) => {
			onFinished(req, function() {
				req._endTime = new Date().getTime();
				resolve('');
			});
		});

		// Update response
		await new Promise((resolve) => {
			onFinished(res, function() {
				res._endTime = new Date().getTime();
				resolve('');
			});
		});

		// Get additional information
		const	method = req.method,
			url = req.originalUrl || req.url,
			status = res.statusCode,
			color = status >= 500 ? 'bgRed' : status >= 400 ? 'bgMagenta' : status >= 300 ? 'bgCyan' : status >= 200 ? 'bgGreen' : 'dim',
			requester = Logger.getIP(req);

		// How long did it take for the page to load
		let response_time;
		if (res._endTime && req._endTime) response_time = (res._endTime + req._endTime) - (res._startTime + req._startTime);

		if (['bgCyan', 'bgGreen', 'dim'].includes(color)) {
			this.log(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`, 'log');
		} else if (color == 'bgMagenta') {
			this.warn(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`);
		} else {
			this.error(`${requester} ${method} ${url} ${chalk[color](status)} - ${(response_time ?? '?')} ms`);
		}
	}

	private static getIP(req: Request) {
		if (req.headers) {
			// Standard headers used by Amazon EC2, Heroku, and others.
			if (CONSTANTS.ipv4Regex.test(req.headers['x-client-ip'] as string)) return req.headers['x-client-ip'];

			// CF-Connecting-IP - applied to every request to the origin. (Cloudflare)
			if (CONSTANTS.ipv4Regex.test(req.headers['cf-connecting-ip'] as string)) return req.headers['cf-connecting-ip'];

			// Fastly and Firebase hosting header (When forwared to cloud function)
			if (CONSTANTS.ipv4Regex.test(req.headers['fastly-client-ip'] as string)) return req.headers['fastly-client-ip'];

			// Akamai and Cloudflare: True-Client-IP.
			if (CONSTANTS.ipv4Regex.test(req.headers['true-client-ip'] as string)) return req.headers['true-client-ip'];

			// Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
			if (CONSTANTS.ipv4Regex.test(req.headers['x-real-ip'] as string)) return req.headers['x-real-ip'];

			// (Rackspace LB and Riverbed's Stingray)
			// http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
			// https://splash.riverbed.com/docs/DOC-1926
			if (CONSTANTS.ipv4Regex.test(req.headers['x-cluster-client-ip'] as string)) return req.headers['x-cluster-client-ip'];

			if (CONSTANTS.ipv4Regex.test(req.headers['x-forwarded'] as string)) return req.headers['x-forwarded'];

			if (CONSTANTS.ipv4Regex.test(req.headers['forwarded-for'] as string)) return req.headers['forwarded-for'];

			if (CONSTANTS.ipv4Regex.test(req.headers.forwarded as string)) return req.headers.forwarded;
		}

		// Remote address checks.
		if (req.socket) {
			if (CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;
			if (req.socket && CONSTANTS.ipv4Regex.test(req.socket.remoteAddress ?? '')) return req.socket.remoteAddress;
		}

		return req.ip;
	}
}
