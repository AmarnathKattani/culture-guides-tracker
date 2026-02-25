"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface DotExpandButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DotExpandButton({
  children,
  onClick,
  className = "",
}: DotExpandButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      type="button"
      className={`group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border-0 px-6 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background: grey default, black on hover */}
      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-600 transition-colors duration-300 group-hover:bg-slate-900 dark:group-hover:bg-slate-950" />

      {/* Dot that expands to circle with arrow */}
      <div className="relative z-10 flex shrink-0 items-center justify-center">
        <div className="flex h-2 w-2 items-center justify-center overflow-hidden rounded-full bg-slate-900 transition-all duration-300 group-hover:h-10 group-hover:w-10 group-hover:bg-white dark:bg-slate-950">
          <ArrowRight className="h-4 w-4 text-slate-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
      </div>

      {/* Text */}
      <span className="relative z-10 text-slate-900 transition-colors duration-300 group-hover:text-white dark:text-slate-100">
        {children}
      </span>
    </motion.button>
  )
}
