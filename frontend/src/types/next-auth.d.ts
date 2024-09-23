import { DatabaseUser } from '.';

interface User extends DatabaseUser {
  displayName: string
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User
  }
}

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
