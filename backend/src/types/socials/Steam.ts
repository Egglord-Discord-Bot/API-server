export class SteamAccount {
	constructor(data: any) {
		this.id = data.id;
		this.url = data.url;
		this.realname = data.realname;
		this.avatar = data.avatar;
		this.createdAt = data.createdAt;
		this.bans = {
			CommunityBanned: data.CommunityBanned,
			VACBanned: data.VACBanned,
			NumberOfVACBans: data.NumberOfVACBans,
			DaysSinceLastBan: data.DaysSinceLastBan,
			NumberOfGameBans: data.NumberOfGameBans,
		};
		this.status = data.status;
		this.countryCode = data.countryCode;
	}
}

export interface SteamAccount {
  id: string
  url: string
  realname: string
  avatar: string
  createdAt: number
  bans: {
    CommunityBanned: boolean
    VACBanned: boolean
    NumberOfVACBans: number
    DaysSinceLastBan: number
    NumberOfGameBans: number
  },
  status: string
  countryCode: string
}

export interface SteamResolveVanityURLRawRequest {
  steamid: string,
  success: number
  message?: string
}

export interface SteamGetPlayerSummariesRawRequest {
  players: [
    {
    steamid: string
    communityvisibilitystate: number
    profilestate: number
    personaname: string
    commentpermission: number
    profileurl: string
    avatar: string
    avatarmedium: string
    avatarfull: string
    avatarhash: string
    lastlogoff: number
    personastate: number
    realname: string
    primaryclanid:string
    timecreated: number
    personastateflags: number
    loccountrycode: string
    }
  ]
}

export interface SteamGetPlayerBansRawRequest {
  players: [
    {
    SteamId: string
    CommunityBanned: boolean
    VACBanned: boolean
    NumberOfVACBans: number
    DaysSinceLastBan: number
    NumberOfGameBans: number
    EconomyBan:string
    }
  ]
}
