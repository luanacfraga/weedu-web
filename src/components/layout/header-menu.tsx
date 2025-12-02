'use client'

import { formatRole } from '@/lib/formatters'
import { useIsMobile } from '@/lib/hooks/use-media-query'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useUIStore } from '@/lib/stores/ui-store'
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
      className={`fixed top-0 z-[70] w-full border-b border-border/50 bg-card/95 backdrop-blur-sm transition-all duration-300 ${
        scrolled ? 'border-border shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
          {/* Left Section: Logo & Mobile Menu */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            {isMobile && (
              <button
                type="button"
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  isMobileMenuOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={toggleMobileMenu}
                aria-label="Menu de navegação"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}

            <div className="flex-shrink-0">
              <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold tracking-tight text-transparent transition-all duration-300 hover:from-secondary hover:to-primary sm:text-2xl">
                Weedu
              </span>
            </div>
          </div>

          {/* Right Section: Actions & Profile */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-10 sm:w-10"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5 text-muted-foreground transition-colors duration-200 hover:text-foreground" />
              {/* Badge de notificações pode ser adicionado aqui */}
            </button>

            {/* Profile Button */}
            <button
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:gap-3 sm:px-3 sm:py-2"
              onClick={onProfileClick}
              aria-label="Perfil do usuário"
            >
              {/* User Info (Desktop only) */}
              <div className="hidden flex-col items-end sm:flex">
                <span className="max-w-[140px] truncate text-sm font-medium leading-tight text-foreground md:max-w-[200px]">
                  {user?.name}
                </span>
                <span className="text-xs leading-tight text-muted-foreground">
                  {role && getRoleLabel(role)}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-9 sm:w-9">
                <span className="text-sm font-semibold text-white">
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
