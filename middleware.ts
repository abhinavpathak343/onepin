import { withAuth } from 'next-auth/middleware';

export default withAuth({
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
