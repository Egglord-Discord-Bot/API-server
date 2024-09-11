import type CacheHandler from './handlers/CacheHandler';
import UserManager from '../database/User';
import UserHistoryManager from '../database/userHistory';
import SystemManager from './SystemManager';
import EndpointManager from './EndpointManager';
import ResponseCodeManager from '../database/responseCodes';
import NotificationManager from '../database/notifications';
import { Logger } from '../utils';

type CacheNames = 'Twitch' | 'Twitter' | 'R6' | 'Covid'

export default class Client {
	CacheHandler: Map<CacheNames, CacheHandler>;
	UserManager: UserManager;
	UserHistoryManager: UserHistoryManager;
	SystemHistoryManager: SystemManager;
	EndpointManager: EndpointManager;
	ResponseCodeManager: ResponseCodeManager;
	NotificationManager: NotificationManager;
	Logger: Logger;
	constructor() {
		this.CacheHandler = new Map();
		this.UserManager = new UserManager();
		this.UserHistoryManager = new UserHistoryManager();
		this.SystemHistoryManager = new SystemManager();
		this.EndpointManager = new EndpointManager();
		this.ResponseCodeManager = new ResponseCodeManager();
		this.NotificationManager = new NotificationManager();
		this.Logger = new Logger();
	}
}
