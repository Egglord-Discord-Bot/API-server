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
  responseCode: number
  responseTime: number
}

export type EndpointParam = {
  name: string
  description: string
  required: boolean
  type: 'string' | 'number'
  // optional data
  enum?: Array<string>
  default: number | string
  minimum: number
  maximum: number
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
