export type Endpoint = {
  name: number
  cooldown: number
  maxRequests: number
  maxRequestper: number
  isBlocked: boolean
}

export type UserHistory = {
  id: string
  user: string
  userId: string
  endpoint: string
  createdAt: Date
}
