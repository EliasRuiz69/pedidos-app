'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { href: '/admin/orders', label: 'Pedidos', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { href: '/admin/products', label: 'Productos', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { href: '/admin/customers', label: 'Clientes', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    )},
    { href: '/admin/reports', label: 'Reportes', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
  ]

  return (
    <div>
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-stretch">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    active
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
