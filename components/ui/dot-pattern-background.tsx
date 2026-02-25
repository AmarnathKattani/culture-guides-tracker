"use client"

import { cn } from "@/lib/utils"
import { DotPattern } from "@/components/ui/dot-pattern"
import { GridPattern } from "@/components/ui/grid-pattern"

export function DotPatternBackground() {
  return (
    <>
      {/* Light mode: Dot pattern */}
      <div
        className={cn(
          "fixed inset-0 -z-10 bg-background text-neutral-400/60",
          "dark:hidden"
        )}
      >
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,white,transparent)]"
          )}
        />
      </div>

      {/* Dark mode: Grid pattern */}
      <div
        className={cn(
          "fixed inset-0 -z-10 bg-background hidden",
          "dark:block"
        )}
      >
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [6, 6],
            [10, 5],
            [13, 3],
          ]}
          fillColor="rgb(156 163 175 / 0.3)"
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
      </div>
    </>
  )
}
