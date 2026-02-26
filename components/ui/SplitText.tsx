"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: "chars" | "words" | "lines"
  from?: { opacity?: number; y?: number }
  to?: { opacity?: number; y?: number }
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
  onLetterAnimationComplete?: () => void
}

export default function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (document.fonts.status === "loaded") {
      setFontsLoaded(true)
    } else {
      document.fonts.ready.then(() => setFontsLoaded(true))
    }
  }, [])

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || completedRef.current) return

      const el = ref.current
      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px"
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: Element[]
      if (splitType === "chars") {
        targets = Array.from(el.querySelectorAll(".split-char"))
      } else if (splitType === "words") {
        targets = Array.from(el.querySelectorAll(".split-word"))
      } else {
        targets = Array.from(el.querySelectorAll(".split-line"))
      }

      if (targets.length === 0) return

      const tween = gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
          },
          onComplete: () => {
            completedRef.current = true
            onCompleteRef.current?.()
          },
        }
      )

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill()
        })
        tween.kill()
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: ref,
    }
  )

  const renderContent = () => {
    if (splitType === "chars") {
      return text.split("").map((char, i) => (
        <span key={i} className="split-char inline-block">
          {char === " " ? "\u00A0" : char}
        </span>
      ))
    }
    if (splitType === "words") {
      return text.split(/\s+/).map((word, i) => (
        <span key={i} className="split-word inline-block mr-[0.25em]">
          {word}
        </span>
      ))
    }
    return text.split("\n").map((line, i) => (
      <span key={i} className="split-line block">
        {line}
      </span>
    ))
  }

  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: "visible",
        display: "inline-block",
        whiteSpace: "normal",
      }}
    >
      {renderContent()}
    </p>
  )
}
