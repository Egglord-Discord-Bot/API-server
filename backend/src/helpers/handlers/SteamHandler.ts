import CacheHandler from './CacheHandler';
import axios from 'axios';
import type { SteamResolveVanityURLRawRequest, SteamGetPlayerSummariesRawRequest, SteamGetPlayerBansRawRequest } from '../../types/socials/Steam';
import { SteamAccount } from '../../types/socials/Steam';

interface SteamHandlerProps {
  token: string
}

export default class SteamHandler extends CacheHandler {
	public token: string;
	constructor({ token }: SteamHandlerProps) {
		super();
		this.token = token;
	}

	/**
    * Function for getting the steam ID of the steam account
    * @param {string} username The username of the steam account
  */
	async getUserByUsername(username: string) {
		const { data } = await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.token}&vanityurl=${username}`);
		return data.response as SteamResolveVanityURLRawRequest;
	}

	/**
    * Function for getting some basic information of a steam account
    * @param {string} steamId The Id of the steam account
  */
	async getUserSummariesById(steamId: string) {
		const { data } = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.token}&steamids=${steamId}`);
		return data.response as SteamGetPlayerSummariesRawRequest;
	}

	/**
    * Function for getting a users ban status for steam services
    * @param {string} steamId The Id of the steam account
  */
	async getUserBansById(steamId: string) {
		const { data } = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.token}&steamids=${steamId}`);
		return data as SteamGetPlayerBansRawRequest;
	}

	/**
    * Create a clean object based on information given
    * @param {SteamGetPlayerSummariesRawRequest} playerSum The basic information of a steam account
    * @param {SteamGetPlayerBansRawRequest} playerbans The users ban status data
  */
	createAccount(playerSum: SteamGetPlayerSummariesRawRequest, playerbans: SteamGetPlayerBansRawRequest) {
		return new SteamAccount({
			id: playerSum.players[0].steamid,
			url: playerSum.players[0].profileurl,
			realname: playerSum.players[0].realname,
			avatar: playerSum.players[0].avatarfull,
			createdAt: playerSum.players[0].timecreated,
			bans: {
				CommunityBanned: playerbans.players[0].CommunityBanned,
				VACBanned: playerbans.players[0].VACBanned,
				NumberOfVACBans: playerbans.players[0].NumberOfVACBans,
				DaysSinceLastBan: playerbans.players[0].DaysSinceLastBan,
				NumberOfGameBans: playerbans.players[0].NumberOfGameBans,
			},
			status: ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'][playerSum.players[0].personastate],
			countryCode: playerSum.players[0].loccountrycode,
		});
	}
}
