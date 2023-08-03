import type { Request, Response, NextFunction } from 'express';
import type Client from '../helpers/Client';
import type { time } from '../types';
import { Utils, Error } from '../utils';
import type { User, Endpoint } from '@prisma/client';
import onFinished from 'on-finished';
import { createHash } from 'crypto';

type endpointUsage = {
  name: string
  lastAccess: Array<Date>
}

type sendResponseParam = {
  req: Request & time
  res: Response & time
  userId: null | bigint
  endpoint: string
  response: ((res: Response<any, Record<string, any>>, endpoint: string) => Response<any, Record<string, any>>) | null
}

interface endpointData {
  endpoints: endpointUsage[]
}

export default class RateLimit {
	userRatelimit: Map<bigint, endpointData>;
	lastChecked: number;
	endpointData: Array<Endpoint>;
	client: Client;
	constructor(client: Client) {
		this.endpointData = client.EndpointManager.cache;
		this.userRatelimit = new Map();
		this.lastChecked = new Date().getTime();
		this.client = client;
		this._sweep();
	}

	async checkRateLimit(req: Request & time, res: Response & time, next: NextFunction) {
		// Get the user from the request
		const user = await this._extractUser(req);
		if (user === null) {
			// See if the request is coming from the frontend via browser
			const cookies = req.headers.cookie?.split(';');
			const csrfCookie = cookies?.map(c => c.trim()).find(c => c.startsWith('__Host-next-auth.csrf-token') || c.startsWith('next-auth.csrf-token'));
			if (csrfCookie) {
				const csrfToken = csrfCookie?.split('=')[1] as string;
				const tokenHashDelimiter = csrfToken.indexOf('|') !== -1 ? '|' : '%7C';

				// Validate hashes
				const [requestToken, requestHash] = csrfToken.split(tokenHashDelimiter);
				const validHash = createHash('sha256').update(`${requestToken}${process.env.sessionSecret}`).digest('hex');

				// if hashes are not correct then check through usual system (auth header, token etc)
				if (requestHash !== validHash) return this.sendResponse({ req, res, userId: null, endpoint: req.originalUrl.split('?')[0], response: Error.Unauthorized });

				// Success show them the data
				this.sendResponse({ req, res, userId: null, endpoint: req.originalUrl.split('?')[0], response: null });
				return next();
			} else {
				return this.sendResponse({ req, res, userId: null, endpoint: req.originalUrl.split('?')[0], response: Error.Unauthorized });
			}
		}

		// Check that the endpoint is valid
		const endpoint = this.endpointData.find(i => i.name == req.originalUrl.split('?')[0]);
		if (endpoint == undefined) return this.sendResponse({ req, res, userId: user.id, endpoint: req.originalUrl.split('?')[0], response: Error.MissingEndpoint });

		// Check if endpoint is blocked
		if (endpoint.isBlocked) return this.sendResponse({ req, res, userId: user.id, endpoint: endpoint.name, response: Error.DisabledEndpoint });

		// Check if endpoint is premium only or not
		if (endpoint.premiumOnly && !user.isPremium) return this.sendResponse({ req, res, userId: user.id, endpoint: endpoint.name, response: Error.Unauthorized });

		// Bypass ratelimit if user is an Admin
		if (!user.isAdmin) {
			// Now check if user is rate limited by global rate Limit
			const isGloballyRateLimited = this._checkGlobalCooldown(user.id);
			if (isGloballyRateLimited) return this.sendResponse({ req, res, userId: user.id, endpoint: endpoint.name, response: Error.GlobalRateLimit });

			// Now check if user is rate limited by endpoint
			const isRateLimitedByEndpoint = await this.checkEndpointUsage(user.id, endpoint.name);
			if (isRateLimitedByEndpoint) return this.sendResponse({ req, res, userId: user.id, endpoint: endpoint.name, response: Error.RateLimited });
		} else {
			// Success
			this.addEndpoint(user.id, endpoint.name);
		}

		// User is logged in and not ratelimited at all
		this.sendResponse({ req, res, userId: user.id, endpoint: endpoint.name, response: null });
		next();
	}

	private sendResponse({ req, res, userId, endpoint, response }: sendResponseParam) {
		onFinished(req, () => {
			req._endTime = new Date().getTime();
			onFinished(res, async () => {
				res._endTime = new Date().getTime();

				// Get additional information
				const status = res.statusCode;

				// How long did it take for the page to load
				let response_time = 0;
				if (res._endTime && req._endTime) response_time = (res._endTime + req._endTime) - (res._startTime + req._startTime);


				// Save to users' history
				await this.client.UserHistoryManager.create({ id: userId == null ? null : BigInt(userId), endpoint, responseCode: status, responseTime: response_time });
			});
		});
		if (response != null) response(res, endpoint);
	}


	/**
    * Extract the user from the request (if any)
    * @param {Request} req The request
    * @returns The user who made the request
  */
	private async _extractUser(req: Request) {
		// If they are on browser see if they are logged in
		const possibleUser = await Utils.getSession(req);
		if (possibleUser != null) return possibleUser.user as User;

		// They might be trying to connect via their token
		if (req.headers.authorization || req.query.token) return await this.client.UserManager.fetchByParam({ token: (req.headers.authorization || req.query.token) as string });

		// They are not logged in at all
		return null;
	}

	/**
  	* Check if the user is globally ratelimited
  	* @param {string} userID The ID of the user getting checked
  	* @returns Whether or not they are globally ratelimited
  */
	private _checkGlobalCooldown(userID: bigint) {
		if (this.userRatelimit.get(userID)) {
			const data = this.userRatelimit.get(userID)?.endpoints.reduce((a, b) => b.lastAccess.length + a, 0) ?? 0;
			return (data >= 100);
		} else {
			return false;
		}
	}

	/**
    * Check if the user is ratelimited on the endpoint
    * @param {bigint} userID The ID of the user getting checked
    * @param {string} endpoint The endpoint name
    * @returns Whether or not they are ratelimited on the endpoint
  */
	async checkEndpointUsage(userID: bigint, endpoint: string) {
		let isRateLimted = false;
		if (this.userRatelimit.get(userID)) {
			// User has been cached
			const end = this.userRatelimit.get(userID)?.endpoints.find(e => e.name == endpoint);
			if (end != undefined) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				if (end.lastAccess.length >= this.endpointData.find(e => e.name == endpoint)!.maxRequests) return true;

				isRateLimted = (end.lastAccess.sort((a, b) => b.getTime() - a.getTime())[0]?.getTime() ?? 0) >= new Date().getTime() - (this.endpointData.find(e => e.name == endpoint)?.cooldown ?? 2000);
			}
		}

		// Only save to user's history if not ratelimited
		if (!isRateLimted) await this.addEndpoint(userID, endpoint);
		return isRateLimted;
	}

	/**
    * Adds endpoint to user's history
    * @param {bigint} userId The ID of the user getting checked
    * @param {string} endpoint The endpoint name
  */
	async addEndpoint(userId: bigint, endpoint: string) {
		const user = this.userRatelimit.get(userId);
		if (user != undefined) {
			if (user.endpoints.find(e => e.name == endpoint)) {
				user.endpoints.find(e => e.name == endpoint)?.lastAccess.push(new Date());
			} else {
				user.endpoints.push({ name: endpoint, lastAccess: [new Date()] });
			}
		} else {
			this.userRatelimit.set(userId, { endpoints: [{ name: endpoint, lastAccess: [new Date()] }] });
		}
	}

	private _sweep() {
		setInterval(() => {
			// Loop through each user
			for (const [userID, endpointData] of this.userRatelimit.entries()) {
				for (const { lastAccess, name } of endpointData.endpoints) {
					const newlastAccess = lastAccess.filter(i => i.getTime() >= new Date().getTime() - (this.endpointData.find(e => e.name == name)?.maxRequestper ?? 60000));
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					this.userRatelimit.get(userID)!.endpoints.find(e => e.name == name)!.lastAccess = newlastAccess;
				}
			}
			this.lastChecked = new Date().getTime();
		}, 1000);
	}
}
