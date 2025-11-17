'use client'

import { ReactNode } from 'react'

interface RegisterLayoutProps {
  children: ReactNode
  steps: ReactNode
  onStepChange?: (step: number) => void
}

export function RegisterLayout({ children, steps }: RegisterLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="from-primary/8 to-secondary/8 absolute inset-0 bg-gradient-to-b via-background via-50% lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent lg:hidden"></div>

      <div className="animate-blob absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/15 opacity-40 blur-[100px] lg:hidden"></div>
      <div className="animate-blob animation-delay-2000 absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/15 opacity-40 blur-[120px] lg:hidden"></div>
      <div className="animate-blob animation-delay-4000 absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-primary/10 opacity-30 blur-[80px] lg:hidden"></div>
      <div className="animate-blob animation-delay-3000 bg-secondary/12 absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full opacity-25 blur-[90px] lg:hidden"></div>

      <div className="relative z-10 hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2 lg:flex-col">
        <div className="animate-blob absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-extrabold tracking-tight text-transparent transition-all duration-300 hover:from-secondary hover:to-primary">
                Weedu
              </span>
            </div>
            <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
              Cadastre sua empresa
            </h1>
            <p className="mb-8 text-muted-foreground">
              Comece grátis e gerencie sua empresa de forma profissional.
            </p>
            <div>{steps}</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-12">
        {children}
      </div>
    </div>
  )
}

