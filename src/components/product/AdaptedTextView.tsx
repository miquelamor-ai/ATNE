"use client"

import { PictogramImage } from "./PictogramImage"
import type { PictogramEntry } from "@/types"

interface Props {
  text: string
  pictograms: PictogramEntry[]
}

export function AdaptedTextView({ text, pictograms }: Props) {
  const paragraphs = text.split("\n\n").filter(Boolean)

  return (
    <div className="space-y-6">
      {paragraphs.map((para, i) => {
        const paraPictos = pictograms.filter((p) => p.sentenceIndex === i)

        return (
          <div key={i} className="flex gap-4 items-start">
            {/* Pictogrames a l'esquerra */}
            {paraPictos.length > 0 && (
              <div className="flex flex-col gap-1 shrink-0">
                {paraPictos.map((p) => (
                  <PictogramImage
                    key={`${p.arasaacId}-${p.keyword}`}
                    keyword={p.keyword}
                    imageUrl={p.imageUrl}
                    size={50}
                  />
                ))}
              </div>
            )}
            {/* Text a la dreta */}
            <p className="text-base leading-relaxed flex-1">{para}</p>
          </div>
        )
      })}
    </div>
  )
}
