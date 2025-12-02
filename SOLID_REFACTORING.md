# Refatoração SOLID - Organização de Componentes

Este documento descreve a refatoração realizada nos componentes da aplicação Weedu Web seguindo os princípios SOLID.

## Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
**Cada componente/hook tem uma única responsabilidade**

#### Antes:
- `CompanySelector` tinha múltiplas responsabilidades:
  - Fetch de dados da API
  - Gerenciamento de estado
  - Renderização de UI
  - Lógica de navegação

#### Depois:
- **Hook `useCompanyData`**: Responsável apenas por buscar e gerenciar dados de empresas
- **Componente `CompanySelector`**: Container que orquestra estado e renderização
- **Componente `CompanySelectorView`**: Componente puro de apresentação
- **Componente `EmptyCompanyState`**: Componente especializado para estado vazio

### 2. Open/Closed Principle (OCP)
**Componentes abertos para extensão, fechados para modificação**

#### Implementação:
- Componentes de feedback (`LoadingSpinner`, `LoadingScreen`, `ErrorState`) são reutilizáveis e extensíveis através de props
- Variantes de componentes (ex: `variant="compact"`) permitem extensão sem modificar código existente
- Componentes de apresentação aceitam props customizáveis

### 3. Dependency Inversion Principle (DIP)
**Dependência de abstrações, não de implementações**

#### Implementação:
- Componentes dependem de **hooks** (abstrações) ao invés de stores Zustand diretamente
- Exemplo: `AdminOnly` usa `useAuthGuard()` ao invés de acessar `useAuthStore()` diretamente
- Componentes de apresentação recebem dados via props, sem conhecer a origem

### 4. Interface Segregation Principle (ISP)
**Interfaces específicas ao invés de genéricas**

#### Implementação:
- Props de componentes são específicas e focadas
- Exemplo: `CompanySelectorViewProps` tem apenas as props necessárias para renderização
- Hooks retornam objetos com métodos/valores específicos

## Nova Estrutura de Diretórios

```
src/
├── components/
│   ├── features/              # Componentes específicos de domínio
│   │   ├── auth/
│   │   │   ├── guards/        # Route guards (AdminOnly, RequireCompany)
│   │   │   ├── forms/         # Formulários de autenticação
│   │   │   └── ui/            # Componentes UI específicos de auth
│   │   └── company/
│   │       ├── selectors/     # Company selector e variantes
│   │       └── forms/         # Formulários de empresa
│   ├── shared/                # Componentes compartilhados
│   │   ├── feedback/          # Loading, Error, Empty states
│   │   ├── guards/            # Route guards genéricos
│   │   └── forms/             # Form components reutilizáveis
│   ├── layout/                # Componentes de layout
│   └── ui/                    # Componentes base (shadcn)
│
└── lib/
    └── hooks/                 # Hooks customizados organizados
        ├── auth/              # Hooks de autenticação
        ├── data/              # Hooks de dados/API
        └── ui/                # Hooks de UI/UX
```

## Componentes Refatorados

### 1. Componentes de Autenticação (Guards)

#### `AdminOnly`
**Localização**: `src/components/features/auth/guards/admin-only.tsx`

**Responsabilidade**: Verificar se usuário tem role 'admin' e renderizar children ou redirecionar

**Princípios aplicados**:
- **SRP**: Usa `useAuthGuard` para lógica de autenticação
- **DIP**: Depende de hooks abstratos

**Uso**:
```tsx
import { AdminOnly } from '@/components/features/auth/guards'

<AdminOnly fallbackPath="/dashboard">
  <AdminContent />
</AdminOnly>
```

#### `RequireCompany`
**Localização**: `src/components/features/auth/guards/require-company.tsx`

**Responsabilidade**: Garantir que usuários admin tenham empresa selecionada

**Princípios aplicados**:
- **SRP**: Lógica de verificação separada de renderização
- **OCP**: Componente `CompanySelectionPrompt` separado para UI

### 2. Company Selector

#### `CompanySelector` (Container)
**Localização**: `src/components/features/company/selectors/company-selector.tsx`

**Responsabilidade**: Orquestrar dados e renderização

**Princípios aplicados**:
- **SRP**: Usa `useCompanyData` para dados
- **DIP**: Não conhece implementação de API

#### `CompanySelectorView` (Apresentação)
**Localização**: `src/components/features/company/selectors/company-selector-view.tsx`

**Responsabilidade**: Renderizar UI do selector

**Princípios aplicados**:
- **SRP**: Componente puro de apresentação
- **ISP**: Props específicas

#### `EmptyCompanyState`
**Localização**: `src/components/features/company/selectors/empty-company-state.tsx`

**Responsabilidade**: Renderizar estado vazio

**Princípios aplicados**:
- **SRP**: Focado em um único estado

### 3. Componentes Compartilhados

#### `LoadingSpinner`
**Localização**: `src/components/shared/feedback/loading-spinner.tsx`

**Uso**:
```tsx
import { LoadingSpinner } from '@/components/shared/feedback'

<LoadingSpinner size="lg" />
```

#### `LoadingScreen`
**Localização**: `src/components/shared/feedback/loading-screen.tsx`

**Uso**:
```tsx
import { LoadingScreen } from '@/components/shared/feedback'

<LoadingScreen message="Carregando dados..." />
```

#### `ErrorState`
**Localização**: `src/components/shared/feedback/error-state.tsx`

**Uso**:
```tsx
import { ErrorState } from '@/components/shared/feedback'

<ErrorState
  message="Erro ao carregar dados"
  onRetry={handleRetry}
/>
```

## Hooks Customizados

### 1. Hooks de Autenticação

#### `useAuthGuard`
**Localização**: `src/lib/hooks/auth/use-auth-guard.ts`

**Responsabilidade**: Gerenciar lógica de verificação de autenticação

**Retorno**:
```typescript
{
  isChecking: boolean
  isAuthenticated: boolean
  user: User | null
}
```

**Uso**:
```tsx
const { isChecking, isAuthenticated, user } = useAuthGuard({
  redirectTo: '/login',
  requireAuth: true
})
```

### 2. Hooks de Dados

#### `useCompanyData`
**Localização**: `src/lib/hooks/data/use-company-data.ts`

**Responsabilidade**: Buscar e gerenciar dados de empresas

**Retorno**:
```typescript
{
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  error: Error | null
  selectCompany: (company: Company) => void
  refreshCompanies: () => Promise<void>
}
```

### 3. Hooks de UI

#### `useStepNavigation`
**Localização**: `src/lib/hooks/ui/use-step-navigation.ts`

**Responsabilidade**: Gerenciar navegação entre steps

**Uso**:
```tsx
const { currentStep, isLastStep, goToNext, goToPrevious } = useStepNavigation({
  totalSteps: 4,
  onStepChange: (step) => console.log(step)
})
```

#### `useFormMask`
**Localização**: `src/lib/hooks/ui/use-form-mask.ts`

**Responsabilidade**: Aplicar e gerenciar máscaras de input

**Uso**:
```tsx
const phoneInput = useFormMask({
  fieldName: 'phone',
  mask: maskPhone,
  unmask: unmaskPhone,
  watch,
  setValue,
})
```

## Benefícios da Refatoração

### 1. Manutenibilidade
- Componentes menores e focados são mais fáceis de entender e manter
- Responsabilidades claras facilitam localização de bugs

### 2. Testabilidade
- Hooks podem ser testados isoladamente
- Componentes de apresentação são puros e fáceis de testar

### 3. Reutilização
- Componentes compartilhados (`LoadingSpinner`, `ErrorState`) evitam duplicação
- Hooks podem ser usados em múltiplos componentes

### 4. Escalabilidade
- Nova estrutura facilita adição de novos componentes/features
- Separação clara entre lógica e apresentação

### 5. Tipagem
- TypeScript facilita refatoração segura
- Interfaces específicas previnem erros

## Migração de Código Antigo

Os componentes antigos ainda existem em:
- `src/components/auth/admin-only.tsx` → `src/components/features/auth/guards/admin-only.tsx`
- `src/components/auth/require-company.tsx` → `src/components/features/auth/guards/require-company.tsx`
- `src/components/company/company-selector.tsx` → `src/components/features/company/selectors/company-selector.tsx`
- `src/components/register/register-form.tsx` → `src/components/features/auth/forms/register-form.tsx`

**Todos os imports foram atualizados** para usar os novos caminhos.

## Próximos Passos

1. Refatorar outros formulários seguindo o padrão do `RegisterForm`
2. Criar mais componentes compartilhados de feedback
3. Mover componentes de layout para estrutura organizada
4. Adicionar testes unitários para hooks e componentes
5. Documentar padrões de composição de componentes

## Referências

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Component Patterns](https://www.patterns.dev/posts/presentational-container-pattern/)
- [React Hooks Best Practices](https://react.dev/reference/react)
