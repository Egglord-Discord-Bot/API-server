import type { Request, Response, NextFunction } from 'express';
import type { Profile } from 'passport-discord';
import { fetchUserByToken } from '../database/User';
import { fetchEndpointData } from '../database/endpointData';
import { createEndpoint } from '../database/userHistory';

type endpointUsage = {
  name: string
  lastAccess: Array<Date>
}

type RateLimitType = {
	global?: boolean
	isLoggedIn?: boolean
	isEndpoint?: boolean
}
type endpointDataFromDB = {
  name: string
  cooldown: number
  maxRequests: number
  maxRequestper: number
}

interface endpointData {
  endpoints: endpointUsage[]
}

export default class RateLimit {
	userRatelimit: Map<string, endpointData>;
	lastChecked: number;
	endpointData: Array<endpointDataFromDB>;
	constructor() {
		this.endpointData = [];
		this.userRatelimit = new Map();
		this.lastChecked = new Date().getTime();

		this._sweep();
		this._fetchEndpointData();
	}

	async checkRateLimit(req: Request, res: Response, next: NextFunction) {
		// Get the userID from the request
		const userID = await this._extractUserId(req);
		if (userID === null) return this._sendRateLimitMessage(res, { isLoggedIn: false });

		// Now check if user is rate limited by global rate Limit
		const isGloballyRateLimited = this._checkGlobalCooldown(userID);
		if (isGloballyRateLimited) return this._sendRateLimitMessage(res, { global: true }, userID);

		// Now check if user is rate limited by endpoint
		const isRateLimitedByEndpoint = this.checkEndpointUsage(userID, req.originalUrl.split('?')[0]);
		if (isRateLimitedByEndpoint.isRateLimted) return this._sendRateLimitMessage(res, { global: false, isEndpoint: isRateLimitedByEndpoint.reason == 2 }, userID);

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
			// console.log('_checkGlobalCooldown', data);
			return (data >= 100);
		} else {
			return false;
		}
	}

	checkEndpointUsage(userID: string, endpoint: string) {
		let isRateLimted = { isRateLimted: false, reason: 0 };
		if (this.userRatelimit.get(userID)) {
			// User has been cached
			if (this.userRatelimit.get(userID)?.endpoints.find(e => e.name == endpoint)) {
				const end = this.userRatelimit.get(userID)?.endpoints.find(e => e.name == endpoint);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				if (end!.lastAccess.length >= this.endpointData.find(e => e.name == endpoint)!.maxRequests) return { isRateLimted: true, reason: 1 };

				isRateLimted = {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					isRateLimted: end!.lastAccess.sort((a, b) => b.getTime() - a.getTime())[0].getTime() >= new Date().getTime() - (this.endpointData.find(e => e.name == endpoint)?.cooldown ?? 2000),
					reason: 2 };
			}
		}

		// Only save to user's history if not ratelimited
		if (!isRateLimted.isRateLimted) this.addEndpoint(userID, endpoint);
		return isRateLimted;
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

		// Save to users' history
		createEndpoint({ id: userId, endpoint: endpoint });
	}

	_sendRateLimitMessage(res: Response, type: RateLimitType, userID?: string, endpoint?: string) {
		if (userID) {
			console.log(type);
			const rateLimitPointsRemaining = `${type.global || type.isEndpoint ?
				0
				: (this.endpointData.find(e => e.name == endpoint)?.maxRequests ?? 5) - (this.userRatelimit.get(userID as string)?.endpoints.find(e => e.name == endpoint)?.lastAccess.length ?? 0)}`;

			res.set({
				'X-RateLimit-Limit': `${type.global ? 100 : this.endpointData.find(e => e.name == endpoint)?.maxRequests ?? 5}`,
				'X-RateLimit-Remaining': rateLimitPointsRemaining,
				'X-RateLimit-Reset': `${new Date().getTime() + (type.global ? 0 : this.endpointData.find(e => e.name == endpoint)?.cooldown ?? 60000)}`,
			})
				.status(429)
				.json({ error: `You are being ratelimited ${type.global ? 'globally' : 'on this endpoint'}, Please try again later!` });
		} else {
			res
				.status(403)
				.json({ error:'You are not authorised to use this endpoint' });
		}
	}

	async _fetchEndpointData() {
		this.endpointData = await fetchEndpointData();
		return this.endpointData;
	}

	_sweep() {
		setInterval(() => {
			// Loop through each user
			for (const [userID, endpointData] of this.userRatelimit.entries()) {
				for (const { lastAccess, name } of endpointData.endpoints) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const newlastAccess = lastAccess.filter(i => i.getTime() >= (new Date().getTime() - this.endpointData.find(e => e.name == name)!.maxRequestper));
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.userRatelimit.get(userID)!.endpoints.find(e => e.name == name)!.lastAccess = newlastAccess;
				}
			}
			this.lastChecked = new Date().getTime();
		}, 1000);
	}
}
