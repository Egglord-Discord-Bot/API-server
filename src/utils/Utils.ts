import { readdirSync, statSync } from 'fs';
import { join, parse, sep } from 'path';

export class Utils {
	public static generateRoutes(directory: string) {
		const seperator = '/';
		const results: FileOptions[] = [];
		for(const path of this.searchDirectory(directory)) {
			const { dir, name } = parse(path);
			const basePath = directory.split(sep).pop() as string;
			const dirIndex = dir.indexOf(basePath);
			const directoryRoute = dir.slice(dirIndex).split(sep).join(seperator).toString().replace(basePath, !basePath.startsWith(seperator) ? '' : seperator);
			results.push({ path, route: `${this.validateDynamicRoute(directoryRoute)}${this.validateDynamicRoute(name, true)}` });
		}
		return results;
	}
	private static validateDynamicRoute(context: string, isFile = false) {
		const seperator = '/';
		const dynamicRouteValidator = /(?<=\[).+?(?=\])/gi;
		const validate = (dynamicRouteValidator.exec(context));
		if(!validate) return isFile ? `${seperator}${context}` : context;
		return context.replace(`[${validate[0]}]`, isFile ? `${seperator}:${validate[0]}` : `:${validate[0]}`);
	}

	public static searchDirectory(directory: string, files: string[] = []) {
		for(const file of readdirSync(directory)) {
			const path = join(directory, file);
			const is = statSync(path);
			if(is.isFile()) files.push(path);
			if(is.isDirectory()) files = files.concat(this.searchDirectory(path));
		}
		return files;
	}
}

interface FileOptions {
	path: string,
	route: string,
}
