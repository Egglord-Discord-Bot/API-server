export class DiscordAccount {
	constructor(data: DiscordAccount) {
		this.id = data.id;
		this.username = data.username;
		this.display_name = data.display_name;
		this.global_name = data.global_name;
		this.discriminator = data.discriminator;
		this.avatar = data.avatar == null
			? `https://cdn.discordapp.com/embed/avatars/${data.discriminator % 5}.png` : `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
		this.avatar_decoration = data.avatar_decoration;
		this.public_flags = data.public_flags;
		this.flags = data.flags;
		this.banner = data.banner;
		this.banner_color = data.banner_color;
		this.accent_color = data.accent_color;
	}
}

export interface DiscordAccount {
  id: string
  username: string
  avatar: string
  discriminator: number
  public_flags: number
  flags: number
  banner: string
  accent_color: null
  global_name: string
  avatar_decoration: null
  display_name:string
  banner_color: null
}
