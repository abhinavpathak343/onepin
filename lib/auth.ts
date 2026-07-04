const DEMO_NEXTAUTH_URL = 'http://localhost:3000';
const DEMO_NEXTAUTH_SECRET = 'streakin-nextauth-secret';

process.env.NEXTAUTH_URL ??= DEMO_NEXTAUTH_URL;
process.env.NEXTAUTH_SECRET ??= DEMO_NEXTAUTH_SECRET;
process.env.AUTH_SECRET ??= process.env.NEXTAUTH_SECRET;

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findAdminByUsername } from './demo-store';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const admin = findAdminByUsername(credentials.username);

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: admin._id.toString(),
          name: admin.username,
          role: admin.role,
          academyId: admin.academyId?.toString() || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.academyId = user.academyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.academyId = token.academyId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
