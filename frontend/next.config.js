const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
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
	async headers() {
		return [
			{
				source: '/((?!api).*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key:'Referrer-Policy',
						value: 'origin',
					},
				],
			},
		];
	},
};

module.exports = nextConfig;
