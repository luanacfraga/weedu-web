import { ForgotPasswordForm } from '@/components/auth/forgot-password/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Recuperar senha</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Digite seu email para receber as instruções
        </p>
      </div>
      <div className="mb-8 hidden text-center lg:block">
        <h2 className="text-3xl font-bold text-foreground">Recuperar senha</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite seu email para receber as instruções de recuperação
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}

