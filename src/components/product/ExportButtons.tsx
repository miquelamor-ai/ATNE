"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { AdaptationResult, PictogramEntry } from "@/types"
import { generateTxt } from "@/lib/export"

interface Props {
  result: AdaptationResult
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function groupPictogramsByParagraph(
  pictograms: PictogramEntry[],
  paragraphCount: number
): Map<number, PictogramEntry[]> {
  const map = new Map<number, PictogramEntry[]>()
  for (let i = 0; i < paragraphCount; i++) {
    map.set(i, [])
  }
  for (const p of pictograms) {
    const existing = map.get(p.sentenceIndex) || []
    // Avoid duplicate pictograms per paragraph
    if (!existing.find((e) => e.arasaacId === p.arasaacId)) {
      existing.push(p)
      map.set(p.sentenceIndex, existing)
    }
  }
  return map
}

export function ExportButtons({ result }: Props) {
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExportTxt = () => {
    const txt = generateTxt(result)
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    downloadBlob(blob, "adaptacio.txt")
    toast.success("Fitxer TXT descarregat")
  }

  const handleExportPdf = async () => {
    setExporting("pdf")
    try {
      const { jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF()
      const paragraphs = result.textAdaptat.split("\n\n").filter(Boolean)
      const pictosByPara = groupPictogramsByParagraph(
        result.pictograms,
        paragraphs.length
      )

      // Pre-fetch pictogram images
      const imageCache = new Map<number, string>()
      const uniqueIds = [...new Set(result.pictograms.map((p) => p.arasaacId))]
      await Promise.all(
        uniqueIds.map(async (id) => {
          const picto = result.pictograms.find((p) => p.arasaacId === id)
          if (picto) {
            const base64 = await fetchImageAsBase64(picto.imageUrl)
            if (base64) imageCache.set(id, base64)
          }
        })
      )

      // Títol
      doc.setFontSize(16)
      doc.text("Adaptació - AAU", 14, 20)

      let y = 35

      // Paràgrafs amb pictogrames
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i]
        const pictos = pictosByPara.get(i) || []

        // Check if we need a new page
        if (y > 250) {
          doc.addPage()
          y = 20
        }

        const pictoWidth = pictos.length > 0 ? 20 : 0
        const textX = 14 + pictoWidth
        const textWidth = 180 - pictoWidth

        // Draw pictograms
        let pictoY = y
        for (const p of pictos.slice(0, 3)) {
          const img = imageCache.get(p.arasaacId)
          if (img) {
            try {
              doc.addImage(img, "PNG", 14, pictoY - 3, 15, 15)
              pictoY += 16
            } catch {
              // Skip if image fails
            }
          }
        }

        // Draw text
        doc.setFontSize(10)
        const splitText = doc.splitTextToSize(para, textWidth)
        doc.text(splitText, textX, y)

        const textHeight = splitText.length * 5
        const pictoHeight = pictos.slice(0, 3).length * 16
        y += Math.max(textHeight, pictoHeight) + 6
      }

      // Glossari
      if (result.glossari.length > 0) {
        if (y > 240) {
          doc.addPage()
          y = 20
        }
        y += 5
        doc.setFontSize(12)
        doc.text("Glossari", 14, y)
        y += 5

        autoTable(doc, {
          startY: y,
          head: [["Terme", "Definició"]],
          body: result.glossari.map((g) => [g.terme, g.definicio]),
          styles: { fontSize: 9 },
        })
      }

      // Taula comparativa
      if (result.taulaComparativa && result.taulaComparativa.length > 0) {
        const hasOriginal = result.taulaComparativa.some(
          (r) => r.original && r.original.length > 0
        )
        if (hasOriginal) {
          doc.addPage()
          doc.setFontSize(12)
          doc.text("Taula Comparativa", 14, 20)

          autoTable(doc, {
            startY: 25,
            head: [["#", "Original", "Adaptat"]],
            body: result.taulaComparativa.map((r) => [
              String(r.paragrafIndex + 1),
              r.original,
              r.adaptat,
            ]),
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 85 },
              2: { cellWidth: 85 },
            },
          })
        }
      }

      doc.save("adaptacio.pdf")
      toast.success("Fitxer PDF descarregat")
    } catch (err) {
      console.error(err)
      toast.error("Error en generar el PDF")
    } finally {
      setExporting(null)
    }
  }

  const handleExportDocx = async () => {
    setExporting("docx")
    try {
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        ImageRun,
        Table,
        TableRow,
        TableCell,
        WidthType,
        BorderStyle,
      } = await import("docx")
      const { saveAs } = await import("file-saver")

      const children: InstanceType<typeof Paragraph>[] = []
      const paragraphs = result.textAdaptat.split("\n\n").filter(Boolean)
      const pictosByPara = groupPictogramsByParagraph(
        result.pictograms,
        paragraphs.length
      )

      // Pre-fetch pictogram images as ArrayBuffer
      const imageBufferCache = new Map<number, ArrayBuffer>()
      const uniqueIds = [...new Set(result.pictograms.map((p) => p.arasaacId))]
      await Promise.all(
        uniqueIds.map(async (id) => {
          const picto = result.pictograms.find((p) => p.arasaacId === id)
          if (picto) {
            try {
              const res = await fetch(picto.imageUrl)
              if (res.ok) {
                const buf = await res.arrayBuffer()
                imageBufferCache.set(id, buf)
              }
            } catch {
              // Skip
            }
          }
        })
      )

      // Títol
      children.push(
        new Paragraph({
          text: "Adaptació - AAU",
          heading: HeadingLevel.HEADING_1,
        })
      )

      // Paràgrafs amb pictogrames
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i]
        const pictos = pictosByPara.get(i) || []

        // Add pictograms as inline images before the text
        const runs: InstanceType<typeof TextRun | typeof ImageRun>[] = []

        for (const p of pictos.slice(0, 3)) {
          const buf = imageBufferCache.get(p.arasaacId)
          if (buf) {
            runs.push(
              new ImageRun({
                data: buf,
                transformation: { width: 40, height: 40 },
                type: "png",
              })
            )
            runs.push(new TextRun({ text: " " }))
          }
        }

        if (runs.length > 0) {
          children.push(
            new Paragraph({
              children: runs,
              spacing: { after: 50 },
            })
          )
        }

        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: 24 })],
            spacing: { after: 200 },
          })
        )
      }

      // Glossari
      if (result.glossari.length > 0) {
        children.push(
          new Paragraph({
            text: "Glossari",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          })
        )
        for (const entry of result.glossari) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: entry.terme, bold: true, size: 22 }),
                new TextRun({ text: `: ${entry.definicio}`, size: 22 }),
              ],
            })
          )
        }
      }

      // Taula comparativa (només si hi ha text original)
      if (result.taulaComparativa && result.taulaComparativa.length > 0) {
        const hasOriginal = result.taulaComparativa.some(
          (r) => r.original && r.original.length > 0
        )
        if (hasOriginal) {
          children.push(
            new Paragraph({
              text: "Taula Comparativa",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400 },
            })
          )

          const noBorder = {
            style: BorderStyle.NONE,
            size: 0,
            color: "FFFFFF",
          }
          const border = {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "CCCCCC",
          }

          const headerRow = new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "#", bold: true, size: 20 }),
                    ],
                  }),
                ],
                width: { size: 5, type: WidthType.PERCENTAGE },
                borders: {
                  top: border,
                  bottom: border,
                  left: border,
                  right: border,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Original",
                        bold: true,
                        size: 20,
                      }),
                    ],
                  }),
                ],
                width: { size: 47, type: WidthType.PERCENTAGE },
                borders: {
                  top: border,
                  bottom: border,
                  left: border,
                  right: border,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Adaptat",
                        bold: true,
                        size: 20,
                      }),
                    ],
                  }),
                ],
                width: { size: 47, type: WidthType.PERCENTAGE },
                borders: {
                  top: border,
                  bottom: border,
                  left: border,
                  right: border,
                },
              }),
            ],
          })

          const dataRows = result.taulaComparativa.map(
            (row) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: String(row.paragrafIndex + 1),
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                    borders: {
                      top: border,
                      bottom: border,
                      left: border,
                      right: border,
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: row.original, size: 18 }),
                        ],
                      }),
                    ],
                    borders: {
                      top: border,
                      bottom: border,
                      left: border,
                      right: border,
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: row.adaptat, size: 18 }),
                        ],
                      }),
                    ],
                    borders: {
                      top: border,
                      bottom: border,
                      left: border,
                      right: border,
                    },
                  }),
                ],
              })
          )

          children.push(
            new Paragraph({}) // Spacer
          )

          // Table needs to be in a separate section or we use a workaround
          // docx library Table is not a Paragraph, so we need sections
        }
      }

      // Traducció
      if (result.traduccioText) {
        children.push(
          new Paragraph({
            text: "Traducció",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400 },
          })
        )
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: result.traduccioText, size: 24 }),
            ],
          })
        )
      }

      const doc = new Document({
        sections: [{ children }],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, "adaptacio.docx")
      toast.success("Fitxer DOCX descarregat")
    } catch (err) {
      console.error(err)
      toast.error("Error en generar el DOCX")
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={handleExportTxt}>
        Descarregar TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPdf}
        disabled={exporting === "pdf"}
      >
        {exporting === "pdf" ? "Generant..." : "Descarregar PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportDocx}
        disabled={exporting === "docx"}
      >
        {exporting === "docx" ? "Generant..." : "Descarregar DOCX"}
      </Button>
    </div>
  )
}
