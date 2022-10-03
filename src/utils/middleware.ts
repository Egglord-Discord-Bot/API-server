import type { Request, Response, NextFunction } from 'express';
import { fetchUserByToken } from '../database/User';
import { createEndpoint, fetchEndpointUsagePerUser } from '../database/endpointUsage';
import type { Profile } from 'passport-discord';

/**
	* Check if an image was sent with the request
	* @param req The endpoint the user is trying to access
	* @param res The user trying to access the endpoint
	* @param next The user trying to access the endpoint
	* @returns Whether or not they are being ratelimited
*/
export function checkImage(req: Request, res: Response, next: NextFunction) {
	const image = req.query.image;
	if (!image) return res.json({ error: 'Missing image query' });
	next();
}

type User = {
	id: string
}
/**
	* Check if the user is ratelimited on that endpoint
	* @param url The endpoint the user is trying to access
	* @param user The user trying to access the endpoint
	* @returns Whether or not they are being ratelimited
*/
export async function checkRatelimit(url: string, user: User) {
	// Fetch user's usage for this endpoint and get latest usage
	const fetchEndpointUsage = await fetchEndpointUsagePerUser({ endpoint: url.split('?')[0], id: user.id });
	console.log(fetchEndpointUsage);
	const getLatestEndpointUsage = fetchEndpointUsage.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

	// Make sure they haven't used this endpoint within 1 second from the last
	if (!getLatestEndpointUsage) return false;
	return getLatestEndpointUsage.createdAt.getTime() > (new Date().getTime() - 5000);
}

// Make sure the user is logged in any ways
export async function chechAuth(req: Request, res: Response, next: NextFunction) {
	console.log(req);
	// If they are on browser see if they are logged in
	if (req.isAuthenticated()) {
		// Check if they are on cooldown
		if (await checkRatelimit(req.baseUrl, (req.user as Profile))) return res.status(429).json({ error: 'You are accessing this endpoint too quickly' });

		createEndpoint({ id: (req.user as Profile).id, endpoint: req.baseUrl.split('?')[0] });
		return next();
	}

	// They might be trying to connect via their token
	if (req.headers.authorization || req.query.token) {
		// Check authorization header
		if (req.headers.authorization) {
			const user = await fetchUserByToken({ token: req.headers.authorization });
			if (user) {
				if (await checkRatelimit(req.baseUrl, user)) return res.status(429).json({ error: 'You are accessing this endpoint too quickly' });

				createEndpoint({ id: user.id, endpoint: req.baseUrl.split('?')[0] });
				return next();
			}
		}

		// Check token query in URL
		if (req.query.token) {
			const user = await fetchUserByToken({ token: (req.query.token as string) });
			if (user) {
				if (await checkRatelimit(req.baseUrl, user)) return res.status(429).json({ error: 'You are accessing this endpoint too quickly' });

				createEndpoint({ id: user.id, endpoint: req.baseUrl.split('?')[0] });
				return next();
			}
		}
	}

	// they are not logged in or using a token
	res.status(403).json({ error: 'Missing authentication for this endpoint' });
}
