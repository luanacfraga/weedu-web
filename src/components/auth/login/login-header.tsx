import Image from 'next/image'

interface LoginHeaderProps {
  variant?: 'mobile' | 'desktop'
}

export function LoginHeader({ variant = 'mobile' }: LoginHeaderProps) {
  if (variant === 'mobile') {
    return (
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <h2 className="font-heading mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-bold text-transparent">
          Bem-vindo(a) de volta
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>
    )
  }

  return (
    <div className="mb-10 hidden text-center lg:block">
      <h2 className="font-heading mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
        Bem-vindo(a) de volta
      </h2>
      <p className="text-base text-muted-foreground">
        Entre com suas credenciais para continuar
      </p>
    </div>
  )
}
