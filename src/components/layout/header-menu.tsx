'use client'

import { useIsMobile } from '@/lib/hooks/use-media-query'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { formatRole } from '@/lib/formatters'
import { useUIStore } from '@/lib/stores/ui-store'
import { CompanySelector } from '@/components/features/company/selectors/company-selector'
import { Bell, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderMenuProps {
  onProfileClick?: () => void
}

export function HeaderMenu({ onProfileClick }: HeaderMenuProps) {
  const { user, role, isAdmin } = usePermissions()
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return 'Usuário'
    return formatRole(role as any)
  }

  return (
    <header
      className={`fixed z-[70] w-full border-b bg-card transition-all duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center">
            {isMobile && (
              <div className="flex flex-shrink-0 items-center">
                <button
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    isMobileMenuOpen
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={toggleMobileMenu}
                  aria-label="Menu de navegação"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            )}

            <div className={`flex-shrink-0 ${isMobile ? 'ml-3 sm:ml-4' : ''}`}>
              <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold tracking-tight text-transparent transition-all duration-300 hover:from-secondary hover:to-primary sm:text-2xl">
                Weedu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="hidden sm:block">
                <CompanySelector variant="compact" showLabel={false} />
              </div>
            )}
            <button className="relative inline-flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:gap-3 sm:p-2"
              onClick={onProfileClick}
            >
              <div className="mr-1 hidden flex-col items-end sm:mr-2 sm:flex">
                <span className="max-w-[120px] truncate text-sm font-medium leading-tight text-foreground md:max-w-none">
                  {user?.name}
                </span>
                <span className="text-xs leading-tight text-muted-foreground">
                  {role && getRoleLabel(role)}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm transition-transform duration-200 hover:scale-105 sm:h-9 sm:w-9">
                <span className="text-sm font-medium text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
