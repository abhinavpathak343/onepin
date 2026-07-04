import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: string;
      academyId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    academyId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    academyId: string | null;
  }
}
