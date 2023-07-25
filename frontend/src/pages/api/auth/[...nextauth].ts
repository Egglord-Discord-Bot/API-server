import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthOptions } from 'next-auth';
import type { User } from '@/types/next-auth';

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
			profile: async (profile) => {
				const resp = await fetch(`${process.env.BACKEND_URL}api/session/signIn?userId=${profile.id}`, {
					method: 'post',
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
					body: JSON.stringify(profile),
				});

				// Return update user
				const data = await resp.json() as User;
				return data;
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async session({ session, token }) {
			if (token.user) session.user = token.user;
			return session;
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
	debug: true,
} as AuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
	return NextAuth(req, res, AuthOption);
}
