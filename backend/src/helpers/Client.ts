import type CacheHandler from './CacheHandler';
import RateLimiter from '../middleware/RateLimiter';
import type { User } from '@prisma/client';


type CacheNames = 'Twitch' | 'Twitter' | 'R6'
export default class Client {
	CacheHandler: Map<CacheNames, CacheHandler>;
	RateLimiter: RateLimiter;
	Endpoints: string;
	users: Map<string, User>;
	constructor() {
		this.CacheHandler = new Map();
		this.RateLimiter = new RateLimiter();
		this.users = new Map();
		this.Endpoints = '';
	}
}
