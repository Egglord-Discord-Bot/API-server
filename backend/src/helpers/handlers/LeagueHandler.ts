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

	async getSummonerByUsername(region: validRegions, username: string) {
		const { data } = await axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}`, {
			headers: {
				'X-Riot-Token': `${this.token}`,
			},
		});
		return data as LOLSummoner;
	}

	async getActiveGameByUsername(region: validRegions, summonerId: string) {
		const { data } = await axios.get(`https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`, {
			headers: {
				'X-Riot-Token': `${process.env.riotToken}`,
			},
		});
		return data as LolActiveGame;
	}

	createAccount(summoner: LOLSummoner, activeGame?: LolActiveGame) {
		return new LolAccount(summoner, activeGame);
	}
}
