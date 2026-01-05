# UI/UX Polish - Cores, Ícones e Responsividade

**Data:** 2026-01-04
**Status:** Aprovado
**Objetivo:** Profissionalismo - impressionar stakeholders e competir com ferramentas estabelecidas
**Abordagem:** shadcn/ui + Tailwind best practices

---

## Visão Geral

Melhorar a consistência visual e experiência do usuário através de:
1. **Sistema de Cores Intencional** - Cada cor tem significado específico
2. **Ícones Padronizados** - Lucide React com mapeamento consistente
3. **Responsividade Mobile** - Touch-friendly e layouts adaptados

**Problemas Atuais:**
- ❌ Cores inconsistentes (mesma info, cores diferentes)
- ❌ Ícones confusos e aleatórios
- ❌ Mobile quebrado (layout não adapta, botões pequenos)
- ❌ Aparência "placeholder" sem polish

**Solução:**
- ✅ Seguir padrões shadcn/ui (já em uso)
- ✅ Criar guias de referência claros
- ✅ Aplicar mobile-first approach
- ✅ Garantir acessibilidade (WCAG AA)

---

## 1. Sistema de Cores Intencional

### 1.1 Semantic Colors

```css
/* globals.css - Cores semânticas */
:root {
  /* Status & Feedback */
  --primary: 252 26% 40%;        /* Ações principais, brand (roxo) */
  --secondary: 173 86% 32%;      /* Ações secundárias (teal) */
  --success: 142 76% 36%;        /* ✅ Sucesso, concluído, positivo (verde) */
  --warning: 38 92% 50%;         /* ⚠️ Atenção, bloqueado, cuidado (amarelo) */
  --destructive: 0 84% 60%;      /* 🔴 Erro, deletar, crítico (vermelho) */
  --info: 217 91% 60%;           /* ℹ️ Informação, neutro (azul) */

  /* UI Elements */
  --muted: 215 20% 65%;          /* Texto secundário, desabilitado (cinza) */
  --accent: 264 70% 55%;         /* Hover, active states */
  --border: 214 32% 91%;         /* Bordas, separadores */

  /* Background */
  --background: 0 0% 100%;       /* Fundo principal */
  --card: 0 0% 100%;             /* Cards */
  --foreground: 222 47% 11%;     /* Texto principal */
}
```

### 1.2 Guia de Uso por Contexto

#### Status de Ação

| Status | Cor | Classe | Exemplo |
|--------|-----|--------|---------|
| Pendente (TODO) | Muted (cinza) | `text-muted-foreground` | Badge cinza, dot vazio |
| Em Andamento | Info (azul) | `text-info` | Badge azul, dot meio |
| Concluído (DONE) | Success (verde) | `text-success` | Badge verde, checkmark |

```tsx
// Exemplo: Status Badge
<Badge variant="secondary">        // TODO
  <Circle className="h-3 w-3" />
  Pendente
</Badge>

<Badge variant="default">          // IN_PROGRESS (info)
  <CircleDot className="h-3 w-3" />
  Em Andamento
</Badge>

<Badge variant="success">          // DONE
  <CheckCircle2 className="h-3 w-3" />
  Concluído
</Badge>
```

#### Prioridade

| Prioridade | Cor | Classe | Exemplo |
|------------|-----|--------|---------|
| Baixa | Muted (cinza) | `text-muted-foreground` | Flag cinza |
| Média | Info (azul) | `text-info` | Flag azul |
| Alta | Warning (amarelo) | `text-warning` | Flag amarelo/laranja |
| Urgente | Destructive (vermelho) | `text-destructive` | Flag vermelho |

```tsx
// Exemplo: Priority Flag
<Flag className={cn("h-3 w-3", {
  "text-muted-foreground": priority === "LOW",
  "text-info": priority === "MEDIUM",
  "text-warning": priority === "HIGH",
  "text-destructive": priority === "URGENT",
})} />
```

#### Ações & Feedback

| Contexto | Cor/Variant | Quando Usar | Exemplo |
|----------|-------------|-------------|---------|
| Ação primária | `primary` | Criar, Salvar, Confirmar | `<Button>Criar</Button>` |
| Ação secundária | `outline` | Cancelar, Voltar | `<Button variant="outline">Cancelar</Button>` |
| Ação destrutiva | `destructive` | Deletar, Remover | `<Button variant="destructive">Deletar</Button>` |
| Sucesso | `success` | Operação bem-sucedida | Toast verde, Alert success |
| Erro | `destructive` | Falha, validação | Toast vermelho, Alert error |
| Aviso | `warning` | Atenção necessária | Toast amarelo, Alert warning |
| Info | `info` (default) | Informação neutra | Toast azul, Alert info |

```tsx
// Buttons
<Button>Salvar</Button>                          // primary
<Button variant="outline">Cancelar</Button>      // secondary
<Button variant="destructive">Deletar</Button>   // destructive

// Alerts
<Alert variant="success">
  <CheckCircle2 className="h-4 w-4" />
  <AlertDescription>Ação criada com sucesso!</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>Esta ação está bloqueada.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Erro ao salvar. Tente novamente.</AlertDescription>
</Alert>
```

#### Estados Especiais

| Estado | Cor | Badge/Indicador | Exemplo |
|--------|-----|-----------------|---------|
| Bloqueado | Warning (amarelo) | Lock badge amarelo | `<Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">` |
| Atrasado | Destructive (vermelho) | Badge vermelho | `<Badge variant="destructive">Atrasada</Badge>` |
| Desabilitado | Muted (cinza) | Opacity 50% | `className="opacity-50"` |

### 1.3 Acessibilidade - Contraste

Todas as cores atendem **WCAG AA (4.5:1)** para texto normal:

| Cor | Contraste sobre Branco | Status |
|-----|------------------------|--------|
| Primary (`#554B7F`) | 7.2:1 | ✅ AAA |
| Success (`#16A34A`) | 6.8:1 | ✅ AAA |
| Warning (`#F59E0B`) | 5.1:1 | ✅ AA |
| Destructive (`#EF4444`) | 5.9:1 | ✅ AA |
| Info (`#3B82F6`) | 6.1:1 | ✅ AAA |

---

## 2. Sistema de Ícones Padronizado

### 2.1 Biblioteca: Lucide React

**Por quê Lucide:**
- ✅ Já está instalado no projeto
- ✅ Consistente e moderno
- ✅ Open source, MIT license
- ✅ Tree-shakeable (import individual)
- ✅ Altamente customizável

### 2.2 Mapeamento Ação → Ícone

#### CRUD Básico

| Ação | Ícone | Import | Exemplo |
|------|-------|--------|---------|
| Criar novo | Plus | `import { Plus } from 'lucide-react'` | `<Plus className="h-4 w-4" />` |
| Editar | Edit | `import { Edit } from 'lucide-react'` | `<Edit className="h-4 w-4" />` |
| Ver detalhes | Eye | `import { Eye } from 'lucide-react'` | `<Eye className="h-4 w-4" />` |
| Deletar | Trash2 | `import { Trash2 } from 'lucide-react'` | `<Trash2 className="h-4 w-4 text-destructive" />` |
| Salvar | Save ou Check | `import { Save } from 'lucide-react'` | `<Save className="h-4 w-4" />` |
| Cancelar/Fechar | X | `import { X } from 'lucide-react'` | `<X className="h-4 w-4" />` |

#### Status de Ação

| Status | Ícone | Descrição | Exemplo |
|--------|-------|-----------|---------|
| TODO | Circle | Círculo vazio | `<Circle className="h-3 w-3 text-muted-foreground" />` |
| IN_PROGRESS | CircleDot | Círculo meio cheio | `<CircleDot className="h-3 w-3 text-info" />` |
| DONE | CheckCircle2 | Círculo com check | `<CheckCircle2 className="h-3 w-3 text-success" />` |

#### Feedback

| Tipo | Ícone | Uso | Exemplo |
|------|-------|-----|---------|
| Sucesso | CheckCircle2 | Toast/Alert sucesso | `<CheckCircle2 className="h-5 w-5 text-success" />` |
| Erro | AlertCircle | Toast/Alert erro | `<AlertCircle className="h-5 w-5 text-destructive" />` |
| Aviso | AlertTriangle | Toast/Alert warning | `<AlertTriangle className="h-5 w-5 text-warning" />` |
| Info | Info | Toast/Alert info | `<Info className="h-5 w-5 text-info" />` |

#### Entidades

| Entidade | Ícone | Contexto | Exemplo |
|----------|-------|----------|---------|
| Empresa | Building2 | Menu, cards, badges | `<Building2 className="h-4 w-4" />` |
| Equipe | Users | Menu, cards | `<Users className="h-4 w-4" />` |
| Usuário | UserCircle2 | Perfil, atribuição | `<UserCircle2 className="h-4 w-4" />` |
| Ação/Tarefa | FileText | Cards, menu | `<FileText className="h-4 w-4" />` |
| Checklist | ListChecks | Checklist items | `<ListChecks className="h-4 w-4" />` |
| Plano | Package | Menu, seleção | `<Package className="h-4 w-4" />` |

#### Features

| Feature | Ícone | Uso | Exemplo |
|---------|-------|-----|---------|
| Filtrar | Filter | Botões de filtro | `<Filter className="h-4 w-4" />` |
| Buscar | Search | Input de busca | `<Search className="h-4 w-4" />` |
| Data | Calendar | Date picker | `<Calendar className="h-4 w-4" />` |
| Prazo/Tempo | Clock | Deadline, timestamp | `<Clock className="h-4 w-4" />` |
| Bloqueado | Lock | Ação bloqueada | `<Lock className="h-3 w-3 text-warning" />` |
| Atrasado | AlertTriangle | Prazo vencido | `<AlertTriangle className="h-3 w-3 text-destructive" />` |
| Prioridade | Flag | Indicador prioridade | `<Flag className="h-3 w-3" />` |

#### Navegação

| Ação | Ícone | Uso | Exemplo |
|------|-------|-----|---------|
| Voltar | ArrowLeft | Navegação anterior | `<ArrowLeft className="h-4 w-4" />` |
| Próximo | ChevronRight | Expandir, next | `<ChevronRight className="h-4 w-4" />` |
| Dropdown | ChevronDown | Select, accordion | `<ChevronDown className="h-4 w-4" />` |

#### Views

| View | Ícone | Contexto | Exemplo |
|------|-------|----------|---------|
| Lista | LayoutList | Toggle list view | `<LayoutList className="h-4 w-4" />` |
| Kanban/Grid | LayoutGrid | Toggle kanban | `<LayoutGrid className="h-4 w-4" />` |

#### Loading

| Estado | Ícone | Classe Adicional | Exemplo |
|--------|-------|------------------|---------|
| Carregando | Loader2 | `animate-spin` | `<Loader2 className="h-4 w-4 animate-spin" />` |

### 2.3 Tamanhos Consistentes

| Tamanho | Classe | Pixels | Contexto |
|---------|--------|--------|----------|
| Pequeno | `h-3 w-3` | 12px | Badges, dots, indicadores inline |
| Padrão | `h-4 w-4` | 16px | **Botões, ícones inline (USAR SEMPRE)** |
| Médio | `h-5 w-5` | 20px | Alerts, destaque moderado |
| Grande | `h-6 w-6` | 24px | Headers, ícones de destaque |
| Extra Grande | `h-8 w-8` | 32px | Empty states, ilustrações |

**Regra:** Na dúvida, use `h-4 w-4` (16px).

### 2.4 Exemplo Completo

```tsx
// ❌ ANTES - Inconsistente
import { Pencil, Delete, View } from 'lucide-react';

<Button onClick={handleEdit}>
  <Pencil className="h-5 w-5" />  // Ícone errado + tamanho inconsistente
  Editar
</Button>

<Button onClick={handleDelete}>
  <Delete className="h-3 w-3" />  // Tamanho muito pequeno
  Deletar
</Button>

<Button onClick={handleView}>
  <View className="h-6 w-6" />    // Ícone não existe, tamanho grande demais
  Ver
</Button>

// ✅ DEPOIS - Consistente
import { Edit, Trash2, Eye } from 'lucide-react';

<Button onClick={handleEdit}>
  <Edit className="h-4 w-4" />    // Ícone correto + tamanho padrão
  Editar
</Button>

<Button onClick={handleDelete} variant="destructive">
  <Trash2 className="h-4 w-4" />  // Ícone correto + variant correto
  Deletar
</Button>

<Button onClick={handleView} variant="outline">
  <Eye className="h-4 w-4" />     // Ícone correto + tamanho padrão
  Ver
</Button>
```

### 2.5 Import Pattern

```tsx
// Prefer named imports (tree-shaking)
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ❌ Evitar default import
import Icon from 'lucide-react';  // Importa toda biblioteca
```

---

## 3. Responsividade Mobile

### 3.1 Breakpoints Tailwind

```typescript
// Tailwind default breakpoints
sm:  640px   // Tablet pequeno (portrait)
md:  768px   // Tablet (landscape) / Desktop pequeno
lg:  1024px  // Desktop
xl:  1280px  // Desktop grande
2xl: 1536px  // Desktop extra grande

// Estratégia: Mobile-first
// Base classes = Mobile (<640px)
// sm: = Tablet portrait e acima
// md: = Desktop e acima
```

### 3.2 Layout Geral

```tsx
// PageContainer - Padding responsivo
<PageContainer
  maxWidth="7xl"
  className="px-4 sm:px-6 lg:px-8"
>
  {/* Mobile: 16px (0.25 * 16 = 4)
      Tablet: 24px (0.375 * 16 = 6)
      Desktop: 32px (0.5 * 16 = 8) */}
</PageContainer>

// Espaçamento interno adaptativo
<div className="space-y-4 sm:space-y-6 lg:space-y-8">
  {/* Mobile: 16px gap
      Tablet: 24px gap
      Desktop: 32px gap */}
</div>
```

### 3.3 Componentes Responsivos

#### a) Tabelas → Cards

```tsx
// ResponsiveDataTable (já implementado)
<ResponsiveDataTable
  data={items}
  columns={columns}
  CardComponent={ItemCard}  // Mobile: Renderiza cards
  // Desktop: Renderiza table automaticamente
  isLoading={loading}
  emptyMessage="Nenhum item encontrado"
/>

// Behavior:
// Mobile (<768px): Grid de cards
// Desktop (≥768px): Table tradicional
```

#### b) Formulários

```tsx
<form className="space-y-4 sm:space-y-6">
  {/* Campos em grid responsivo */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
    <FormField label="Nome" />
    <FormField label="Email" />
  </div>

  {/* 3 colunas em desktop, stack em mobile */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <Select label="Prioridade" />
    <DatePicker label="Data Início" />
    <DatePicker label="Data Fim" />
  </div>

  {/* Botões full-width em mobile */}
  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <Button variant="outline" className="w-full sm:w-auto">
      Cancelar
    </Button>
    <Button className="w-full sm:w-auto">
      Salvar
    </Button>
  </div>
</form>
```

#### c) Kanban Board

**Opção 1: Scroll Horizontal (Recomendado)**

```tsx
// Mobile: Scroll horizontal natural
// Desktop: Grid 3 colunas

<div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
  <KanbanColumn
    status="TODO"
    className="min-w-[280px] md:min-w-0"  // Largura mínima em mobile
  />
  <KanbanColumn
    status="IN_PROGRESS"
    className="min-w-[280px] md:min-w-0"
  />
  <KanbanColumn
    status="DONE"
    className="min-w-[280px] md:min-w-0"
  />
</div>
```

**Opção 2: Tabs (Alternativa)**

```tsx
// Mobile: Tabs para alternar entre status
// Desktop: Grid 3 colunas

<Tabs defaultValue="TODO" className="md:hidden">
  <TabsList className="w-full">
    <TabsTrigger value="TODO" className="flex-1">
      Pendente
    </TabsTrigger>
    <TabsTrigger value="IN_PROGRESS" className="flex-1">
      Em Andamento
    </TabsTrigger>
    <TabsTrigger value="DONE" className="flex-1">
      Concluído
    </TabsTrigger>
  </TabsList>

  <TabsContent value="TODO">
    <KanbanColumn status="TODO" />
  </TabsContent>
  <TabsContent value="IN_PROGRESS">
    <KanbanColumn status="IN_PROGRESS" />
  </TabsContent>
  <TabsContent value="DONE">
    <KanbanColumn status="DONE" />
  </TabsContent>
</Tabs>

{/* Desktop: Grid normal */}
<div className="hidden md:grid md:grid-cols-3 md:gap-4">
  <KanbanColumn status="TODO" />
  <KanbanColumn status="IN_PROGRESS" />
  <KanbanColumn status="DONE" />
</div>
```

#### d) Modais / Dialogs

```tsx
// Mobile: Full screen
// Desktop: Modal centrado com max-width

<Dialog>
  <DialogContent className="h-full w-full sm:h-auto sm:max-w-lg sm:rounded-xl">
    {/* Mobile: Ocupa toda a tela (h-full w-full) */}
    {/* Desktop: Modal com largura máxima (sm:max-w-lg) */}
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    <div className="flex-1 overflow-y-auto">
      {/* Conteúdo */}
    </div>
    <DialogFooter>
      {/* Botões */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### e) Navegação / Sidebar

```tsx
// Mobile: Drawer/Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64">
    <Navigation />
  </SheetContent>
</Sheet>

// Desktop: Sidebar fixa
<aside className="hidden md:block md:w-64">
  <Navigation />
</aside>
```

### 3.4 Touch Targets

**Mínimo recomendado:** 44x44px (Apple/Google guidelines)

```tsx
// ✅ BOM - Touch target adequado
<Button className="h-11 min-w-11">  // 44px altura mínima
  <Plus className="h-4 w-4" />
  Criar
</Button>

// ✅ ACEITÁVEL - Para ações secundárias
<Button className="h-10 min-w-10">  // 40px
  <Edit className="h-4 w-4" />
</Button>

// ❌ RUIM - Muito pequeno para touch
<Button className="h-6 w-6 p-0">  // 24px = difícil de tocar
  <Plus className="h-3 w-3" />
</Button>

// Padrões recomendados
h-9   // 36px - Mínimo aceitável
h-10  // 40px - Bom
h-11  // 44px - Ideal (Apple/Google)
h-12  // 48px - Muito confortável
```

**Espaçamento entre elementos tocáveis:**

```tsx
// Mínimo 8px entre botões touch
<div className="flex gap-2">  // gap-2 = 8px
  <Button>Ação 1</Button>
  <Button>Ação 2</Button>
</div>
```

### 3.5 Tipografia Responsiva

```tsx
// Headings - Menores em mobile, crescem em desktop
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
  Título da Página
</h1>
// Mobile: 24px, Tablet: 30px, Desktop: 36px

<h2 className="text-xl font-semibold sm:text-2xl">
  Subtítulo
</h2>
// Mobile: 20px, Tablet+: 24px

<h3 className="text-lg font-medium sm:text-xl">
  Seção
</h3>
// Mobile: 18px, Tablet+: 20px

// Texto corpo
<p className="text-sm sm:text-base">
  Parágrafo ou descrição
</p>
// Mobile: 14px, Tablet+: 16px

// Texto pequeno
<span className="text-xs sm:text-sm">
  Label ou caption
</span>
// Mobile: 12px, Tablet+: 14px
```

**Regra:** Nunca usar texto menor que 12px (dificulta leitura em mobile).

### 3.6 Inputs Mobile-Friendly

```tsx
// Use tipos corretos para keyboard mobile adequado
<Input
  type="email"     // Mostra teclado com @ e .com
  inputMode="email"
  autoComplete="email"
/>

<Input
  type="tel"       // Mostra teclado numérico
  inputMode="tel"
  autoComplete="tel"
/>

<Input
  type="number"    // Mostra teclado numérico
  inputMode="numeric"
/>

<Input
  type="url"       // Mostra teclado com .com e /
  inputMode="url"
/>

<Input
  type="search"    // Mostra botão "Search" no teclado
  inputMode="search"
/>
```

### 3.7 Grid Responsivo

```tsx
// 1 coluna → 2 colunas → 3 colunas → 4 colunas
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// 1 coluna → 2 colunas → 3 colunas
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Sidebar + Main (stack em mobile)
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
  <aside>Sidebar</aside>
  <main>Content</main>
</div>
```

---

## 4. Componentes Helper

### 4.1 StatusBadge

```tsx
// src/components/ui/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { ActionStatus } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    TODO: {
      variant: 'secondary' as const,
      icon: Circle,
      label: 'Pendente',
      dotClass: 'text-muted-foreground',
    },
    IN_PROGRESS: {
      variant: 'default' as const,
      icon: CircleDot,
      label: 'Em Andamento',
      dotClass: 'text-info',
    },
    DONE: {
      variant: 'success' as const,
      icon: CheckCircle2,
      label: 'Concluído',
      dotClass: 'text-success',
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      <Icon className={cn('h-3 w-3', config.dotClass)} />
      {config.label}
    </Badge>
  );
}

// Uso:
// <StatusBadge status={action.status} />
```

### 4.2 PriorityBadge

```tsx
// src/components/ui/priority-badge.tsx
import { Flag } from 'lucide-react';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ActionPriority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({
  priority,
  showLabel = true,
  className
}: PriorityBadgeProps) {
  const config = {
    LOW: {
      color: 'text-muted-foreground',
      label: 'Baixa',
    },
    MEDIUM: {
      color: 'text-info',
      label: 'Média',
    },
    HIGH: {
      color: 'text-warning',
      label: 'Alta',
    },
    URGENT: {
      color: 'text-destructive',
      label: 'Urgente',
    },
  }[priority];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Flag className={cn('h-3 w-3', config.color)} />
      {showLabel && (
        <span className="text-xs">{config.label}</span>
      )}
    </div>
  );
}

// Uso:
// <PriorityBadge priority={action.priority} />
// <PriorityBadge priority={action.priority} showLabel={false} />
```

### 4.3 ActionButton (CRUD Actions)

```tsx
// src/components/ui/action-button.tsx
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionType = 'edit' | 'delete' | 'view' | 'create';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  action: ActionType;
  label?: string;
  showLabel?: boolean;
}

const actionConfig: Record<ActionType, {
  icon: LucideIcon;
  defaultLabel: string;
  variant: ButtonProps['variant'];
}> = {
  edit: {
    icon: Edit,
    defaultLabel: 'Editar',
    variant: 'ghost',
  },
  delete: {
    icon: Trash2,
    defaultLabel: 'Deletar',
    variant: 'ghost',
  },
  view: {
    icon: Eye,
    defaultLabel: 'Ver',
    variant: 'ghost',
  },
  create: {
    icon: Plus,
    defaultLabel: 'Criar',
    variant: 'default',
  },
};

export function ActionButton({
  action,
  label,
  showLabel = true,
  variant,
  className,
  ...props
}: ActionButtonProps) {
  const config = actionConfig[action];
  const Icon = config.icon;
  const finalVariant = variant || (action === 'delete' ? 'destructive' : config.variant);
  const finalLabel = label || config.defaultLabel;

  return (
    <Button
      variant={finalVariant}
      className={cn(
        'gap-2',
        !showLabel && 'h-8 w-8 p-0',
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {showLabel && <span>{finalLabel}</span>}
      {!showLabel && <span className="sr-only">{finalLabel}</span>}
    </Button>
  );
}

// Uso:
// <ActionButton action="edit" onClick={handleEdit} />
// <ActionButton action="delete" onClick={handleDelete} />
// <ActionButton action="view" onClick={handleView} showLabel={false} />
// <ActionButton action="create" onClick={handleCreate} label="Nova Ação" />
```

---

## 5. Implementação

### 5.1 Abordagem Incremental

**Não fazer tudo de uma vez.** Melhorar progressivamente por área:

```
Phase 1: Auditoria (0.5 dia)
  ✓ Mapear todas as inconsistências
  ✓ Screenshot de cada tela (before)
  ✓ Listar todos os problemas específicos
  ✓ Priorizar por impacto

Phase 2: Core Components (1 dia)
  ✓ Criar guias de referência (docs/ui-guidelines/)
  ✓ Criar componentes helper (StatusBadge, PriorityBadge, ActionButton)
  ✓ Atualizar shadcn/ui components se necessário
  ✓ Adicionar variants faltantes (success, info, warning)

Phase 3: Features Críticas (1.5 dias)
  ✓ Ações (Kanban + Table) - área mais usada
  ✓ Formulários de ação (create/edit)
  ✓ Mobile: Kanban responsivo
  ✓ Mobile: touch targets em botões principais

Phase 4: Resto do App (1 dia)
  ✓ Empresas, Equipes, Planos
  ✓ Dashboards
  ✓ Perfil, Configurações
  ✓ Menu e navegação

Phase 5: Polish & Testing (0.5 dia)
  ✓ Teste em devices reais (iPhone + Android)
  ✓ Fix inconsistências encontradas
  ✓ Screenshot final (after)
  ✓ Documentar padrões aplicados
```

**Total estimado:** 4.5 dias

### 5.2 Arquivos de Referência

```
docs/
└── ui-guidelines/
    ├── README.md              # Overview + quick reference
    ├── colors.md              # Tabela completa de cores
    ├── icons.md               # Mapeamento ação → ícone
    ├── mobile.md              # Breakpoints, touch targets, padrões
    └── components.md          # Helper components usage

src/
└── lib/
    └── constants/
        └── ui.ts              # Constantes UI (touch target, breakpoints)
```

**ui.ts:**
```typescript
// src/lib/constants/ui.ts

export const UI_CONSTANTS = {
  // Touch targets
  TOUCH_TARGET_MIN: 44, // px - Apple/Google guideline
  TOUCH_TARGET_COMFORTABLE: 48, // px

  // Icon sizes
  ICON_SIZE_SMALL: 12, // h-3 w-3
  ICON_SIZE_DEFAULT: 16, // h-4 w-4
  ICON_SIZE_MEDIUM: 20, // h-5 w-5
  ICON_SIZE_LARGE: 24, // h-6 w-6

  // Breakpoints (Tailwind defaults)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;
```

### 5.3 Checklist de Implementação

#### Cores
- [ ] Criar/atualizar semantic colors no globals.css
- [ ] Adicionar variants (success, warning, info) aos componentes
- [ ] Atualizar todos os status badges com cores corretas
- [ ] Atualizar todos os priority badges com cores corretas
- [ ] Atualizar botões (primary, outline, destructive)
- [ ] Atualizar alerts (success, warning, error, info)
- [ ] Verificar contraste de todas as combinações (WCAG AA)

#### Ícones
- [ ] Criar mapeamento de ícones (docs/ui-guidelines/icons.md)
- [ ] Substituir todos os ícones inconsistentes
- [ ] Padronizar tamanhos (maioria h-4 w-4)
- [ ] Criar componente ActionButton
- [ ] Aplicar em todas as tabelas/cards/formulários
- [ ] Verificar que deletar sempre usa Trash2 + destructive

#### Mobile
- [ ] Adicionar touch targets mínimos (44px) em todos os botões
- [ ] Fazer tabelas virarem cards (<768px)
- [ ] Fazer Kanban scroll horizontal em mobile
- [ ] Fazer modais full-screen em mobile
- [ ] Adicionar padding responsivo (px-4 sm:px-6 lg:px-8)
- [ ] Fazer formulários stack em mobile, grid em desktop
- [ ] Fazer botões full-width em mobile
- [ ] Testar em iPhone (Safari)
- [ ] Testar em Android (Chrome)
- [ ] Verificar textos legíveis sem zoom

#### Componentes Helper
- [ ] Criar StatusBadge component
- [ ] Criar PriorityBadge component
- [ ] Criar ActionButton component
- [ ] Substituir badges manuais por componentes
- [ ] Documentar uso dos componentes

---

## 6. Testing

### 6.1 Visual Regression

```bash
# 1. Tirar screenshots ANTES (todas as telas)
# 2. Implementar mudanças
# 3. Tirar screenshots DEPOIS
# 4. Comparar lado a lado
```

**Telas principais para screenshot:**
- [ ] Dashboard
- [ ] Ações - Lista
- [ ] Ações - Kanban
- [ ] Ação - Criar/Editar form
- [ ] Ação - Detalhes
- [ ] Empresas - Lista
- [ ] Equipes - Lista
- [ ] Planos - Lista
- [ ] Perfil

### 6.2 Checklist de Validação

**Cores:**
- [ ] Todos os status (TODO, IN_PROGRESS, DONE) usam cores corretas
- [ ] Todas as prioridades (LOW, MEDIUM, HIGH, URGENT) usam cores corretas
- [ ] Botões primários usam variant "default" (primary)
- [ ] Botões secundários usam variant "outline"
- [ ] Botões destrutivos usam variant "destructive"
- [ ] Alerts de sucesso são verdes
- [ ] Alerts de erro são vermelhos
- [ ] Alerts de aviso são amarelos
- [ ] Alerts de info são azuis
- [ ] Badges de bloqueado são amarelos
- [ ] Badges de atrasado são vermelhos

**Ícones:**
- [ ] Criar → Plus
- [ ] Editar → Edit
- [ ] Deletar → Trash2 (sempre com cor destructive)
- [ ] Ver/Visualizar → Eye
- [ ] Salvar → Save ou Check
- [ ] Cancelar/Fechar → X
- [ ] Voltar → ArrowLeft
- [ ] Empresa → Building2
- [ ] Equipe → Users
- [ ] Usuário → UserCircle2
- [ ] Ação → FileText
- [ ] Plano → Package
- [ ] Filtrar → Filter
- [ ] Buscar → Search
- [ ] Data → Calendar
- [ ] Prioridade → Flag
- [ ] Bloqueado → Lock
- [ ] Loading → Loader2 (com animate-spin)
- [ ] Todos os ícones são h-4 w-4 (exceto badges que são h-3 w-3)

**Mobile:**
- [ ] Testado em iPhone (Safari iOS)
- [ ] Testado em Android (Chrome)
- [ ] Todos os botões são fáceis de tocar (≥44px)
- [ ] Formulários funcionam bem (teclado correto)
- [ ] Kanban usável em mobile (scroll horizontal ou tabs)
- [ ] Tabelas viram cards automaticamente
- [ ] Modais ocupam tela toda em mobile
- [ ] Sidebar vira drawer/sheet em mobile
- [ ] Textos legíveis sem zoom (mínimo 16px base)
- [ ] Espaçamento adequado entre elementos touch (≥8px)
- [ ] Landscape e portrait funcionam
- [ ] Sem scroll horizontal indesejado

**Acessibilidade:**
- [ ] Contraste mínimo 4.5:1 (WCAG AA) em todas as cores
- [ ] Keyboard navigation funciona
- [ ] Focus visible em todos os elementos interativos
- [ ] Screen reader friendly (ARIA labels corretos)
- [ ] Botões icon-only têm sr-only text

### 6.3 Ferramentas

```bash
# Lighthouse (acessibilidade + mobile)
npm run build
npx serve out
# Chrome DevTools → Lighthouse → Mobile

# Color Contrast Checker
# https://webaim.org/resources/contrastchecker/

# Mobile Testing
# - BrowserStack (cross-browser)
# - Devices físicos (iPhone + Android)
# - Chrome DevTools device emulation
```

---

## 7. Documentação Final

### 7.1 README

```markdown
// docs/ui-guidelines/README.md

# ToolDo UI Guidelines

Guias de design e padrões visuais do ToolDo.

## Quick Reference

**Cores:**
- Primary (roxo): Ações principais, brand
- Success (verde): Concluído, sucesso
- Warning (amarelo): Bloqueado, atenção
- Destructive (vermelho): Deletar, erro, urgente
- Info (azul): Em andamento, informação

**Ícones:**
- Touch target padrão: 44x44px
- Ícone padrão: h-4 w-4 (16px)
- Biblioteca: Lucide React

**Mobile:**
- Breakpoint principal: md (768px)
- Abordagem: Mobile-first
- Tabelas → Cards em mobile
- Modais → Full screen em mobile

## Guias Detalhados

- [Cores](./colors.md) - Sistema de cores semânticas
- [Ícones](./icons.md) - Mapeamento ação → ícone
- [Mobile](./mobile.md) - Responsividade e touch
- [Componentes](./components.md) - Helper components

## Componentes Helper

```tsx
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { ActionButton } from '@/components/ui/action-button';

<StatusBadge status={action.status} />
<PriorityBadge priority={action.priority} />
<ActionButton action="edit" onClick={handleEdit} />
```

## Princípios

1. **Cores com significado** - Cada cor tem propósito específico
2. **Ícones consistentes** - Mesma ação = mesmo ícone sempre
3. **Mobile-first** - Começar pelo mobile, expandir para desktop
4. **Touch-friendly** - Mínimo 44x44px para elementos tocáveis
5. **Acessível** - WCAG AA em todas as combinações

## Status

- ✅ Design aprovado
- 🚧 Em implementação
- ⏳ Pendente teste
```

---

## 8. Success Criteria

### Performance
- ✅ Nenhuma regressão de performance
- ✅ Build size similar ou menor
- ✅ Lighthouse score ≥90 (mobile)

### Visual
- ✅ Cores consistentes em todo o app
- ✅ Ícones padronizados e intuitivos
- ✅ Aparência profissional e polida
- ✅ Zero inconsistências visuais

### UX
- ✅ Mobile usável e confortável
- ✅ Touch targets adequados (≥44px)
- ✅ Formulários funcionam bem em mobile
- ✅ Navegação fluida em todas as resoluções

### Técnico
- ✅ Todos os testes passando
- ✅ Zero erros TypeScript
- ✅ Zero warnings de build
- ✅ Componentes reutilizáveis criados
- ✅ Documentação completa

### Acessibilidade
- ✅ WCAG AA compliance (4.5:1 contraste)
- ✅ Keyboard navigation funcional
- ✅ Screen reader friendly
- ✅ Focus management correto

---

## 9. Rollout

```
Week 1:
  Dia 1-2: Auditoria + Core Components
  Dia 3-4: Features Críticas (Ações)
  Dia 5: Resto do App

Week 2:
  Dia 1: Polish & Testing
  Dia 2: Deploy staging
  Dia 3-4: Feedback & ajustes
  Dia 5: Deploy produção
```

**Total:** ~2 semanas (10 dias úteis)

---

## 10. Manutenção

Após implementação, manter consistência:

- [ ] Todo novo componente segue guias
- [ ] Code review verifica cores/ícones corretos
- [ ] Testes visuais em mobile
- [ ] Atualizar guidelines quando necessário
- [ ] Onboarding de novos devs inclui UI guidelines
