import { withAuth } from 'next-auth/middleware';

const DEMO_NEXTAUTH_SECRET = 'streakin-nextauth-secret';

process.env.NEXTAUTH_SECRET ??= DEMO_NEXTAUTH_SECRET;
process.env.AUTH_SECRET ??= process.env.NEXTAUTH_SECRET;

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ token, req }) {
      const pathname = req.nextUrl.pathname;

      if (pathname.startsWith('/superadmin')) {
        return token?.role === 'superadmin';
      }

      if (pathname.startsWith('/admin')) {
        return token?.role === 'admin' || token?.role === 'superadmin';
      }

      return true;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*'],
};
