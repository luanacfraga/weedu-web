# Memory Bank - Padrões de Implementação Weedu Web

Este documento define os padrões que devem ser seguidos em TODAS as implementações do projeto Weedu Web para manter consistência e qualidade do código.

## 🚫 REGRAS ABSOLUTAS

### 1. NÃO USAR ARQUIVOS index.ts/index.tsx
**NUNCA** criar arquivos `index.ts` ou `index.tsx` para re-exportações.
- ❌ `components/shared/feedback/index.ts`
- ✅ Import direto: `import { EmptyState } from '@/components/shared/feedback/empty-state'`

### 2. NÃO USAR COMENTÁRIOS NO CÓDIGO
**NUNCA** adicionar comentários no código, incluindo:
- ❌ Comentários inline (`// comentário`)
- ❌ Comentários de bloco (`/* comentário */`)
- ❌ JSDoc (`/** comentário */`)
- ✅ O código deve ser auto-explicativo através de nomes claros

### 3. NÃO USAR console.log/console.error EM PRODUÇÃO
**NUNCA** deixar `console.log` ou `console.error` no código final.
- ❌ `console.log('debug')`
- ❌ `console.error('erro')`
- ✅ Se necessário para debug, usar apenas em desenvolvimento e remover antes do commit

## 📁 ESTRUTURA DE PASTAS

### Componentes
```
src/components/
├── features/              # Componentes específicos de domínio
│   ├── [feature]/        # Ex: auth, plan, company
│   │   ├── guards/       # Route guards (se aplicável)
│   │   ├── forms/        # Formulários da feature
│   │   ├── [feature]-dialog.tsx
│   │   ├── [feature]-form.tsx
│   │   └── [feature]-[variant].tsx
├── shared/               # Componentes compartilhados
│   ├── feedback/         # Loading, Error, Empty states
│   ├── data/            # Cards, Tables, Badges
│   ├── forms/           # Componentes de formulário reutilizáveis
│   └── layout/          # PageContainer, PageHeader
├── layout/              # Layouts principais
│   ├── base-layout.tsx
│   ├── auth-layout.tsx
│   └── dashboard-sidebar.tsx
└── ui/                  # Componentes base (shadcn/ui)
    ├── button.tsx
    ├── input.tsx
    └── ...
```

### Lib
```
src/lib/
├── api/
│   ├── api-client.ts           # Cliente HTTP centralizado
│   └── endpoints/              # Endpoints por domínio
│       ├── plans.ts
│       ├── companies.ts
│       └── ...
├── hooks/
│   ├── auth/                   # Hooks de autenticação
│   ├── data/                   # Hooks de dados/API
│   └── ui/                     # Hooks de UI/UX
├── stores/                     # Stores Zustand
│   ├── auth-store.ts
│   └── company-store.ts
├── validators/                 # Schemas Zod
│   ├── plan.ts
│   ├── company.ts
│   └── ...
└── utils/                      # Funções utilitárias
    └── masks.ts
```

### App (Next.js)
```
src/app/
├── [rota]/
│   └── page.tsx               # Página da rota
├── layout.tsx                 # Layout raiz
└── providers.tsx              # Providers globais
```

## 📝 NOMENCLATURA

### Arquivos e Pastas
- **Componentes**: PascalCase (`PlanForm.tsx`, `CompanyCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`use-plans.ts`, `use-auth.ts`)
- **Stores**: kebab-case com sufixo `-store` (`auth-store.ts`, `company-store.ts`)
- **Validators**: kebab-case (`plan.ts`, `company.ts`)
- **Endpoints**: kebab-case (`plans.ts`, `companies.ts`)
- **Utils**: kebab-case (`masks.ts`, `formatters.ts`)
- **Pastas**: kebab-case (`plan-form/`, `auth-guards/`)

### Componentes
- **Componentes principais**: `[Feature]Form`, `[Feature]Dialog`, `[Feature]Card`
- **Variantes**: `[Feature][Variant]` (ex: `CompanySelectorView`, `EmptyCompanyState`)
- **Guards**: `[Role]Only`, `Require[Condition]` (ex: `AdminOnly`, `RequireCompany`)

### Funções e Variáveis
- **Funções**: camelCase (`handleSubmit`, `fetchPlans`)
- **Constantes**: UPPER_SNAKE_CASE (`PLANS_KEY`, `API_BASE_URL`)
- **Tipos/Interfaces**: PascalCase (`PlanFormData`, `CreatePlanRequest`)

## 🏗️ PADRÕES DE CÓDIGO

### 1. Componentes React

```typescript
'use client'

import { Button } from '@/components/ui/button'
import type { PlanFormData } from '@/lib/validators/plan'

interface PlanFormProps {
  plan?: Plan
  onSubmit: (data: PlanFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PlanForm({ plan, onSubmit, onCancel, isLoading = false }: PlanFormProps) {
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? { ...plan } : getDefaultValues(),
  })

  const handleSubmit = async (data: PlanFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* ... */}
      </form>
    </Form>
  )
}
```

**Regras**:
- Sempre usar `'use client'` quando necessário (hooks, eventos)
- Props tipadas com interface separada
- Valores padrão para props opcionais
- Handlers com prefixo `handle`
- Export nomeado, não default

### 2. Hooks Customizados

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { plansApi, type CreatePlanRequest } from '@/lib/api/endpoints/plans'

const PLANS_KEY = ['plans'] as const

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => plansApi.getAll(),
    select: (data) => data || [],
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY })
    },
  })
}
```

**Regras**:
- Query keys como constantes no topo
- Um hook por arquivo
- Nome do hook: `use[Feature]` ou `use[Action][Feature]`
- Sempre invalidar queries relacionadas após mutations

### 3. API Endpoints

```typescript
import { apiClient } from '../api-client'

export interface Plan {
  id: string
  name: string
  maxCompanies: number
}

export interface CreatePlanRequest {
  name: string
  maxCompanies: number
}

export const plansApi = {
  getAll: () => apiClient.get<Plan[]>('/api/v1/plan'),
  getById: (id: string) => apiClient.get<Plan>(`/api/v1/plan/${id}`),
  create: (data: CreatePlanRequest) => apiClient.post<Plan>('/api/v1/plan', data),
  update: (id: string, data: UpdatePlanRequest) =>
    apiClient.put<Plan>(`/api/v1/plan/${id}`, data),
}
```

**Regras**:
- Um arquivo por domínio
- Interfaces TypeScript para requests/responses
- Objeto com métodos, não classe
- Métodos: `getAll`, `getById`, `create`, `update`, `delete`

### 4. Validators (Zod)

```typescript
import { z } from 'zod'

export const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  maxCompanies: z
    .number({
      required_error: 'Número máximo de empresas é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(1, 'Deve permitir pelo menos 1 empresa'),
})

export type PlanFormData = z.infer<typeof planSchema>
```

**Regras**:
- Um schema por arquivo
- Mensagens de erro em português
- Exportar tipo inferido com sufixo `FormData`
- Validações específicas e claras

### 5. Stores (Zustand)

```typescript
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, token) => {
        Cookies.set(config.cookies.tokenName, token, { ... })
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        Cookies.remove(config.cookies.tokenName)
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

**Regras**:
- Interface de estado no topo
- Actions como métodos no estado
- Usar persist quando necessário
- Nome da store: `use[Feature]Store`

### 6. Páginas

```typescript
'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { usePlans } from '@/lib/services/queries/use-plans'

export default function PlansPage() {
  const { data: plans = [], isLoading, error, refetch } = usePlans()

  if (isLoading) {
    return (
      <AdminOnly>
        <BaseLayout sidebar={<DashboardSidebar />}>
          <LoadingScreen message="Carregando planos..." />
        </BaseLayout>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="7xl">
          <PageHeader title="Planos" description="Gerencie os planos" />
          {/* ... */}
        </PageContainer>
      </BaseLayout>
    </AdminOnly>
  )
}
```

**Regras**:
- Sempre usar guards apropriados
- Sempre usar `BaseLayout` com sidebar
- Sempre usar `PageContainer` e `PageHeader`
- Tratar estados: loading, error, empty, success
- Export default para páginas

## 📦 IMPORTS

### Ordem de Imports
1. React e Next.js
2. Bibliotecas externas (por ordem alfabética)
3. Componentes UI base
4. Componentes compartilhados
5. Componentes de feature
6. Hooks
7. Stores
8. API/Endpoints
9. Validators
10. Utils
11. Types (com `type` keyword)
12. Estilos (se necessário)

### Exemplo
```typescript
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PlanDialog } from '@/components/features/plan/plan-dialog'

import { usePlans } from '@/lib/services/queries/use-plans'
import { useAuthStore } from '@/lib/stores/auth-store'
import { plansApi } from '@/lib/api/endpoints/plans'
import { planSchema, type PlanFormData } from '@/lib/validators/plan'
import { cn } from '@/lib/utils'

import type { Plan } from '@/lib/api/endpoints/plans'
```

## 🎨 COMPONENTES UI

### Estrutura de Componente UI
- Sempre usar shadcn/ui como base
- Props tipadas com interfaces
- Suporte a className via `cn()` utility
- Variantes usando `class-variance-authority` quando aplicável

### Estados de Feedback
- `LoadingScreen`: Tela de loading completa
- `LoadingSpinner`: Spinner inline
- `ErrorState`: Estado de erro com retry
- `EmptyState`: Estado vazio com ação opcional

## 🎨 PADRÕES DE DESIGN E ESTILIZAÇÃO

### Sistema de Cores
**NUNCA** usar cores hardcoded (green-500, red-500, yellow-500, etc.)
- ❌ `bg-green-500`, `text-red-600`, `border-yellow-400`
- ✅ Usar variáveis do sistema: `bg-success`, `text-destructive`, `border-warning`
- ✅ Cores do sistema disponíveis:
  - `primary`, `secondary`, `success`, `warning`, `destructive`, `info`
  - `muted`, `accent`, `card`, `popover`
  - Todas com suporte a `/10`, `/20`, `/50` para opacidade

**Exemplo**:
```typescript
// ❌ ERRADO
<div className="bg-green-100 text-green-800">Ativo</div>

// ✅ CORRETO
<div className="bg-success/10 text-success">Ativo</div>
```

### Espaçamentos
- Padronizar sistema: `4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `24px (6)`, `32px (8)`
- Usar `gap-*` para espaçamento horizontal/vertical
- Usar `space-y-*` para espaçamento vertical entre filhos
- Padding interno: `p-3`, `p-4`, `p-6` (12px, 16px, 24px)
- Margin externo: `mb-4`, `mb-6`, `mb-8` (16px, 24px, 32px)

### Bordas e Sombras
- **Bordas**: Usar opacidade para hierarquia
  - `border-border/20` → elementos muito sutis
  - `border-border/40` → elementos sutis
  - `border-border/60` → elementos médios
  - `border-border` → elementos principais
- **Sombras**: Sistema progressivo
  - `shadow-sm` → elementos básicos (botões, inputs)
  - `shadow-md` → cards e containers
  - `shadow-lg` → modais e overlays
- **Border radius**: `rounded-lg` (8px) padrão, `rounded-xl` (12px) para cards

### Animações e Transições
- **Durações padronizadas**:
  - `duration-150` → interações rápidas (hover, active)
  - `duration-200` → transições padrão
  - `duration-300` → transições mais lentas (cards, modais)
- **Easing**: Usar `transition-all` com easing padrão do Tailwind
- **Hover states**: Sempre adicionar feedback visual
  - `hover:scale-[1.02]` → elementos interativos
  - `hover:shadow-md` → elevação visual
  - `active:scale-[0.97]` → feedback tátil
- **Focus states**: Sempre visíveis para acessibilidade
  - `focus-visible:ring-2 focus-visible:ring-ring/50`

### Gradientes
- Usar gradientes suaves com ponto intermediário (`via`)
- Exemplo: `bg-gradient-to-r from-primary via-primary/95 to-primary/90`
- Hover: reduzir opacidade do `via` para suavizar
- Evitar gradientes muito contrastantes

### Estados de Componentes
- **Hover**: Feedback visual claro mas sutil
- **Focus**: Ring visível com opacidade reduzida (`ring-ring/50`)
- **Active**: Scale reduzido (`scale-[0.97]` ou `scale-[0.98]`)
- **Disabled**: Opacidade reduzida (`opacity-50`) + cursor not-allowed
- **Loading**: Spinner ou skeleton loader

### Backdrop Blur
- Usar `backdrop-blur-sm` para cards e containers
- Usar `backdrop-blur-md` para headers e modais
- Combinar com opacidade: `bg-card/60 backdrop-blur-sm`

### Responsividade
- Mobile-first: estilos base para mobile
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Espaçamentos: reduzir em mobile, aumentar em desktop
- Texto: `text-xs sm:text-sm lg:text-base`
- Padding: `p-3 sm:p-4 lg:p-6`

## 🔐 GUARDS

### Estrutura
```typescript
'use client'

import { useAuthGuard } from '@/lib/hooks/auth/use-auth-guard'

interface AdminOnlyProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function AdminOnly({ children, fallbackPath = '/dashboard' }: AdminOnlyProps) {
  const { isAdmin, isLoading } = useAuthGuard()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAdmin) {
    return <Redirect to={fallbackPath} />
  }

  return <>{children}</>
}
```

**Regras**:
- Sempre usar hooks de guard, não acessar store diretamente
- Sempre mostrar loading durante verificação
- Sempre ter fallback path configurável

## 🧪 TRATAMENTO DE ERROS

### Padrão
```typescript
try {
  await createPlan(data)
} catch (err) {
  if (err instanceof ApiError) {
    const errorData = err.data as { message?: string }
    throw new Error(errorData?.message || 'Erro ao salvar plano')
  }
  throw err
}
```

**Regras**:
- Sempre verificar se é `ApiError`
- Extrair mensagem do erro quando disponível
- Mensagens de erro em português
- Re-throw se não for erro conhecido

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] Nenhum arquivo `index.ts` criado ou usado
- [ ] Nenhum comentário no código
- [ ] Nenhum `console.log` ou `console.error` deixado
- [ ] Imports organizados na ordem correta
- [ ] Nomenclatura seguindo padrões
- [ ] Componentes tipados corretamente
- [ ] Guards aplicados onde necessário
- [ ] Estados de loading/error/empty tratados
- [ ] **Cores usando variáveis do sistema (não hardcoded)**
- [ ] **Animações com durações padronizadas (150ms, 200ms, 300ms)**
- [ ] **Bordas e sombras seguindo hierarquia visual**
- [ ] **Hover e focus states implementados**
- [ ] Código formatado (Prettier)
- [ ] Sem erros de lint (ESLint)

## 📚 REFERÊNCIAS

- Estrutura baseada em: `SOLID_REFACTORING.md`
- Arquitetura: Hexagonal (Ports and Adapters)
- Framework: Next.js 14 (App Router)
- Estado: Zustand + TanStack Query
- Formulários: React Hook Form + Zod
- UI: shadcn/ui + Tailwind CSS

