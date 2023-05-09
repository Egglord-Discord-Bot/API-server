const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['cdn.discordapp.com'],
	},
	rewrites: async () => {
		return [
			{
				source: '/api/:path((?!auth).*)',
				destination: 'http://localhost:4500/api/:path*',
			},
		];
	},
};

module.exports = nextConfig;
