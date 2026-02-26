"use client"

import { useRef, useEffect } from "react"

interface MagnetLinesProps {
  rows?: number
  columns?: number
  containerSize?: string
  containerWidth?: string
  containerHeight?: string
  lineColor?: string
  lineWidth?: string
  lineHeight?: string
  baseAngle?: number
  className?: string
  style?: React.CSSProperties
}

export default function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = "80vmin",
  containerWidth,
  containerHeight,
  lineColor = "rgba(255,255,255,0.4)",
  lineWidth = "2px",
  lineHeight = "30px",
  baseAngle = -10,
  className = "",
  style = {},
}: MagnetLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLSpanElement>("span")

    const onPointerMove = (e: PointerEvent) => {
      const pointer = { x: e.clientX, y: e.clientY }
      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const centerX = rect.x + rect.width / 2
        const centerY = rect.y + rect.height / 2

        const b = pointer.x - centerX
        const a = pointer.y - centerY
        const c = Math.sqrt(a * a + b * b) || 1
        const r = ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1)

        item.style.setProperty("--rotate", `${r}deg`)
      })
    }

    window.addEventListener("pointermove", onPointerMove)

    if (items.length) {
      const middleIndex = Math.floor(items.length / 2)
      const rect = items[middleIndex].getBoundingClientRect()
      const centerX = rect.x + rect.width / 2
      const centerY = rect.y + rect.height / 2
      onPointerMove({ clientX: centerX, clientY: centerY } as PointerEvent)
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [rows, columns])

  const total = rows * columns

  return (
    <div
      ref={containerRef}
      className={`magnet-lines-container ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerWidth ?? containerSize,
        height: containerHeight ?? containerSize,
        justifyItems: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="magnet-line"
          style={
            {
              "--rotate": `${baseAngle}deg`,
              backgroundColor: lineColor,
              width: lineWidth,
              height: lineHeight,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
