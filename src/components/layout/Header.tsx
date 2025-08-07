'use client'

import { useState } from 'react'

export function Header() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CA</span>
            </div>
            <span className="font-semibold text-foreground">Chat Assistant</span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
