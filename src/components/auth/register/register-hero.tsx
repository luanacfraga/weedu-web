import { Steps } from '@/components/ui/steps'
import Image from 'next/image'

interface RegisterHeroProps {
  steps: Array<{ id: number; title: string; description: string }>
  currentStep: number
}

export function RegisterHero({ steps, currentStep }: RegisterHeroProps) {
  return (
    <div className="relative z-10 hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2 lg:flex-col">
      <div className="absolute right-0 top-0 h-64 w-64 animate-blob rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animation-delay-2000 absolute right-0 top-0 h-64 w-64 animate-blob rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 animate-blob rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <Image
              src="/images/logo.png"
              alt="Weedu"
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
            Cadastre sua empresa
          </h1>
          <p className="mb-8 text-muted-foreground">
            Comece grátis e gerencie sua empresa de forma profissional.
          </p>
          <div>
            <Steps steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  )
}
