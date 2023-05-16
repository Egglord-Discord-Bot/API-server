import type CacheHandler from './CacheHandler';
import UserManager from '../database/User';
import UserHistoryManager from '../database/userHistory';
import SystemHistoryManager from '../database/systemHistory';
import EndpointManager from '../database/endpointData';

type CacheNames = 'Twitch' | 'Twitter' | 'R6'

export default class Client {
	CacheHandler: Map<CacheNames, CacheHandler>;
	UserManager: UserManager;
	UserHistoryManager: UserHistoryManager;
	SystemHistoryManager: SystemHistoryManager;
	EndpointManager: EndpointManager;
	constructor() {
		this.CacheHandler = new Map();
		this.UserManager = new UserManager();
		this.UserHistoryManager = new UserHistoryManager();
		this.SystemHistoryManager = new SystemHistoryManager();
		this.EndpointManager = new EndpointManager();
	}
}
