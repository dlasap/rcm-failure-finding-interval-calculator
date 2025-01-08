'use client'

import Link from 'next/link'
import { Menu, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/calculator/availability-based-ffi', label: 'Availability-based FFI' },
    { href: '/calculator/economic-optimum-ffi', label: 'Economic Optimum FFI' },
    { href: '/calculator/risk-based-ffi', label: 'Risk Based FFI' },
    { href: '/calculator/risk-based-voting-ffi', label: 'Risk Based Voting FFI' },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: 'https://reliabilitymanagement.co.uk/contact-us/', label: 'Contact Us', external: true },
  ]

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold">Failure Finding Interval Calculator V1.0</Link>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 text-sm"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  )
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

