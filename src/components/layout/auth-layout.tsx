import { cn } from '@/lib/utils'
import Image from 'next/image'
import * as React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showWelcome?: boolean
}

export function AuthLayout({
  children,
  title = 'ToolDo',
  subtitle = 'Gestão inteligente',
  showWelcome = true,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="from-primary/8 to-secondary/8 absolute inset-0 bg-gradient-to-b via-background via-50% lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent lg:hidden"></div>

      <div className="absolute -right-40 -top-40 h-80 w-80 animate-blob rounded-full bg-primary/15 opacity-40 blur-[100px] lg:hidden"></div>
      <div className="animation-delay-2000 absolute -bottom-32 -left-32 h-96 w-96 animate-blob rounded-full bg-secondary/15 opacity-40 blur-[120px] lg:hidden"></div>
      <div className="animation-delay-4000 absolute right-1/3 top-1/3 h-64 w-64 animate-blob rounded-full bg-primary/10 opacity-30 blur-[80px] lg:hidden"></div>
      <div className="animation-delay-3000 bg-secondary/12 absolute bottom-1/4 left-1/4 h-72 w-72 animate-blob rounded-full opacity-25 blur-[90px] lg:hidden"></div>

      {showWelcome && (
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2">
          <div className="absolute right-0 top-0 h-64 w-64 animate-blob rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-2000 absolute right-0 top-0 h-64 w-64 animate-blob rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 animate-blob rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

          <div className="relative z-10 mx-auto flex max-w-md flex-col justify-center px-12">
            <div className="mb-6 flex items-center">
              <Image
                src="/images/logo.png"
                alt="Weedu"
                width={300}
                height={100}
                className="h-24 w-auto object-contain"
                priority
              />
            </div>
            <h2 className="font-heading mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
              Transforme a gestão da sua empresa
            </h2>
            <p className="text-lg text-muted-foreground">
              Simplifique. Produza mais. Cresça com facilidade usando nossa plataforma inteligente.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative z-10 flex flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        )}
      >
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 animate-fade-in text-center lg:hidden">
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="mb-2 flex justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="Weedu"
                    width={200}
                    height={66}
                    className="h-16 w-auto object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
