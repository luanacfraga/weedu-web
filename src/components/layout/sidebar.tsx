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
        'fixed left-0 top-0 h-screen z-[60] pt-14 sm:pt-16',
        'bg-card/95 backdrop-blur-sm border-r border-border/50',
        'shadow-lg lg:shadow-sm',
        'transition-all duration-300 ease-in-out',
        'flex flex-col',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
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
            'absolute -right-3 top-20 z-10 hidden rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-lg transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 active:scale-95 lg:flex items-center justify-center',
            isWebMenuCollapsed && 'top-24'
          )}
          onClick={toggleWebMenu}
          aria-label={isWebMenuCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isWebMenuCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-200" />
          )}
        </button>

        {topComponent && (
          <div
            className={cn(
              'mt-6 mb-4 flex-shrink-0 border-b border-border/50 pb-4',
              shouldShowText ? 'px-4' : 'px-2 flex justify-center'
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
            'flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30 pt-2 pb-4',
            isWebMenuCollapsed ? 'lg:px-2' : 'px-4'
          )}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted)) transparent',
          }}
        >
          <ul className="space-y-0.5">
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
                      'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                      isWebMenuCollapsed ? 'lg:justify-center lg:p-2.5 lg:w-10 lg:h-10' : 'px-3 py-2.5 gap-3',
                      isActive
                        ? isWebMenuCollapsed && !isMobile
                          ? 'bg-primary text-primary-foreground shadow-sm [&>svg]:text-primary-foreground'
                          : 'bg-primary/10 text-primary shadow-sm [&>svg]:text-primary'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground [&>svg]:transition-transform [&>svg]:duration-200 group-hover:[&>svg]:scale-110'
                    )}
                    title={isWebMenuCollapsed ? item.name : ''}
                  >
                    {isActive && !isWebMenuCollapsed && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    {item.icon && (
                      <item.icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-all duration-200',
                          isActive
                            ? isWebMenuCollapsed && !isMobile
                              ? 'text-primary-foreground'
                              : 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                    )}
                    {shouldShowText && (
                      <span className="truncate transition-all duration-200 font-medium">{item.name}</span>
                    )}
                  </Link>

                  {item.subItems && isActive && shouldShowText && (
                    <ul className="ml-4 mt-2 space-y-0.5 border-l border-border/50 pl-4">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                              pathname === subItem.href
                                ? 'bg-primary/5 text-primary border-l-2 border-primary -ml-4 pl-4'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                          >
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {showLogout && onLogout && (
          <div
            className={cn(
              'flex-shrink-0 border-t border-border/50',
              isWebMenuCollapsed ? 'lg:p-2' : 'p-4'
            )}
          >
            <button
              onClick={() => {
                onLogout()
                closeMobileMenu()
              }}
              className={cn(
                'group flex items-center rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive',
                isWebMenuCollapsed
                  ? 'lg:mx-auto lg:w-10 lg:h-10 lg:justify-center lg:p-2.5'
                  : 'w-full px-3 py-2.5 gap-3'
              )}
              title={isWebMenuCollapsed ? 'Sair' : ''}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {shouldShowText && <span className="truncate">Sair</span>}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
