import { extractPdfText } from "./pdf-extractor"
import { extractDocxText } from "./docx-extractor"

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      return extractPdfText(buffer)
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractDocxText(buffer)
    case "text/plain":
      return buffer.toString("utf-8").trim()
    default:
      throw new Error(`Format no suportat: ${mimeType}`)
  }
}

export function isSupported(mimeType: string): boolean {
  return [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ].includes(mimeType)
}
