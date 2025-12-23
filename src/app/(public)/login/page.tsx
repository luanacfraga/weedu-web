import { LoginForm } from '@/components/auth/login/login-form'

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Bem-vindo(a) de volta</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>
      <div className="mb-8 hidden text-center lg:block">
        <h2 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre com suas credenciais para continuar
        </p>
      </div>
      <LoginForm />
    </>
  )
}
