export interface ImageRawRequest {
  height: number
  image: string
  image_token: string
  source: string
  thumbnail: string
  thumbnail_token: string
  title: string
  url: string
  width: number
}

export interface ImageObject {
  imageURL: string
  height: number
  width: number
}
