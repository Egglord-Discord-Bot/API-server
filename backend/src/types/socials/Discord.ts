export class DiscordAccount {
	constructor(data: DiscordAccount) {
		this.id = data.id;
		this.username = data.username;
		this.display_name = data.display_name;
		this.global_name = data.global_name;
		this.discriminator = data.discriminator;
		// Format avatar URL
		this.avatar = this.formatAvatarURL(data.avatar);
		this.avatar_decoration = data.avatar_decoration;
		this.public_flags = data.public_flags;
		this.flags = data.flags;
		this.banner = data.banner;
		this.banner_color = data.banner_color;
		this.accent_color = data.accent_color;
	}

	/**
	 * Format the avatar to be the full URL
	 * @param {string | null} avatar The hash of their avatar if they have one
	*/
	formatAvatarURL(avatar: string | null) {
		let imageURL = '';
		if (avatar == null) {
			// Check if they are still on legacy discriminator system
			if (this.discriminator && this.discriminator != 0) {
				imageURL = `https://cdn.discordapp.com/embed/avatars/${this.discriminator % 5}.png`;
			} else {
				imageURL = `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(this.id) >> BigInt(22)) % 6}.png`;
			}
		} else {
			imageURL = `https://cdn.discordapp.com/avatars/${this.id}/${avatar}.png`;
		}

		return imageURL;
	}
}

export interface DiscordAccount {
  id: number
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
