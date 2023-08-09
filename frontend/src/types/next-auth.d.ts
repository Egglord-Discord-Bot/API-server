export interface User {
  id: string
  username: string
  email: string
  avatar: string
  token: string
  createdAt: Date
  role: 'USER' | 'ADMIN' | 'BLOCK' | 'PREMIUM'
  locale: string
  _count?: {
    history: number
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    user: User
  }
}

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
