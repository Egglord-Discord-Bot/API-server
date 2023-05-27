const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['cdn.discordapp.com'],
	},
	rewrites: async () => {
		return [
			{
				source: '/api/:path((?!auth).*)',
				destination: `${process.env.BACKEND_URL}api/:path*`,
			},
		];
	},
};

module.exports = nextConfig;
