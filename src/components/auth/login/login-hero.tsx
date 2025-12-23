import Image from 'next/image'

export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2">
      <div className="animate-blob absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

      <div className="relative z-10 mx-auto flex max-w-md flex-col justify-center px-12">
        <div className="mb-6 flex items-center">
          <Image
            src="/images/logo.png"
            alt="Weedu"
            width={150}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <h2 className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold font-heading leading-tight text-transparent md:text-5xl">
          Transforme a gestão da sua empresa
        </h2>
        <p className="text-lg text-muted-foreground">
          Simplifique. Produza mais. Cresça com facilidade usando nossa plataforma inteligente.
        </p>
      </div>
    </div>
  )
}
