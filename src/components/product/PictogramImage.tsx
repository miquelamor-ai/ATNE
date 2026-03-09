"use client"

import { useState } from "react"

interface Props {
  keyword: string
  imageUrl: string
  size?: number
}

export function PictogramImage({ keyword, imageUrl, size = 60 }: Props) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <span className="inline-flex items-center justify-center bg-muted rounded text-xs text-muted-foreground"
        style={{ width: size, height: size }}
        title={keyword}
      >
        {keyword}
      </span>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={keyword}
      title={keyword}
      width={size}
      height={size}
      className="inline-block rounded"
      onError={() => setError(true)}
    />
  )
}
