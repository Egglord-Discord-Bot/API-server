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

	public static MissingFromBody(res: Response, query: string, type: string) {
		return res
			.status(412)
			.json({ error: `Request body property: ${query} is missing or not type: ${type}.` });
	}

	public static GenericError(res: Response, errMsg: string) {
		return res
			.status(500)
			.json({ error: `${errMsg} If this error keeps occurring, please contact support.` });
	}

	public static MissingEndpoint(res: Response, endpoint: string) {
		return res
			.status(404)
			.json({ error: `${endpoint} is not a valid endpoint.` });
	}

	public static DisabledEndpoint(res: Response) {
		return res
			.status(506)
			.json({ error: 'This endpoint is currently disabled.' });
	}

	public static MissingAccess(res: Response) {
		return res
			.status(403)
			.json({ error: 'You are not authorised to use this endpoint' });
	}

	public static Unauthorized(res: Response) {
		return res
			.status(401)
			.json({ error: 'You are unauthorized to access this endpoint' });
	}

	public static GlobalRateLimit(res: Response) {
		return res
			.status(429)
			.json({ error: 'You are globally rate-limited.' });
	}

	public static RateLimited(res: Response) {
		return res
			.status(429)
			.json({ error: 'You are rate-limited on this endpoint.' });
	}
}
