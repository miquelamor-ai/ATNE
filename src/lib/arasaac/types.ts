export interface ArasaacPictogram {
  _id: number
  keywords: {
    keyword: string
    hasLocution: boolean
  }[]
}

export interface PictogramSearchResult {
  keyword: string
  arasaacId: number
  imageUrl: string
}
