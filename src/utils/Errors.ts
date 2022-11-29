import type { Response } from 'express';

export default class Error {
	public static MissingQuery(res: Response, query: string) {
		return res
			.status(412)
			.json({ error: `Missing query parameter: ${query}` });
	}

	public static IncorrectType(res: Response, query: string, type: string) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be type ${type}` });
	}

	public static InvalidRange(res: Response, query: string, values: number[]) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be inbetween ${values[0]} and ${values[1]}` });
	}

	public static InvalidValue(res: Response, query: string, values: string[]) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be either: ${values.join(' or ')}` });
	}

	public static GenericError(res: Response, errMsg: string) {
		return res
			.status(500)
			.json({ error: errMsg });
	}
}
