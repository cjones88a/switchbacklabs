"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Switchback Labs
          </Link>
          <nav className="flex items-center space-x-6">
            <Link 
              href="/projects" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projects
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
