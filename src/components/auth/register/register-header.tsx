import Image from 'next/image'

interface RegisterHeaderProps {
  currentStep: number
  totalSteps: number
}

export function RegisterHeader({ currentStep, totalSteps }: RegisterHeaderProps) {
  return (
    <div className="mb-6 text-center lg:hidden">
      <div className="flex justify-center mb-6">
        <Image
          src="/images/logo.png"
          alt="Weedu"
          width={140}
          height={46}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
      <h2 className="text-2xl font-semibold text-foreground">Cadastre sua empresa</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Etapa {currentStep + 1} de {totalSteps}
      </p>
    </div>
  )
}
