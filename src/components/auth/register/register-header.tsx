import Image from 'next/image'

interface RegisterHeaderProps {
  currentStep: number
  totalSteps: number
}

export function RegisterHeader({ currentStep, totalSteps }: RegisterHeaderProps) {
  return (
    <div className="mb-6 text-center lg:hidden">
      <h2 className="text-2xl font-semibold font-heading text-foreground">Cadastre sua empresa</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Etapa {currentStep + 1} de {totalSteps}
      </p>
    </div>
  )
}
