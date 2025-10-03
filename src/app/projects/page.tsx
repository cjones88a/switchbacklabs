import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Section } from "@/components/Section"
import { ProjectCard } from "@/components/ProjectCard"
import { MountainDivider } from "@/components/MountainDivider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Projects Intro */}
      <Section className="pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Projects
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A rotating set of experiments and client work. Some public, some behind the scenes.
          </p>
        </div>
      </Section>

      <MountainDivider />

      {/* Projects Grid */}
      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProjectCard
            title="4SOH Tracking"
            description="A lightweight operational tracker for Sales Order Holds ('4SOH') that surfaces status, blockers, and resolution SLAs in one clean view. Built for speed—designed to live where operators already work."
            ctaText="View details"
            ctaHref="#4soh-details"
          />
          <ProjectCard
            title="4SOH Race Tracker"
            description="Automated race tracking system that integrates with Strava segments. Participants' times are automatically recorded, aggregated, and displayed on real-time leaderboards with bonus scoring."
            ctaText="Try it now"
            ctaHref="/race-tracker"
          />
        </div>
      </Section>

      <MountainDivider />

      {/* 4SOH Details Section */}
      <Section id="4soh-details">
        <div className="max-w-4xl mx-auto">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl">4SOH Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Problem</h3>
                <p className="text-gray-700 leading-relaxed">
                  Operational teams lose time reconciling scattered data on holds, releases, and exceptions across tools.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Approach</h3>
                <p className="text-gray-700 leading-relaxed">
                  Single source of truth with simple statuses, event-based updates, and auto-calculated SLA timers.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>Fast entry: add/clear holds in seconds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>Status snapshots: daily digest + on-demand filters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>Integrations-ready: API hooks for CRM/ERP</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>SLA timers: see aging and breaches at a glance</span>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="ml-2 text-gray-900">Prototype / Internal Trial</span>
                </div>
                <a 
                  href="#" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Demo Link →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
