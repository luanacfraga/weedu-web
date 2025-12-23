interface LoginHeaderProps {
  variant?: 'mobile' | 'desktop'
}

export function LoginHeader({ variant = 'mobile' }: LoginHeaderProps) {
  if (variant === 'mobile') {
    return (
      <div className="mb-8 animate-fade-in text-center lg:hidden">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
              ToolDo
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">Gestão inteligente</p>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Bem-vindo(a) de volta</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>
    )
  }

  return (
    <div className="mb-8 hidden text-center lg:block">
      <h2 className="text-3xl font-bold text-foreground">Bem-vindo(a) de volta</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Entre com suas credenciais para continuar
      </p>
    </div>
  )
}
