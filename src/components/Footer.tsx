import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-gray-600">
            © {currentYear} Switchback Labs
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="https://x.com/yourhandle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              X
            </Link>
            <Link 
              href="https://linkedin.com/company/switchbacklabs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              LinkedIn
            </Link>
            <Link 
              href="mailto:hello@switchbacklabsco.com"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Email
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
