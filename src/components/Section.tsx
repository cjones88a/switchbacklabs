import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className="max-w-6xl mx-auto px-6">
        {children}
      </div>
    </section>
  )
}
