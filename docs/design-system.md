# Design System - ToolDo

## Visão Geral

Este documento define as diretrizes de design para garantir consistência visual e semântica em todo o aplicativo ToolDo.

**Princípios:**
- Cores com significado claro e intencional
- Ícones usados apenas quando agregam valor
- Interface limpa e focada
- Consistência em toda a aplicação

---

## 1. Sistema de Cores Semânticas

Cada cor tem um significado específico e deve ser usada consistentemente em todo o app.

### 1.1 Purple (Primary) - Marca e Ações Principais

**HSL:** `252 26% 40%` (light mode), `252 35% 65%` (dark mode)
**Hex:** `#554B7F` (light mode)

**Quando usar:**
- Botões de ação primária
- Links e elementos interativos importantes
- Estados ativos/selecionados (filtros, tabs, menu)
- Logo e elementos de marca
- Hover states de elementos principais

**Quando NÃO usar:**
- Mensagens de sucesso (use green)
- Avisos ou erros (use warning/destructive)
- Texto corrido (use foreground)

**Exemplos:**
```tsx
// ✅ Correto
<Button className="bg-primary">Salvar Ação</Button>
<div className="border-primary bg-primary/10">Filtro Ativo</div>

// ❌ Incorreto
<p className="text-primary">Texto normal de parágrafo</p>
<div className="bg-primary">Mensagem de sucesso</div>
```

### 1.2 Teal (Secondary) - Ações Secundárias

**HSL:** `173 86% 32%` (light mode), `173 80% 40%` (dark mode)
**Hex:** `#0D9488` (light mode)

**Quando usar:**
- Botões de ação secundária
- Informações complementares importantes
- Badges de informação não-primária

**Exemplos:**
```tsx
// ✅ Correto
<Button variant="secondary">Cancelar</Button>
<Badge className="bg-secondary">Info Adicional</Badge>
```

### 1.3 Green (Success) - Sucesso e Conclusão

**HSL:** `142 76% 36%`
**Hex:** `#22C55E`

**Quando usar:**
- Status DONE/CONCLUÍDO
- Mensagens de sucesso ("Ação salva com sucesso")
- Indicadores positivos (checkmarks, progresso completo)
- Ações bem-sucedidas

**Quando NÃO usar:**
- Botões de ação genérica (use primary)
- Informações neutras (use muted)

**Exemplos:**
```tsx
// ✅ Correto
<Badge className="bg-success">Concluído</Badge>
<CheckCircle className="text-success" />
<Alert variant="success">Ação criada com sucesso!</Alert>

// ❌ Incorreto
<Button className="bg-success">Criar Nova Ação</Button>
```

### 1.4 Red (Destructive) - Perigo e Erros

**HSL:** `0 84% 60%`

**Quando usar:**
- Botões de ações destrutivas (deletar, remover)
- Mensagens de erro
- Status de ações bloqueadas
- Avisos críticos
- Indicadores de atraso (isLate)

**Exemplos:**
```tsx
// ✅ Correto
<Button variant="destructive">Deletar Ação</Button>
<Badge className="bg-destructive">Bloqueado</Badge>
<Alert variant="destructive">Erro ao salvar</Alert>

// ❌ Incorreto
<Badge className="bg-destructive">Em Progresso</Badge>
```

### 1.5 Yellow/Orange (Warning) - Atenção e Alertas

**HSL:** `38 92% 50%`

**Quando usar:**
- Prioridade URGENT
- Avisos importantes mas não críticos
- Estados que requerem atenção

**Exemplos:**
```tsx
// ✅ Correto
<Badge className="bg-warning">Urgente</Badge>
<Alert variant="warning">Prazo se aproximando</Alert>

// ❌ Incorreto
<Button className="bg-warning">Salvar</Button>
```

### 1.6 Blue (Info) - Informação Neutra

**HSL:** `217 91% 60%`

**Quando usar:**
- Status IN_PROGRESS
- Status TODO
- Dicas e informações neutras
- Estados intermediários

**Exemplos:**
```tsx
// ✅ Correto
<Badge className="bg-info">Em Progresso</Badge>
<Alert variant="info">Dica: Use filtros para encontrar ações</Alert>
```

### 1.7 Gray (Muted) - Elementos Secundários

**HSL:** `264 10% 95%` (light mode), `0 0% 14.9%` (dark mode)

**Quando usar:**
- Texto secundário
- Ícones decorativos ou não-interativos
- Elementos desabilitados
- Informações menos importantes
- Placeholder text

**Exemplos:**
```tsx
// ✅ Correto
<p className="text-muted-foreground">Descrição secundária</p>
<Search className="text-muted-foreground" />
<Button disabled className="bg-muted">Desabilitado</Button>
```

### 1.8 Tabela de Referência Rápida

| Cor | Significado | Exemplos de Uso |
|-----|-------------|-----------------|
| **Purple** | Marca, ação principal | Botões primários, estados ativos, logo |
| **Teal** | Ação secundária | Botões secundários, info complementar |
| **Green** | Sucesso, conclusão | Status DONE, mensagens de sucesso |
| **Red** | Perigo, erro | Deletar, erros, bloqueios, atrasos |
| **Yellow** | Atenção, urgente | Prioridade URGENT, avisos |
| **Blue** | Informação neutra | Status TODO/IN_PROGRESS, dicas |
| **Gray** | Secundário, inativo | Texto secundário, desabilitado |

---

## 2. Diretrizes de Uso de Ícones

**Objetivo:** Reduzir poluição visual usando ícones apenas quando agregam valor real.

### 2.1 Quando USAR Ícones

#### ✅ Navegação Principal
Sidebar e menus principais - ícones ajudam na identificação rápida.

```tsx
// ✅ Correto - Navegação
<MenuItem icon={Home}>Dashboard</MenuItem>
<MenuItem icon={CheckSquare}>Ações</MenuItem>
```

#### ✅ Ações Importantes com Reconhecimento Universal
Deletar, editar, salvar, fechar - conceitos universalmente reconhecidos.

```tsx
// ✅ Correto - Ações universais
<Button><Trash className="h-4 w-4" /> Deletar</Button>
<Button><Pencil className="h-4 w-4" /> Editar</Button>
<IconButton><X className="h-4 w-4" /></IconButton>
```

#### ✅ Estados Visuais e Indicadores
Status, prioridades, notificações - comunicação visual rápida.

```tsx
// ✅ Correto - Estados visuais
<Badge><CheckCircle className="h-3 w-3" /> Concluído</Badge>
<Bell className="h-5 w-5" /> {/* Notificações */}
<Flag className="text-warning" /> {/* Prioridade */}
```

#### ✅ Botões Sem Texto (Espaço Limitado)
Mobile, toolbar compacta, ações em linha.

```tsx
// ✅ Correto - Botões icon-only
<IconButton aria-label="Menu"><Menu /></IconButton>
<IconButton aria-label="Pesquisar"><Search /></IconButton>
```

### 2.2 Quando NÃO Usar Ícones

#### ❌ Botões com Texto Já Claro
Se o texto é óbvio, o ícone é redundante e cria ruído.

```tsx
// ❌ Incorreto - Redundante
<Button><Save className="h-4 w-4" /> Salvar Alterações</Button>
<Button><Plus className="h-4 w-4" /> Adicionar Novo Item</Button>

// ✅ Correto - Texto é suficiente
<Button>Salvar Alterações</Button>
<Button>Adicionar Novo Item</Button>
```

#### ❌ Filtros Simples
Texto é mais rápido de ler que ícone + texto em filtros.

```tsx
// ❌ Incorreto - Poluição visual
<Button><Calendar className="h-4 w-4" /> Data</Button>
<Button><User className="h-4 w-4" /> Responsável</Button>
<Button><Flag className="h-4 w-4" /> Prioridade</Button>

// ✅ Correto - Limpo e direto
<Button>Data</Button>
<Button>Responsável</Button>
<Button>Prioridade</Button>
```

#### ❌ Listas e Conteúdo de Texto
Ícones repetitivos em listas criam ruído visual.

```tsx
// ❌ Incorreto - Repetitivo
{items.map(item => (
  <li><FileText className="h-4 w-4" /> {item.name}</li>
))}

// ✅ Correto - Apenas texto
{items.map(item => (
  <li>{item.name}</li>
))}
```

#### ❌ Decoração Sem Propósito
Nunca use ícone apenas "porque fica bonito".

```tsx
// ❌ Incorreto - Decorativo sem valor
<div className="flex gap-2">
  <Star className="h-4 w-4" />
  <p>Texto qualquer</p>
</div>

// ✅ Correto - Só texto
<p>Texto qualquer</p>
```

### 2.3 Regras de Consistência

#### Mesmo Conceito = Mesmo Ícone

Sempre use o mesmo ícone para o mesmo conceito em todo o app.

| Conceito | Ícone | Biblioteca |
|----------|-------|------------|
| Deletar | `Trash` / `Trash2` | lucide-react |
| Editar | `Pencil` / `Edit` | lucide-react |
| Fechar | `X` | lucide-react |
| Adicionar | `Plus` | lucide-react |
| Pesquisar | `Search` | lucide-react |
| Configurações | `Settings` | lucide-react |
| Usuário | `User` / `UserCircle2` | lucide-react |
| Menu | `Menu` | lucide-react |
| Calendário | `Calendar` | lucide-react |
| Filtro | `Filter` | lucide-react |
| Notificação | `Bell` | lucide-react |
| Sucesso | `CheckCircle` / `CheckCircle2` | lucide-react |
| Erro | `XCircle` / `AlertCircle` | lucide-react |
| Atenção | `AlertTriangle` | lucide-react |
| Info | `Info` | lucide-react |

#### Tamanho Padronizado

Use classes Tailwind consistentes para tamanhos de ícones:

```tsx
// Ícones pequenos (16px) - Texto inline, badges
<Icon className="h-4 w-4" />

// Ícones médios (20px) - Botões padrão, menu
<Icon className="h-5 w-5" />

// Ícones grandes (24px) - Headings, botões grandes
<Icon className="h-6 w-6" />

// Ícones extra grandes (32px+) - Ilustrações, estados vazios
<Icon className="h-8 w-8" />
```

#### Cor Padronizada

```tsx
// Texto normal (não interativo)
<Icon className="text-muted-foreground" />

// Texto ativo (interativo)
<Icon className="text-foreground" />

// Ação/Link
<Icon className="text-primary" />

// Ação destrutiva
<Icon className="text-destructive" />

// Estados semânticos
<Icon className="text-success" />
<Icon className="text-warning" />
<Icon className="text-info" />
```

#### Botão com Ícone + Texto

Quando combinar ícone e texto:
- Ícone sempre à **esquerda** do texto
- Gap de `1.5` ou `2` entre ícone e texto
- Mesmo tamanho de fonte e ícone

```tsx
// ✅ Correto
<Button>
  <Trash className="mr-2 h-4 w-4" />
  Deletar
</Button>

// ❌ Incorreto - Ícone à direita
<Button>
  Deletar
  <Trash className="ml-2 h-4 w-4" />
</Button>

// ❌ Incorreto - Sem espaçamento
<Button>
  <Trash className="h-4 w-4" />Deletar
</Button>
```

### 2.4 Checklist de Revisão de Ícones

Antes de adicionar um ícone, pergunte:

- [ ] Este ícone ajuda o usuário a entender mais rápido?
- [ ] Este ícone é universalmente reconhecido para este conceito?
- [ ] O texto sozinho não seria suficiente?
- [ ] Estou usando o mesmo ícone usado em outros lugares para este conceito?
- [ ] O tamanho e cor estão padronizados?

Se a resposta para qualquer uma das 3 primeiras for "não", **não use o ícone**.

---

## 3. Filtros de Data com Presets

### 3.1 Objetivo

Facilitar filtragem rápida com períodos comuns, mantendo flexibilidade para datas customizadas.

### 3.2 Design da Interface

O botão "Data" na barra de filtros abre um popover com:

#### Estrutura do Popover

```
┌───────────────────────────────┐
│ Presets Rápidos:              │
│ [Esta Semana]                 │
│ [Últimas 2 Semanas]           │
│ [Este Mês]                    │
│ [Últimos 30 Dias]             │
│ ─────────────────────────     │
│ Personalizado:                │
│   Filtrar por:                │
│   ○ Data de Criação           │
│   ○ Data de Início            │
│                               │
│   De: [____/____/____]        │
│   Até: [____/____/____]       │
│                               │
│   [Limpar Filtro]             │
└───────────────────────────────┘
```

### 3.3 Lógica dos Presets

#### Esta Semana
```typescript
// Segunda-feira da semana atual até Domingo
const today = new Date()
const dayOfWeek = today.getDay()
const monday = new Date(today)
monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
monday.setHours(0, 0, 0, 0)

const sunday = new Date(monday)
sunday.setDate(monday.getDate() + 6)
sunday.setHours(23, 59, 59, 999)

return { dateFrom: monday.toISOString(), dateTo: sunday.toISOString() }
```

#### Últimas 2 Semanas
```typescript
// 14 dias atrás até hoje
const today = new Date()
today.setHours(23, 59, 59, 999)

const twoWeeksAgo = new Date(today)
twoWeeksAgo.setDate(today.getDate() - 14)
twoWeeksAgo.setHours(0, 0, 0, 0)

return { dateFrom: twoWeeksAgo.toISOString(), dateTo: today.toISOString() }
```

#### Este Mês
```typescript
// Dia 1 do mês atual até último dia do mês
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
firstDay.setHours(0, 0, 0, 0)

const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
lastDay.setHours(23, 59, 59, 999)

return { dateFrom: firstDay.toISOString(), dateTo: lastDay.toISOString() }
```

#### Últimos 30 Dias
```typescript
// 30 dias atrás até hoje
const today = new Date()
today.setHours(23, 59, 59, 999)

const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)
thirtyDaysAgo.setHours(0, 0, 0, 0)

return { dateFrom: thirtyDaysAgo.toISOString(), dateTo: today.toISOString() }
```

### 3.4 Comportamento

1. **Clicar em preset**:
   - Aplica dateFrom e dateTo automaticamente
   - Fecha o popover
   - Botão "Data" fica destacado (border-primary, bg-primary/10)
   - Badge opcional mostra qual preset está ativo

2. **Seleção personalizada**:
   - Permite escolher dateFilterType (createdAt ou startDate)
   - Inputs de data permitem seleção livre
   - Validação: dateTo não pode ser anterior a dateFrom

3. **Limpar filtro**:
   - Remove dateFrom, dateTo, reseta dateFilterType
   - Botão "Data" volta ao estado normal
   - Badge desaparece

4. **Estados visuais**:
```tsx
// Botão sem filtro ativo
<Button className="border-border/50 bg-background/80">
  Data
</Button>

// Botão com filtro ativo
<Button className="border-primary/60 bg-primary/10 text-primary">
  Data
  <Badge>Esta Semana</Badge>
</Button>
```

### 3.5 Persistência

Salvar no Zustand store (já configurado com persist):

```typescript
interface ActionFiltersState {
  // ... outros filtros
  dateFrom: string | null // ISO string
  dateTo: string | null // ISO string
  dateFilterType: 'createdAt' | 'startDate'
  datePreset?: 'esta-semana' | 'ultimas-2-semanas' | 'este-mes' | 'ultimos-30-dias' | null
}

// Persistir no localStorage
partialize: (state) => ({
  // ... outros
  dateFrom: state.dateFrom,
  dateTo: state.dateTo,
  dateFilterType: state.dateFilterType,
  datePreset: state.datePreset, // Para mostrar badge correto
})
```

### 3.6 Implementação

**Arquivos a modificar:**

1. `/src/components/features/actions/action-list/action-filters.tsx`
   - Adicionar seção de presets no popover
   - Adicionar funções helper para calcular datas
   - Atualizar badge para mostrar preset ativo

2. `/src/lib/stores/action-filters-store.ts`
   - Adicionar campo `datePreset` (opcional)

3. `/src/lib/utils/date-presets.ts` (novo arquivo)
   - Funções reutilizáveis para cálculo de presets

---

## 4. Plano de Implementação

### Fase 1: Documentação ✅
- [x] Criar `docs/design-system.md`
- [ ] Commit: `docs: add design system guidelines`

### Fase 2: Filtros de Ações (Proof of Concept)
- [ ] Adicionar presets de data
- [ ] Revisar cores dos badges (aplicar semântica)
- [ ] Remover ícones desnecessários dos botões de filtro
- [ ] Commit: `feat: add date presets and apply design guidelines to filters`

### Fase 3: Componentes Reutilizáveis
- [ ] Criar `<StatusBadge>` com cores semânticas
- [ ] Criar `<PriorityBadge>` com cores semânticas
- [ ] Criar `<ActionButton>` com regras de ícones
- [ ] Commit: `refactor: create reusable badge and button components`

### Fase 4: Aplicação Gradual
- [ ] Dashboard - aplicar diretrizes
- [ ] Sidebar - aplicar diretrizes
- [ ] Formulários - aplicar diretrizes
- [ ] Tabelas - aplicar diretrizes
- Cada área = 1 commit separado

### Checklist de Revisão (para cada componente)

Antes de marcar como concluído, verificar:

- [ ] Cores seguem significado semântico definido?
- [ ] Ícones são necessários ou apenas decorativos?
- [ ] Tamanhos e espaçamentos estão padronizados?
- [ ] Componente é reutilizável?
- [ ] Código está limpo e bem documentado?

---

## 5. Referências

### Cores (globals.css)

```css
:root {
  --primary: 252 26% 40%;        /* Purple #554B7F */
  --secondary: 173 86% 32%;      /* Teal #0D9488 */
  --success: 142 76% 36%;        /* Green #22C55E */
  --destructive: 0 84% 60%;      /* Red */
  --warning: 38 92% 50%;         /* Yellow/Orange */
  --info: 217 91% 60%;           /* Blue #3b82f6 */
  --muted: 264 10% 95%;          /* Gray */
}
```

### Ícones (lucide-react)

Biblioteca padrão: `lucide-react`

Importação:
```typescript
import { IconName } from 'lucide-react'
```

### Componentes Base (shadcn/ui)

- Button
- Badge
- Popover
- Input
- Select

---

## Manutenção

Este documento deve ser atualizado sempre que:
- Novas cores forem adicionadas ao sistema
- Novos padrões de ícones forem estabelecidos
- Componentes reutilizáveis forem criados
- Regras de uso forem refinadas

**Última atualização:** 2026-01-05
