# Sistema de Permissões

Sistema centralizado de gerenciamento de permissões baseado em roles e ações.

## Estrutura

### Roles Disponíveis

- `master` - Acesso total ao sistema, pode gerenciar planos
- `admin` - Pode criar empresas, gerenciar funcionários e equipes
- `manager` - Pode criar equipes e visualizar funcionários
- `executor` - Acesso limitado, apenas visualização
- `consultant` - Acesso muito limitado

### Hierarquia de Roles

```
master (5) > admin (4) > manager (3) > executor (2) > consultant (1)
```

## Uso

### Hook usePermissions

```typescript
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Permission } from '@/lib/permissions'

function MyComponent() {
  const { 
    can,           // Verifica uma permissão específica
    canAny,        // Verifica se tem pelo menos uma das permissões
    canAll,        // Verifica se tem todas as permissões
    isAdmin,       // Helper para verificar role
    isManager,     // Helper para verificar role
    canInviteEmployee, // Helper específico
    canCreateCompany,  // Helper específico
    hasRoleOrHigher,   // Verifica hierarquia
    canManageUser,     // Verifica se pode gerenciar outro usuário
  } = usePermissions()

  // Verificar permissão específica
  if (can(Permission.CREATE_COMPANY)) {
    // Usuário pode criar empresa
  }

  // Verificar múltiplas permissões
  if (canAny([Permission.VIEW_EMPLOYEES, Permission.VIEW_TEAMS])) {
    // Usuário pode ver funcionários OU equipes
  }

  // Verificar todas as permissões
  if (canAll([Permission.CREATE_TEAM, Permission.MANAGE_TEAM_MEMBERS])) {
    // Usuário pode criar equipe E gerenciar membros
  }

  // Verificar hierarquia
  if (hasRoleOrHigher('admin')) {
    // Usuário é admin ou superior (master)
  }

  // Verificar se pode gerenciar outro usuário
  if (canManageUser('executor')) {
    // Pode gerenciar executores
  }
}
```

### Verificação Direta

```typescript
import { hasPermission, Permission } from '@/lib/permissions'

const userRole = 'admin'
if (hasPermission(userRole, Permission.CREATE_COMPANY)) {
  // Admin pode criar empresa
}
```

### Componente com Proteção

```typescript
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Permission } from '@/lib/permissions'

function ProtectedComponent() {
  const { can } = usePermissions()

  if (!can(Permission.VIEW_EMPLOYEES)) {
    return <div>Acesso negado</div>
  }

  return <div>Conteúdo protegido</div>
}
```

## Permissões Disponíveis

### Empresas
- `CREATE_COMPANY` - Criar empresa
- `VIEW_COMPANIES` - Visualizar empresas
- `EDIT_COMPANY` - Editar empresa
- `DELETE_COMPANY` - Deletar empresa
- `SELECT_COMPANY` - Selecionar empresa

### Funcionários
- `INVITE_EMPLOYEE` - Convidar funcionário
- `VIEW_EMPLOYEES` - Visualizar funcionários
- `EDIT_EMPLOYEE` - Editar funcionário
- `DELETE_EMPLOYEE` - Deletar funcionário

### Equipes
- `CREATE_TEAM` - Criar equipe
- `VIEW_TEAMS` - Visualizar equipes
- `EDIT_TEAM` - Editar equipe
- `DELETE_TEAM` - Deletar equipe
- `MANAGE_TEAM_MEMBERS` - Gerenciar membros da equipe

### Planos (Master apenas)
- `CREATE_PLAN` - Criar plano
- `VIEW_PLANS` - Visualizar planos
- `EDIT_PLAN` - Editar plano
- `DELETE_PLAN` - Deletar plano

### Dashboard
- `VIEW_DASHBOARD` - Visualizar dashboard
- `VIEW_ANALYTICS` - Visualizar analytics

## Adicionando Novas Permissões

1. Adicione a nova permissão no enum `Permission` em `permissions.ts`
2. Adicione a permissão ao array `ROLE_PERMISSIONS` para as roles apropriadas
3. Use a permissão nos componentes com `can(Permission.NOVA_PERMISSAO)`

## Exemplo de Migração

**Antes:**
```typescript
if (user?.role === 'admin') {
  // código
}
```

**Depois:**
```typescript
const { isAdmin } = usePermissions()
if (isAdmin) {
  // código
}
```

Ou melhor ainda:
```typescript
const { can } = usePermissions()
if (can(Permission.CREATE_COMPANY)) {
  // código
}
```

