import { withAuth } from 'next-auth/middleware';

export default withAuth({
	callbacks: {
		authorized({ req, token }) {
			// If not logged in redirect to login page
			if (token == null) return false;

			// `/admin` requires admin role
			if (req.nextUrl.pathname === '/admin') return token.user.isAdmin;

			// User is accessing settings page and is logged in, allow access
			return true;
		},
	},
});

export const config = { matcher: ['/admin/:path*', '/settings'] };
