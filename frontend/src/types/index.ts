import type { GetServerSidePropsContext as GSSPC } from 'next';
export type GetServerSidePropsContext = GSSPC;

export type Endpoint = {
  name: string
  cooldown: number
  maxRequests: number
  maxRequestper: number
  isBlocked: boolean
  premiumOnly: boolean
  _count?: {
    history: number
  }
}

export type ResponseCode = {
  code: number
  _count: {
    history: number
  }
}

export type UserHistory = {
  id: number
  user: string
  userId: string
  endpointName: string
  createdAt: Date
  statusCode: number
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
