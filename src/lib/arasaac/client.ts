import type { ArasaacPictogram, PictogramSearchResult } from "./types"
import { getArasaacImageUrl } from "./image-url"

const ARASAAC_API = "https://api.arasaac.org/v1/pictograms"
const cache = new Map<string, PictogramSearchResult | null>()

export async function searchPictogram(
  keyword: string,
  lang: string = "ca"
): Promise<PictogramSearchResult | null> {
  const cacheKey = `${lang}:${keyword.toLowerCase()}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null
  }

  try {
    const res = await fetch(
      `${ARASAAC_API}/${lang}/search/${encodeURIComponent(keyword)}`,
      { signal: AbortSignal.timeout(5000) }
    )

    if (!res.ok) {
      cache.set(cacheKey, null)
      return null
    }

    const data: ArasaacPictogram[] = await res.json()

    if (!data || data.length === 0) {
      cache.set(cacheKey, null)
      return null
    }

    const result: PictogramSearchResult = {
      keyword,
      arasaacId: data[0]._id,
      imageUrl: getArasaacImageUrl(data[0]._id),
    }

    cache.set(cacheKey, result)
    return result
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}

export async function searchPictograms(
  keywords: string[],
  lang: string = "ca"
): Promise<PictogramSearchResult[]> {
  const results = await Promise.all(
    keywords.map((kw) => searchPictogram(kw, lang))
  )
  return results.filter((r): r is PictogramSearchResult => r !== null)
}
