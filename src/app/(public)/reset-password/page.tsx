import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password/reset-password-form'

function ResetPasswordFormWrapper() {
  return (
    <>
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Redefinir senha</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Digite sua nova senha
        </p>
      </div>
      <div className="mb-8 hidden text-center lg:block">
        <h2 className="text-3xl font-bold text-foreground">Redefinir senha</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite e confirme sua nova senha
        </p>
      </div>
      <ResetPasswordForm />
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordFormWrapper />
    </Suspense>
  )
}
