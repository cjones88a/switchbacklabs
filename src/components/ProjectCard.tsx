import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  title: string
  description: string
  ctaText?: string
  ctaHref?: string
  onClick?: () => void
}

export function ProjectCard({ 
  title, 
  description, 
  ctaText = "View details", 
  ctaHref,
  onClick 
}: ProjectCardProps) {
  return (
    <Card className="h-full border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ctaHref ? (
          <Button asChild variant="outline" className="w-full">
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onClick}
          >
            {ctaText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
