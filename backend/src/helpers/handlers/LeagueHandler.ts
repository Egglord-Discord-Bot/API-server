import CacheHandler from './CacheHandler';
import axios from 'axios';
import type { LOLSummoner, LolActiveGame, validRegions } from '../../types/games/LeagueOfLegends';
import { LolAccount } from '../../types/games/LeagueOfLegends';

interface LeagueHandlerProps {
  token: string
}

export default class LeagueHandler extends CacheHandler {
	public token: string;
	constructor({ token }: LeagueHandlerProps) {
		super();
		this.token = token;
	}

	/**
    * Function for summoner by region and username
    * @param {validRegions} region The region the summoner is from
    * @param {string} username The username of summoner
  */
	async getSummonerByUsername(region: validRegions, username: string) {
		const { data } = await axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`, {
			headers: {
				'X-Riot-Token': `${this.token}`,
			},
		});
		return data as LOLSummoner;
	}

	/**
    * Function for getting the current game the summoner is in, if they are playing one
    * @param {validRegions} region The region the summoner is from
    * @param {string} summonerId The ID of the summoner
  */
	async getActiveGameByUsername(region: validRegions, summonerId: string) {
		const { data } = await axios.get(`https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`, {
			headers: {
				'X-Riot-Token': `${process.env.riotToken}`,
			},
		});
		return data as LolActiveGame;
	}

	/**
    * Create a clean object based on information given
    * @param {LOLSummoner} summoner The information of a summoner
    * @param {?LolActiveGame} activeGame The information of the current game if there is one
  */
	createAccount(summoner: LOLSummoner, activeGame?: LolActiveGame) {
		return new LolAccount(summoner, activeGame);
	}
}
