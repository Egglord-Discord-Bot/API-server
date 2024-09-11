export interface User {
  id: string
  displayName: string
  email: string
  avatar: string
  token: string
  createdAt: Date
  role: 'USER' | 'ADMIN' | 'BLOCK' | 'PREMIUM'
  locale: string
  access_token: string
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
