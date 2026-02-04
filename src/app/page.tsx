import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold tracking-tight">Switchback Labs</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#work" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Work
              </Link>
              <Link href="#services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <Link 
                href="#contact" 
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                Get in touch
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
              I help founders and teams turn fuzzy ideas into shipped experiences: crisp strategy, 
              evidence-based decisions, and specs developers love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="#work"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                View my work
              </Link>
              <Link 
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-900 rounded-md hover:border-gray-400 transition-colors"
              >
                Let's talk
              </Link>
            </div>
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

          {/* Project Card */}
          <Link 
            href="/race-trackingV2" 
            className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-2">4SOH</div>
                  <div className="text-xl opacity-90">Race Tracker</div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif font-light mb-4 group-hover:text-gray-600 transition-colors">
                Four Seasons One Hour Challenge
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Real-time race tracking and leaderboard platform connecting athletes through Strava. 
                Built with Next.js, Supabase, and Strava OAuth for seamless performance tracking 
                across multiple seasonal challenges.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Next.js</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">TypeScript</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Supabase</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">Strava API</span>
              </div>
              <div className="mt-6 flex items-center text-gray-900 font-medium group-hover:translate-x-2 transition-transform">
                View project
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">Services</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">What I Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              End-to-end product leadership from strategy and discovery through delivery and launch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-2 border-gray-900 pl-6">
              <div className="text-sm text-gray-500 mb-2">01</div>
              <h3 className="text-2xl font-serif font-light mb-4">Product Strategy</h3>
              <p className="text-gray-600 leading-relaxed">
                Turn ambiguous opportunities into clear roadmaps. I help define what to build, 
                why it matters, and how to measure success—grounded in user needs and business objectives.
              </p>
            </div>

            <div className="border-l-2 border-gray-900 pl-6">
              <div className="text-sm text-gray-500 mb-2">02</div>
              <h3 className="text-2xl font-serif font-light mb-4">Technical Product Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Bridge the gap between vision and engineering. I write specs developers trust, 
                make architectural decisions, and ship products that scale.
              </p>
            </div>

            <div className="border-l-2 border-gray-900 pl-6">
              <div className="text-sm text-gray-500 mb-2">03</div>
              <h3 className="text-2xl font-serif font-light mb-4">Product Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Validate assumptions before building. Through rapid prototyping and user research, 
                I help teams learn fast and avoid expensive mistakes.
              </p>
            </div>

            <div className="border-l-2 border-gray-900 pl-6">
              <div className="text-sm text-gray-500 mb-2">04</div>
              <h3 className="text-2xl font-serif font-light mb-4">Team Leadership</h3>
              <p className="text-gray-600 leading-relaxed">
                Build momentum and alignment. I establish product rituals, coach teams on best practices, 
                and create environments where great work happens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
            Ready to ship something great?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Let's discuss how I can help you turn your product vision into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:hello@switchbacklabsco.com"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Get in touch
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
