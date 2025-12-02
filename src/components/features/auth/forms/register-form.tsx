'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorAlert } from '@/components/auth/login/error-alert'
import { AuthLink } from '@/components/auth/register/auth-link'
import { RegisterHeader } from '@/components/auth/register/register-header'
import { StepHeader } from '@/components/auth/register/step-header'
import { StepNavigationButtons } from '@/components/auth/register/step-navigation-buttons'
import { Steps } from '@/components/ui/steps'
import { CompanyStep } from '@/components/register/steps/company-step'
import { DocumentStep } from '@/components/register/steps/document-step'
import { PersonalDataStep } from '@/components/register/steps/personal-data-step'
import { SecurityStep } from '@/components/register/steps/security-step'
import { useRegisterForm } from '@/components/register/hooks/use-register-form'
import { useStepNavigation } from '@/lib/hooks/ui/use-step-navigation'
import { useFormMask } from '@/lib/hooks/ui/use-form-mask'
import { ApiError } from '@/lib/api/api-client'
import { maskCNPJ, maskPhone, unmaskCNPJ, unmaskPhone } from '@/lib/utils/masks'
import { registerSchema, type RegisterFormData } from '@/lib/validators/auth'

const STEPS = [
  { id: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 2, title: 'CNPJ', description: 'Documento da empresa' },
  { id: 3, title: 'Segurança', description: 'Crie sua senha' },
  { id: 4, title: 'Empresa', description: 'Dados da empresa' },
]

interface RegisterFormProps {
  onStepChange?: (step: number) => void
}

/**
 * Container do formulário de registro
 * Responsabilidade única: Orquestrar lógica de registro e validação
 *
 * Aplica SRP: Usa hooks para separar responsabilidades
 * Aplica DIP: Depende de abstrações (hooks)
 */
export function RegisterForm({ onStepChange }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null)
  const { register: registerUser, isLoading } = useRegisterForm()

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      document: '',
      companyName: '',
      companyDescription: '',
    },
  })

  const { currentStep, isLastStep, goToNext, goToPrevious } = useStepNavigation({
    totalSteps: STEPS.length,
    onStepChange,
  })

  // Gerenciamento de máscaras
  const phoneInput = useFormMask({
    fieldName: 'phone',
    mask: maskPhone,
    unmask: unmaskPhone,
    watch,
    setValue,
  })

  const cnpjInput = useFormMask({
    fieldName: 'document',
    mask: maskCNPJ,
    unmask: unmaskCNPJ,
    watch,
    setValue,
  })

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsByStep: Record<number, (keyof RegisterFormData)[]> = {
      0: ['firstName', 'lastName', 'email', 'phone'],
      1: ['document'],
      2: ['password', 'confirmPassword'],
      3: ['companyName', 'companyDescription'],
    }

    const fields = fieldsByStep[currentStep] || []
    return await trigger(fields)
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      goToNext()
      setError(null)
    }
  }

  const handlePrevious = () => {
    goToPrevious()
    setError(null)
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: unmaskPhone(data.phone),
        document: unmaskCNPJ(data.document),
        documentType: 'CNPJ',
        company: {
          name: data.companyName,
          description: data.companyDescription,
        },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as { message?: string }
        const errorMessage = errorData?.message || 'Erro ao fazer cadastro. Tente novamente.'
        setError(errorMessage)
      } else {
        setError('Erro ao fazer cadastro. Tente novamente.')
      }
    }
  }

  const renderStepContent = () => {
    const stepProps = {
      register,
      errors,
      setValue,
      phoneValue: phoneInput.maskedValue,
      setPhoneValue: phoneInput.setMaskedValue,
      cnpjValue: cnpjInput.maskedValue,
      setCnpjValue: cnpjInput.setMaskedValue,
    }

    switch (currentStep) {
      case 0:
        return <PersonalDataStep {...stepProps} />
      case 1:
        return <DocumentStep {...stepProps} />
      case 2:
        return <SecurityStep {...stepProps} />
      case 3:
        return <CompanyStep {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-md">
      <RegisterHeader currentStep={currentStep} totalSteps={STEPS.length} />

      <div className="mb-6 lg:hidden">
        <Steps steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="animate-fade-in relative rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
        <StepHeader title={STEPS[currentStep].title} description={STEPS[currentStep].description} />

        <form
          method="POST"
          onSubmit={(e) => {
            e.preventDefault()
            if (isLastStep) {
              handleSubmit(onSubmit)(e)
            } else {
              handleNext()
            }
          }}
          className="space-y-6"
        >
          {error && <ErrorAlert message={error} />}

          <div className="min-h-[300px] sm:min-h-[350px]">{renderStepContent()}</div>

          <StepNavigationButtons
            currentStep={currentStep}
            totalSteps={STEPS.length}
            isLoading={isLoading}
            onPrevious={handlePrevious}
          />

          <AuthLink question="Já tem uma conta?" linkText="Faça login" href="/login" />
        </form>
      </div>
    </div>
  )
}
