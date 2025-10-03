import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Section } from "@/components/Section"
import { ContactForm } from "@/components/ContactForm"
import { MountainDivider } from "@/components/MountainDivider"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <Section className="pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Build. Ship. Iterate.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Switchback Labs is a product & growth studio in Fort Collins. We design, launch, and optimize software that moves real-world businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/projects">See Projects</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="#contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </Section>

      <MountainDivider />

      {/* About Section */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            We help teams in agriculture, beauty-franchise, and Bitcoin-native industries turn ideas into shipped product. Our playbook blends product strategy, UX, and data rigor so you get momentum—fast.
          </p>
        </div>
      </Section>

      {/* Services Section */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Services
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Product Strategy</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Vision, roadmaps, OKRs, PM systems—turn ambiguous goals into buildable plans.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Growth & CRM</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                HubSpot, SalesMsg, funnels, attribution, lifecycle automation, reporting.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Data & Apps</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Next.js apps, APIs, integrations, dashboards, and iterative prototypes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <MountainDivider />

      {/* Contact Section */}
      <Section id="contact">
        <ContactForm />
      </Section>

      <Footer />
    </div>
  )
}