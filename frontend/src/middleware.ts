import { withAuth } from 'next-auth/middleware';
import type { User } from './types/next-auth';

export default withAuth({
	callbacks: {
		authorized({ req, token }) {
			// If not logged in redirect to login page
			if (token == null) return false;

			// `/admin` requires admin role
			if (req.nextUrl.pathname === '/admin') return (token.user as User).isAdmin;

			// User is accessing settings page and is logged in, allow access
			return true;
		},
	},
});

export const config = { matcher: ['/admin/:path*', '/settings'] };
