'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Steps } from '@/components/ui/steps'
import { ApiError } from '@/lib/api/api-client'
import { maskCNPJ, maskPhone, unmaskCNPJ, unmaskPhone } from '@/lib/utils/masks'
import { registerSchema, type RegisterFormData } from '@/lib/validators/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PersonalDataStep } from './steps/personal-data-step'
import { DocumentStep } from './steps/document-step'
import { SecurityStep } from './steps/security-step'
import { CompanyStep } from './steps/company-step'
import { useRegisterForm } from './hooks/use-register-form'

const STEPS = [
  { id: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 2, title: 'CNPJ', description: 'Documento da empresa' },
  { id: 3, title: 'Segurança', description: 'Crie sua senha' },
  { id: 4, title: 'Empresa', description: 'Dados da empresa' },
]

interface RegisterFormProps {
  onStepChange?: (step: number) => void
}

export function RegisterForm({ onStepChange }: RegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { register: registerUser, isLoading } = useRegisterForm()

  const updateStep = (step: number) => {
    setCurrentStep(step)
    onStepChange?.(step)
  }

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

  const phoneField = watch('phone')
  const documentField = watch('document')
  const [phoneValue, setPhoneValue] = useState('')
  const [cnpjValue, setCnpjValue] = useState('')

  useEffect(() => {
    if (phoneField) {
      const unmaskedPhone = unmaskPhone(phoneValue)
      if (phoneField !== unmaskedPhone) {
        setPhoneValue(maskPhone(phoneField))
      }
    }
  }, [phoneField, phoneValue])

  useEffect(() => {
    if (documentField) {
      const unmaskedCnpj = unmaskCNPJ(cnpjValue)
      if (documentField !== unmaskedCnpj) {
        setCnpjValue(maskCNPJ(documentField))
      }
    }
  }, [documentField, cnpjValue])

  const validateStep = async (step: number): Promise<boolean> => {
    let fields: (keyof RegisterFormData)[] = []

    switch (step) {
      case 0:
        fields = ['firstName', 'lastName', 'email', 'phone']
        break
      case 1:
        fields = ['document']
        break
      case 2:
        fields = ['password', 'confirmPassword']
        break
      case 3:
        fields = ['companyName', 'companyDescription']
        break
    }

    const result = await trigger(fields)
    return result
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1
      updateStep(nextStep)
      setError(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      updateStep(prevStep)
      setError(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
      phoneValue,
      setPhoneValue,
      cnpjValue,
      setCnpjValue,
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
      <div className="mb-6 text-center lg:hidden">
        <div className="mb-4">
          <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-extrabold tracking-tight text-transparent transition-all duration-300 hover:from-secondary hover:to-primary">
            Weedu
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Cadastre sua empresa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {STEPS.length}
        </p>
      </div>

      <div className="mb-6 lg:hidden">
        <Steps steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="animate-fade-in relative rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">{STEPS[currentStep].title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
        </div>

        <form
          method="POST"
          onSubmit={(e) => {
            e.preventDefault()
            if (currentStep === STEPS.length - 1) {
              handleSubmit(onSubmit)(e)
            } else {
              handleNext()
            }
          }}
          className="space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="min-h-[300px] sm:min-h-[350px]">
            {renderStepContent()}
          </div>

          <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-border/50 pt-6 sm:relative sm:border-t-0 sm:pt-0">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex-1 sm:min-w-[120px] sm:flex-initial"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
                <span className="sm:hidden">Anterior</span>
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98] sm:min-w-[140px] sm:flex-initial"
              size="lg"
              disabled={isLoading}
            >
              {currentStep === STEPS.length - 1 ? (
                isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Criando...
                  </span>
                ) : (
                  'Criar conta'
                )
              ) : (
                <>
                  <span className="hidden sm:inline">Próximo</span>
                  <span className="sm:hidden">Continuar</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 border-t border-border/50 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
              >
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

