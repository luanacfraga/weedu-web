'use client'

import { useIsMobile } from '@/lib/hooks/use-media-query'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { ReactNode, useMemo } from 'react'

export interface MenuItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  subItems?: {
    name: string
    href: string
  }[]
}

interface SidebarProps {
  items: MenuItem[]
  onLogout?: () => void
  showLogout?: boolean
  className?: string
  topComponent?: ReactNode
}

export function Sidebar({
  items,
  onLogout,
  showLogout = true,
  className = '',
  topComponent,
}: SidebarProps) {
  const pathname = usePathname()
  const { isMobileMenuOpen, closeMobileMenu, isWebMenuCollapsed, toggleWebMenu } = useUIStore()
  const isMobile = useIsMobile()

  const shouldShowText = !isWebMenuCollapsed || isMobile

  const sidebarClasses = useMemo(
    () =>
      [
        'fixed left-0 top-0 h-[100dvh] z-[60] pt-14 sm:pt-16',
        'bg-card',
        'border-r border-border transition-all duration-300 ease-in-out',
        'flex flex-col',
        isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
        'lg:translate-x-0 lg:shadow-none',
        isWebMenuCollapsed ? 'lg:w-16' : 'w-64',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [isMobileMenuOpen, isWebMenuCollapsed, className]
  )

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div className={sidebarClasses}>
        <button
          className={cn(
            'absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground lg:flex',
            isWebMenuCollapsed && 'top-24'
          )}
          onClick={toggleWebMenu}
          aria-label={isWebMenuCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isWebMenuCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {topComponent && (
          <div
            className={cn(
              'mb-4 mt-6 flex-shrink-0 px-4',
              !shouldShowText && 'flex justify-center px-2'
            )}
          >
            {React.isValidElement(topComponent)
              ? React.cloneElement(topComponent as React.ReactElement, {
                  isCollapsed: isWebMenuCollapsed && !isMobile,
                })
              : topComponent}
          </div>
        )}

        <nav
          className={cn(
            'scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden pb-4 pt-2',
            isWebMenuCollapsed ? 'lg:px-2' : 'px-4'
          )}
        >
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.subItems && item.subItems.some((subItem) => pathname === subItem.href))

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'group relative flex items-center text-sm font-medium transition-all duration-200 ease-in-out',
                      isWebMenuCollapsed
                        ? 'rounded-lg lg:h-10 lg:w-10 lg:justify-center lg:p-2'
                        : 'rounded-lg px-3 py-2.5 gap-3',
                      isActive
                        ? isWebMenuCollapsed && !isMobile
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={isWebMenuCollapsed ? item.name : ''}
                  >
                    {item.icon && (
                      <div className="relative flex-shrink-0">
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive
                              ? isWebMenuCollapsed && !isMobile
                                ? 'text-primary-foreground'
                                : 'text-primary'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                      </div>
                    )}
                    {shouldShowText && (
                      <span className="truncate">
                        {item.name}
                      </span>
                    )}
                  </Link>

                  {item.subItems && isActive && shouldShowText && (
                    <div className="relative ml-4 mt-1 border-l border-border pl-4 pt-1">
                      <ul className="space-y-0.5">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={closeMobileMenu}
                              className={cn(
                                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                isSubActive
                                    ? 'bg-muted font-medium text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                              )}
                            >
                              <span className="truncate">{subItem.name}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {showLogout && onLogout && (
          <div
            className={cn(
              'flex-shrink-0 border-t border-border/40',
              isWebMenuCollapsed ? 'lg:p-2' : 'p-4'
            )}
          >
            <button
              onClick={() => {
                onLogout()
                closeMobileMenu()
              }}
              className={cn(
                'group flex items-center rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive',
                isWebMenuCollapsed
                  ? 'lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:p-2'
                  : 'w-full gap-3 px-3 py-2.5'
              )}
              title={isWebMenuCollapsed ? 'Sair' : ''}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              {shouldShowText && (
                <span className="truncate">Sair</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
