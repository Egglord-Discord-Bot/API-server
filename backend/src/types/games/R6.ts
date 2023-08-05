export class R6Account {
	constructor(data: R6Account) {
		this.id = data.id;
		this.username = data.username;
		this.platform = data.platform;
		this.profileURL = data.profileURL;
		this.rank = {
			current: {
				name: data.rank.current.name,
				mmr: data.rank.current.mmr,
			},
			max: {
				name: data.rank.max.name,
				mmr: data.rank.max.mmr,
			},
		},
		this.pvp = data.pvp;
		this.pve = data.pve;
		this.level = data.level;
		this.xp = data.xp;
	}
}

export interface R6Account {
  id: string
  username: string
  platform: string
  profileURL: string
  rank: {
    current: {
      name: string
      mmr: number
    },
    max: {
      name: string
      mmr: number
    }
  },
  pvp: PVPData
  pve: PVEData
  level: number
  xp: number
}

interface PVPData {
  bulletsFired: number
  bulletsConnected: number
  kills: number
  deaths: number
  kd:number
  assists: number
  headshots: number
  meleeKills: number
  penetrationKills: number
  blindKills: number
  dbno: number
  dbnoAssists: number
  revives: number
  wins: number
  losses: number
  winRate: string
  matches: number
  playtime: number
  gadgetsDestroyed: number
  rappelBreaches: number
  barricadesDeployed: number
  reinforcementsDeployed:number
  suicides: number
  distanceTravelled: number
  xp: number
}

interface PVEData {
  bulletsFired: number
  bulletsConnected: number
  kills: number
  deaths: number
  kd: number
  assists: number
  headshots: number
  meleeKills: number
  penetrationKills: number
  blindKills: number
  revives: number
  wins: number
  losses: number
  winRate: string
  matches: number
  playtime: number
  gadgetsDestroyed: number,
  rappelBreaches: number
  barricadesDeployed: number
  reinforcementsDeployed: number
  suicides: number
  distanceTravelled: number
  xp: number
}
