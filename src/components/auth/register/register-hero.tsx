import { Steps } from '@/components/ui/steps'

interface RegisterHeroProps {
  steps: Array<{ id: number; title: string; description: string }>
  currentStep: number
}

export function RegisterHero({ steps, currentStep }: RegisterHeroProps) {
  return (
    <div className="relative z-10 hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2 lg:flex-col">
      <div className="animate-blob absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-extrabold tracking-tight text-transparent transition-all duration-300 hover:from-secondary hover:to-primary">
              ToolDo
            </span>
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

