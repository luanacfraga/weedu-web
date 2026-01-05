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

