export class DiscordAccount {
	constructor(data: DiscordAccount) {
		this.id = data.id;
		this.username = data.username;
		this.avatar = data.avatar;
		this.discriminator = data.discriminator;
		this.public_flags = data.public_flags;
		this.flags = data.flags;
		this.banner = data.banner;
		this.accent_color = data.accent_color;
		this.global_name = data.global_name;
		this.avatar_decoration = data.avatar_decoration;
		this.display_name = data.display_name;
		this.banner_color = data.banner_color;
	}
}

export interface DiscordAccount {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner: string
  accent_color: null
  global_name: string
  avatar_decoration: null
  display_name:string
  banner_color: null
}
