import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthOptions } from 'next-auth';
import type { User } from '@/types/next-auth';
import axios from 'axios';

export const AuthOption = {
	providers: [
		DiscordProvider({
			clientId: process.env.discordId as string,
			clientSecret: process.env.discordSecret as string,
			token: 'https://discord.com/api/oauth2/token',
			userinfo: 'https://discord.com/api/users/@me',
			authorization: {
				params: {
					scope: 'identify email',
				},
			},
			profile: async (profile, tokens) => {
				console.log(profile, tokens);
				const { data } = await axios.post(`${process.env.BACKEND_URL}api/session/signIn?userId=${profile.id}`, {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
				});

				// Return update user
				return data as User;
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async session({ session, token }) {
			if (token.user) {
				try {
					const { data } = await axios.get(`${process.env.BACKEND_URL}api/session?access_token=${token.user.access_token}&id=${token.user.id}`);
					if (data.error) return undefined;
					session.user = data;
					return session;
				} catch {
					return undefined;
				}
			}
		},
		async jwt({ token, user }) {
			if (user) token.user = user as User;
			return token;
		},
		// TODO: FIX THIS SO IT ACTUALLY REDIRECTS THE USERS
		async redirect({ url, baseUrl }) {
			// Allows relative callback URLs
	    if (url.startsWith('/')) return `${baseUrl}${url}`;
	    // Allows callback URLs on the same origin
	    else if (new URL(url).origin === baseUrl) return url;
	    return baseUrl;
		},
	},
	pages: {
		signIn: '/signIn',
	},
	// Enable debug messages in the console if you are having problems
	debug: false,
} as AuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
	return NextAuth(req, res, AuthOption);
}
