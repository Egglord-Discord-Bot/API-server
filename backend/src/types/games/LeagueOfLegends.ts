export class LolAccount {
	constructor(summoner: LOLSummoner, activeGame?: LolActiveGame) {
		this.id = summoner.id;
		this.name = summoner.name;
		this.profileIconId = summoner.profileIconId;
		this.level = summoner.summonerLevel;
		this.currentGame = activeGame == undefined ? null : {
			id: activeGame.gameId,
			type: activeGame.gameType,
			startTime: new Date(activeGame.gameStartTime),
			currentLength: activeGame.gameLength,
			bannedChampions: activeGame.bannedChampions,
			participants: activeGame.participants,
		};
	}
}

export interface LolAccount {
  id: string
  accountId: string
  name: string
  profileIconId: number
  level: number
  currentGame: null | {
    id: number
		type: string
		startTime: Date
		currentLength: number
		bannedChampions: Array<ActiveGameBannedChamp>
		participants: Array<ActiveGameParticipant>
  }
}

export type validRegions = 'BR1' | 'EUN1' | 'EUW1' | 'JP1' | 'KR' | 'LA1' | 'LA2' | 'NA1' | 'OC1' | 'PH2' | 'RU' | 'SG2' | 'TH2' | 'TR1' | 'TW2' | 'VN2'

export interface LOLSummoner {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface LOLErrorStatus {
  status: {
    message: string
    status_code: number
  }
}

interface ActiveGamePerks {
	perkIds: Array<number>
	perkStyle	: number
	perkSubStyle: number
}

interface ActiveGameCustomizationObject {
	category: string
	content: string
}

interface ActiveGameParticipant {
  teamId: number
  spell1Id: number
  spell2Id: number
  championId: number
  profileIconId: number
  summonerName: string
  bot: boolean
  summonerId: string
  gameCustomizationObjects: Array<ActiveGameCustomizationObject>
  perks: ActiveGamePerks
}

interface ActiveGameBannedChamp {
  championId: number
  teamId:number
  pickTurn: number
}

export interface LolActiveGame {
  gameId: number
  mapId: number
  gameMode: string
  gameType: string
  gameQueueConfigId: number
  participants: Array<ActiveGameParticipant>
  observers: {
    encryptionKey: string
  }
  platformId: string
  bannedChampions: Array<ActiveGameBannedChamp>
  gameStartTime: number
  gameLength: number
}
