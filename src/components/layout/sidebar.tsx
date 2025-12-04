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
        'bg-gradient-to-b from-card via-card to-card/98 backdrop-blur-xl',
        'border-r border-border/60 shadow-xl lg:shadow-2xl',
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
            'absolute -right-3 top-20 z-10 hidden rounded-full border-2 border-border/80 bg-gradient-to-br from-card to-card/90 backdrop-blur-sm p-1.5 text-muted-foreground shadow-xl transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-primary/90 hover:text-primary-foreground hover:border-primary hover:shadow-primary/20 hover:shadow-lg hover:scale-110 active:scale-95 lg:flex items-center justify-center',
            isWebMenuCollapsed && 'top-24'
          )}
          onClick={toggleWebMenu}
          aria-label={isWebMenuCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isWebMenuCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-300" />
          )}
        </button>

        {topComponent && (
          <div
            className={cn(
              'mt-6 mb-6 flex-shrink-0 border-b border-border/60 pb-6',
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
                      'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300',
                      isWebMenuCollapsed ? 'lg:justify-center lg:p-2.5 lg:w-10 lg:h-10' : 'px-3 py-3 gap-3',
                      isActive
                        ? isWebMenuCollapsed && !isMobile
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 [&>svg]:text-primary-foreground'
                          : 'bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 text-primary shadow-md shadow-primary/5 border border-primary/20 [&>svg]:text-primary'
                        : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 hover:text-foreground hover:shadow-sm border border-transparent hover:border-border/50 [&>svg]:transition-all [&>svg]:duration-300 group-hover:[&>svg]:scale-110 group-hover:[&>svg]:text-primary'
                    )}
                    title={isWebMenuCollapsed ? item.name : ''}
                  >
                    {isActive && !isWebMenuCollapsed && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary/80 shadow-sm" />
                    )}
                    {item.icon && (
                      <div className={cn(
                        'relative flex-shrink-0 transition-all duration-300',
                        isActive && !isWebMenuCollapsed && 'before:absolute before:inset-0 before:rounded-lg before:bg-primary/10 before:blur-sm'
                      )}>
                        <item.icon
                          className={cn(
                            'h-5 w-5 relative z-10 transition-all duration-300',
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
                      <span className={cn(
                        'truncate transition-all duration-300',
                        isActive ? 'font-semibold' : 'font-medium group-hover:font-semibold'
                      )}>
                        {item.name}
                      </span>
                    )}
                  </Link>

                  {item.subItems && isActive && shouldShowText && (
                    <ul className="ml-4 mt-3 space-y-1 border-l-2 border-primary/20 pl-4">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={closeMobileMenu}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 relative',
                                isSubActive
                                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-l-2 border-primary -ml-4 pl-4 shadow-sm font-semibold'
                                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/40 hover:to-muted/20 hover:text-foreground hover:border-l-2 hover:border-primary/30 -ml-4 pl-4 border-l-2 border-transparent'
                              )}
                            >
                              {isSubActive && (
                                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                              )}
                              <span className="truncate">{subItem.name}</span>
                            </Link>
                          </li>
                        )
                      })}
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
              'flex-shrink-0 border-t border-border/60',
              isWebMenuCollapsed ? 'lg:p-2' : 'p-4 pt-6'
            )}
          >
            <button
              onClick={() => {
                onLogout()
                closeMobileMenu()
              }}
              className={cn(
                'group flex items-center rounded-xl text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:text-destructive hover:shadow-sm border border-transparent hover:border-destructive/20',
                isWebMenuCollapsed
                  ? 'lg:mx-auto lg:w-10 lg:h-10 lg:justify-center lg:p-2.5'
                  : 'w-full px-3 py-3 gap-3'
              )}
              title={isWebMenuCollapsed ? 'Sair' : ''}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
              {shouldShowText && (
                <span className="truncate font-medium group-hover:font-semibold transition-all duration-300">
                  Sair
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
