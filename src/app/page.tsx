import Link from 'next/link'
import SwitchbackMark from '@/components/brand/SwitchbackMark'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <SwitchbackMark className="h-8 w-8" />
              <span className="text-xl font-semibold tracking-tight">Switchback Labs</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 xl:gap-8">
              <Link href="/pm-of-the-future" className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                PM of the future
              </Link>
              <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Work
              </Link>
              <Link href="/how-i-work" className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap">
                How I work
              </Link>
              <Link 
                href="#contact" 
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                Say hi
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-6">
              Product Strategy & Technical PM
            </p>
            <h1 className="text-5xl md:text-7xl font-serif font-light leading-tight mb-8">
              Less Talk.
              <br />
              More Shipped.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl">
              A portfolio of product work, and of learning to ship it with AI.
              Training Coach is the live app. The case studies are the write-ups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                View my work
              </Link>
              <Link 
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-900 rounded-md hover:border-gray-400 transition-colors"
              >
                Let&apos;s talk
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-gray-900 text-white px-8 py-12 md:px-12 md:py-16">
            <p className="text-sm uppercase tracking-wider text-white/50 mb-4">The PM of the Future</p>
            <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight max-w-3xl">
              I prototype. I move fast. I empathize.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">
              Customer need hasn&apos;t changed. The way I get there has.
            </p>
            <Link
              href="/pm-of-the-future"
              className="mt-8 inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Read it
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Project Section */}
      <section id="work" className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">Featured Work</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light">Recent Projects</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-900/10">
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-700 relative overflow-hidden">
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-gray-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FC4C02]" aria-hidden />
                  Live
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-5xl md:text-6xl font-bold mb-2">Coach</div>
                    <div className="text-xl opacity-90">Training</div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-light mb-4">
                  Training Coach
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  A weekly plan from your own Strava rides. The token stays in an encrypted
                  browser cookie, and the page still works without a database.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Next.js</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Strava</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Claude</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href="/training"
                    className="inline-flex items-center text-gray-900 font-medium hover:opacity-70"
                  >
                    Launch app
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/projects/training" className="text-sm text-gray-500 hover:text-gray-900">
                    Case study
                  </Link>
                </div>
              </div>
            </article>

            <Link
              href="/race-trackingV2"
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-5xl md:text-6xl font-bold mb-2">4SOH</div>
                    <div className="text-xl opacity-90">Race Tracker</div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif font-light mb-4 group-hover:text-gray-600 transition-colors">
                  Four Seasons One Hour Challenge
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Seasonal leaderboard for the Horsetooth Four Seasons challenge. This portfolio build
                  shows the real UI on bundled sample riders, with no live Strava or database calls.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Next.js</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">TypeScript</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Sample data</span>
                </div>
                <div className="mt-6 flex items-center text-gray-900 font-medium group-hover:translate-x-2 transition-transform">
                  View demo
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">How I work</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">Decisions you can open</h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Strategy, discovery, design, and delivery, each tied to a page on this site.
              The other long thread is a HubSpot instance for a multi-location franchise brand.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/how-i-work"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              How I work
            </Link>
            <Link
              href="/projects/hubspot-franchise"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-900 rounded-md hover:border-gray-400 transition-colors"
            >
              HubSpot case study
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
            Say hi
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            The work is on the site. Email if you want to talk about it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:switchbacklabsco@gmail.com"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Email
            </a>
            <a 
              href="https://github.com/cjones88a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-white rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium"
            >
              View GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Switchback Labs</span>
              <span className="text-gray-400">—</span>
              <span className="text-gray-500 text-sm">Built in Fort Collins, CO</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <a 
                href="https://github.com/cjones88a" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            © 2025 Switchback Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
