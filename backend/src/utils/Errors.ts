import type { Response } from 'express';

export default class Error {
	/**
		* Tell the requestee they are missing a query parameter.
		* @param {Response} res The response to the requestee
		* @param {string} query The query that is missing
		* @returns Response
	*/
	public static MissingQuery(res: Response, query: string) {
		return res
			.status(412)
			.json({ error: `Missing query parameter: ${query}` });
	}

	/**
		* Tell the requestee they have an incorrect type for a query parameter.
		* @param {Response} res The response to the requestee
		* @param {string} query The query that is the incorrect type
		* @param {string} type The type the query should be
		* @returns Response
	*/
	public static IncorrectType(res: Response, query: string, type: string) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be type ${type}` });
	}

	/**
		* Tell the requestee their query parameter is out of range.
		* @param {Response} res The response to the requestee
		* @param {string} query The query that is not in the required range
		* @param {Array<Number>} values The 2 numbers the query should be inbetween
		* @returns Response
	*/
	public static InvalidRange(res: Response, query: string, values: number[]) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be inbetween ${values[0]} and ${values[1]}` });
	}

	/**
		* Tell the requestee their query parameter is not included in the given list.
		* @param {Response} res The response to the requestee
		* @param {string} query The query that is not in the required range
		* @param {Array<Number | string>} values The list of strings or numbers the query should be.
		* @returns Response
	*/
	public static InvalidValue(res: Response, query: string, values: Array<string | number>) {
		return res
			.status(412)
			.json({ error: `Query parameter: ${query} must be either: ${values.join(' or ')}` });
	}

	/**
		* Tell the requestee they are missing something in their body request.
		* @param {Response} res The response to the requestee
		* @param {string} query The body key that is incorrect or missing
		* @param {string} type The type the key should be.
		* @returns Response
	*/
	public static MissingFromBody(res: Response, query: string, type: string) {
		return res
			.status(412)
			.json({ error: `Request body property: ${query} is missing or not type: ${type}.` });
	}

	/**
		* Tell the requestee an error occured.
		* @param {Response} res The response to the requestee
		* @param {string} errMsg The error message
		* @returns Response
	*/
	public static GenericError(res: Response, errMsg: string) {
		return res
			.status(500)
			.json({ error: `${errMsg} If this error keeps occurring, please contact support.` });
	}

	/**
		* Tell the requestee the path is invalid.
		* @param {Response} res The response to the requestee
		* @param {string} endpoint The endpoint that doesn't exist
		* @returns Response
	*/
	public static MissingEndpoint(res: Response, endpoint: string) {
		return res
			.status(404)
			.json({ error: `${endpoint} is not a valid endpoint.` });
	}

	/**
		* Tell the requestee the endpoint is currently disabled.
		* @param {Response} res The response to the requestee
		* @returns Response
	*/
	public static DisabledEndpoint(res: Response) {
		return res
			.status(506)
			.json({ error: 'This endpoint is currently disabled.' });
	}

	/**
		* Tell the requestee they do not have permission to access the endpoint.
		* @param {Response} res The response to the requestee
		* @returns Response
	*/
	public static MissingAccess(res: Response) {
		return res
			.status(403)
			.json({ error: 'You are not authorised to use this endpoint' });
	}

	/**
		* Tell the requestee they are likely not logged in.
		* @param {Response} res The response to the requestee
		* @returns Response
	*/
	public static Unauthorized(res: Response) {
		return res
			.status(401)
			.json({ error: 'You are unauthorized to access this endpoint' });
	}

	/**
		* Tell the requestee they are currently globally rate limited.
		* @param {Response} res The response to the requestee
		* @returns Response
	*/
	public static GlobalRateLimit(res: Response) {
		return res
			.status(429)
			.json({ error: 'You are globally rate-limited.' });
	}

	/**
		* Tell the requestee they are currently rate limited on that endpoint.
		* @param {Response} res The response to the requestee
		* @returns Response
	*/
	public static RateLimited(res: Response) {
		return res
			.status(429)
			.json({ error: 'You are rate-limited on this endpoint.' });
	}
}
