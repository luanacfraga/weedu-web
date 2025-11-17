'use client'

import { RegisterForm } from '@/components/register/register-form'
import { RegisterLayout } from '@/components/register/register-layout'
import { Steps } from '@/components/ui/steps'
import { useState } from 'react'

const STEPS = [
  { id: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 2, title: 'CNPJ', description: 'Documento da empresa' },
  { id: 3, title: 'Segurança', description: 'Crie sua senha' },
  { id: 4, title: 'Empresa', description: 'Dados da empresa' },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <RegisterLayout
      steps={<Steps steps={STEPS} currentStep={currentStep} />}
      onStepChange={setCurrentStep}
    >
      <RegisterForm onStepChange={setCurrentStep} />
    </RegisterLayout>
  )
}
