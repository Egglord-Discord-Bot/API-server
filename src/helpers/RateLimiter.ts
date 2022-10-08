import type { Request, Response, NextFunction } from 'express';
import type { Profile } from 'passport-discord';
import { fetchUserByToken } from '../database/User';

type endpointUsage = {
  name: string
  lastAccess: Array<Date>
}

type RateLimitType = {
	global?: boolean
	isLoggedIn?: boolean
	isEndpoint?: boolean
}

interface endpointData {
  endpoints: endpointUsage[]
}

export default class RateLimit {
	userRatelimit: Map<string, endpointData>;
	constructor() {
		this.userRatelimit = new Map();

		this._sweep();
	}

	async checkRateLimit(req: Request, res: Response, next: NextFunction) {
		// Get the userID from the request
		const userID = await this._extractUserId(req);
		if (userID === null) return this._sendRateLimitMessage(res, { isLoggedIn: false });

		// Now check if user is rate limited by global rate Limit
		const isGloballyRateLimited = this._checkGlobalCooldown(userID);
		if (isGloballyRateLimited) return this._sendRateLimitMessage(res, { global: true }, userID);

		// Now check if user is rate limited by endpoint
		const isRateLimitedByEndpoint = this.checkEndpointUsage(userID, req.baseUrl.split('?')[0]);
		if (isRateLimitedByEndpoint) return this._sendRateLimitMessage(res, { global: false }, userID);

		// User is logged in and not ratelimited at all
		next();
	}

	async _extractUserId(req: Request) {
		// If they are on browser see if they are logged in
		if (req.isAuthenticated()) return (req.user as Profile).id;

		// They might be trying to connect via their token
		if (req.headers.authorization || req.query.token) {
			const user = await fetchUserByToken((req.headers.authorization || req.query.token) as string);
			return (user) ? user.id : null;
		}
		return null;
	}

	_checkGlobalCooldown(userID: string) {
		if (this.userRatelimit.get(userID)) {
			const data = this.userRatelimit.get(userID)?.endpoints.reduce((a, b) => b.lastAccess.length + a, 0) ?? 0;
			return (data >= 100);
		} else {
			return false;
		}
	}


	checkEndpointUsage(userID: string, endpoint: string) {
		if (this.userRatelimit.get(userID)) {
			// User has been cached
			if (this.userRatelimit.get(userID)?.endpoints.find(e => e.name == endpoint)) {
				const end = this.userRatelimit.get(userID)?.endpoints.find(e => e.name == endpoint);
				return (end!.lastAccess.sort((a, b) => a.getTime() - b.getTime())[0].getTime() >= new Date().getTime() - 5000);
			}
		}

		this.addEndpoint(userID, endpoint);
		return false;
	}

	addEndpoint(userId: string, endpoint: string) {
		if (this.userRatelimit.get(userId)) {
			const user = this.userRatelimit.get(userId);
			if (user?.endpoints.find(e => e.name == endpoint)) {
				this.userRatelimit.get(userId)?.endpoints.find(e => e.name == endpoint)?.lastAccess.push(new Date());
			} else {
				this.userRatelimit.get(userId)?.endpoints.push({ name: endpoint, lastAccess: [new Date()] });
			}
		} else {
			this.userRatelimit.set(userId, { endpoints: [{ name: endpoint, lastAccess: [new Date()] }] });
		}
	}

	_sendRateLimitMessage(res: Response, type: RateLimitType, userID?: string, endpoint?: string) {
		if (userID) {
			res.set({
				'X-RateLimit-Limit': `${type.global ? 100 : 5}`,
				'X-RateLimit-Remaining': `${type.global ? 0 : 5 - (this.userRatelimit.get(userID as string)?.endpoints.find(e => e.name == endpoint)?.lastAccess.length ?? 0)}`,
				'X-RateLimit-Reset': `${new Date()}`,
			})
				.status(429)
				.json({ error: `You are being ratelimited ${type.global ? 'globally' : 'on this endpoint.'}, Please try again later!` });
		} else {
			res
				.status(403)
				.json({ error:'You are not authorised to use this endpoint' });
		}
	}

	_sweep() {
		setInterval(() => {
			// Loop through each user
			for (const endpointData of this.userRatelimit.values()) {
				for (const { lastAccess } of endpointData.endpoints) {
					lastAccess.filter(i => i.getTime() <= new Date().getTime() - 5000);
				}
			}
		}, 1000);
	}
}
