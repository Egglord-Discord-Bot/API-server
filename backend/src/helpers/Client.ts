import type CacheHandler from './handlers/CacheHandler';
import UserManager from '../database/User';
import UserHistoryManager from '../database/userHistory';
import SystemManager from './SystemManager';
import EndpointManager from '../database/endpointData';

type CacheNames = 'Twitch' | 'Twitter' | 'R6'

export default class Client {
	CacheHandler: Map<CacheNames, CacheHandler>;
	UserManager: UserManager;
	UserHistoryManager: UserHistoryManager;
	SystemHistoryManager: SystemManager;
	EndpointManager: EndpointManager;
	constructor() {
		this.CacheHandler = new Map();
		this.UserManager = new UserManager();
		this.UserHistoryManager = new UserHistoryManager();
		this.SystemHistoryManager = new SystemManager();
		this.EndpointManager = new EndpointManager();
	}
}
