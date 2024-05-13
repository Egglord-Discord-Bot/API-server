import { readdirSync, statSync } from 'fs';
import { join, parse, sep } from 'path';
import type { Request } from 'express';
import { decode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

type LabelEnum = { [key: string]: JWT }
const sessionStore: LabelEnum = {};

interface FileOptions {
	path: string,
	route: string,
}

export default class Utils {
	/**
		* Get all files in a directory (including sub-directories)
		* @param {string} directory The response to the requestee
		* @returns An array of file paths
	*/
	public static generateRoutes(directory: string) {
		const seperator = '/';
		const results: FileOptions[] = [];
		for (const path of this.searchDirectory(directory)) {
			const { dir, name } = parse(path);
			const basePath = directory.split(sep).pop() as string;
			const dirIndex = dir.indexOf(basePath);
			const directoryRoute = dir.slice(dirIndex).split(sep).join(seperator).toString().replace(basePath, !basePath.startsWith(seperator) ? '' : seperator);
			results.push({ path, route: `${this.validateDynamicRoute(directoryRoute)}${this.validateDynamicRoute(name, true)}` });
		}
		return results;
	}

	/**
		* Create the full path
		* @param {string} context The name of the file or directory
		* @param {boolean} isFile Whether or not the context if a file or not
		* @returns An array of file paths
	*/
	private static validateDynamicRoute(context: string, isFile = false) {
		const seperator = '/';
		const dynamicRouteValidator = /(?<=\[).+?(?=\])/gi;
		const validate = (dynamicRouteValidator.exec(context));
		if(!validate) return isFile ? `${seperator}${context}` : context;
		return context.replace(`[${validate[0]}]`, isFile ? `${seperator}:${validate[0]}` : `:${validate[0]}`);
	}

	/**
		* Get the entries from a directory and check if they are more files or another directory
		* @param {string} directory The name of the directory
		* @param {Array<string>} files The files for saving context
		* @returns An array of file paths
	*/
	public static searchDirectory(directory: string, files: string[] = []) {
		for(const file of readdirSync(directory)) {
			const path = join(directory, file);
			const is = statSync(path);
			if (is.isFile()) files.push(path);
			if (is.isDirectory()) files = files.concat(this.searchDirectory(path));
		}
		return files;
	}

	/**
		* Generate a random integer
		* @param {string} num1 The name of the directory
		* @returns A number
	*/
	public static randomInteger = (num1: number, num2 = 1) => Math.floor(Math.random() * num1) + num2;

	/**
		* Get the requestee's session
		* @param {string} req The Request
		* @returns The session if there is one
	*/
	public static async getSession(req: Request): Promise<JWT | null> {
		if (req.headers.cookie == undefined) return null;

		// get Session token from cookies
		const cookies: string[] = req.headers['cookie'].split('; ');
		const parsedcookies = cookies.map((i: string) => i.split('='));

		// Get session token (Could be secure or not so check both)
		let sessionToken = parsedcookies.find(i => i[0] == '__Secure-next-auth.session-token')?.[1];
		if (sessionToken == null) sessionToken = parsedcookies.find(i => i[0] == 'next-auth.session-token')?.[1];
		if (!sessionToken) return null;

		try {
			const session = await decode({ token: sessionToken, secret: process.env.sessionSecret as string });
			if (session == null) return null;
			sessionStore[sessionToken] = session;
			return session;
		} catch (err) {
			console.log(err);
			return null;
		}
	}

	public static parseMySQLConnectionString(connectionString: string) {
		const regex = /^mysql:\/\/([^:]+):([^/]+)@([^/:]+):(\d+)\/(.+)$/;
		const match = connectionString.match(regex);

		if (!match) throw new Error('Invalid MySQL connection string format');
		const [, username, password, host, port, database] = match;

		return {
			username,
			password,
			host,
			port: parseInt(port, 10),
			database,
		};
	}
}
