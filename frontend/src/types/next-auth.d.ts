export interface User {
  id: string
  discriminator: string
  username: string
  email: string
  avatar: string
  isAdmin: boolean
  isBlocked: boolean
  isPremium: boolean
}

declare module 'next-auth' {
  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    user: User
  }
}
