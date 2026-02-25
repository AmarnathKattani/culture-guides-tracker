"use client"

import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface NeumorphismButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  /** Use "dark" when button is on a dark background (e.g. hero) */
  variant?: "light" | "dark"
}

export function NeumorphismButton({
  children,
  className,
  variant = "light",
  ...props
}: NeumorphismButtonProps) {
  const isDark = variant === "dark"

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
        !isDark && [
          "bg-slate-100 text-violet-600",
          "shadow-[-5px_-5px_10px_rgba(255,255,255,0.8),5px_5px_10px_rgba(0,0,0,0.25)]",
          "hover:shadow-[-1px_-1px_5px_rgba(255,255,255,0.6),1px_1px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(0,0,0,0.3)]",
          "hover:text-violet-700",
        ],
        isDark && [
          "bg-slate-700/90 text-violet-300",
          "shadow-[-5px_-5px_10px_rgba(255,255,255,0.08),5px_5px_10px_rgba(0,0,0,0.5)]",
          "hover:shadow-[-1px_-1px_5px_rgba(255,255,255,0.06),1px_1px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.5)]",
          "hover:text-violet-200",
        ],
        className
      )}
      {...props}
    >
      {children}
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  )
}
