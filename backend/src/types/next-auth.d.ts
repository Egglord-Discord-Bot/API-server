import type { User } from '@prisma/client';

declare module 'next-auth/jwt' {
  interface JWT {
    /** expire time */
    exp: number
    user: User
  }
}
