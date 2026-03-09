export function getArasaacImageUrl(id: number, size: number = 300): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_${size}.png`
}
