export type Endpoint = {
  name: string
  cooldown: number
  maxRequests: number
  maxRequestper: number
  isBlocked: boolean
}

export type UserHistory = {
  id: number
  user: string
  userId: string
  endpoint: string
  createdAt: Date
}

type EndpointParam = {
  name: string
  description: string
  required: boolean
  type: string
}

export type EndpointData = {
  endpoint: string
  description: string
  method: string
  parameters: Array<EndpointParam>
}

export interface EndpointExtra extends Endpoint {
  data?: EndpointData
}
