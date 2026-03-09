import path from "path"
import { getGeminiClient } from "@/lib/gemini/client"

/**
 * Detects if extracted text is garbled (custom font encoding without ToUnicode maps).
 * Garbled text has high ratio of control characters (U+0000–U+001F) vs printable text.
 */
function isGarbledText(text: string): boolean {
  if (text.trim().length === 0) return true
  const printable = text.replace(/[\x00-\x1f\s]/g, "")
  if (printable.length === 0) return true
  const controlChars = (text.match(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g) || []).length
  return controlChars / printable.length > 0.3
}

/**
 * Try local extraction with pdfjs-dist first.
 * Falls back to Gemini OCR if text is garbled or empty.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Step 1: Try pdfjs-dist (fast, free, works for most digital PDFs)
  const localText = await extractWithPdfjs(buffer)

  if (localText && !isGarbledText(localText)) {
    return localText
  }

  // Step 2: Fallback to Gemini OCR (handles custom fonts, scanned PDFs, etc.)
  console.log("[pdf-extractor] pdfjs-dist text is garbled or empty, falling back to Gemini OCR")
  return extractWithGemini(buffer)
}

async function extractWithPdfjs(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const data = new Uint8Array(buffer)

  const cmapsDir = path.join(process.cwd(), "node_modules", "pdfjs-dist", "cmaps") + "/"
  const fontsDir = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + "/"
  const cMapUrl = "file:///" + cmapsDir.replace(/\\/g, "/")
  const standardFontDataUrl = "file:///" + fontsDir.replace(/\\/g, "/")

  const doc = await pdfjsLib.getDocument({
    data,
    cMapUrl,
    cMapPacked: true,
    standardFontDataUrl,
    useSystemFonts: true,
  }).promise

  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .filter((item: { str?: string }) => "str" in item)
      .map((item: { str: string }) => item.str)
      .join(" ")
    pages.push(pageText)
  }

  await doc.destroy()

  return pages.join("\n\n").trim()
}

async function extractWithGemini(buffer: Buffer): Promise<string> {
  const client = getGeminiClient()
  const base64 = buffer.toString("base64")

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64 } },
          {
            text: "Extreu tot el text d'aquest document PDF. Retorna NOMÉS el text pla, sense comentaris ni formatació markdown. Mantingues els paràgrafs separats amb línies en blanc. No afegeixis cap text teu, només el contingut del document.",
          },
        ],
      },
    ],
  })

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Gemini no ha pogut extreure text del PDF")
  }

  return text.trim()
}
