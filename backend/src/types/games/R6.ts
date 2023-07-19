export class R6Account {
	constructor(data: R6Account) {
		this.id = data.id;
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
