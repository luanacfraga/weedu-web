# Hierarchical Action Filters

## Overview

The action board uses hierarchical filters where users first select a **scope** (what actions to see) and then a **responsible** (who to filter by within that scope).

## User Roles

### Admin
- **Scope options:**
  - Toda a empresa (default)
  - Ações sem equipe
  - Individual teams
- **Responsible:** All company users (executors + managers + admins)

### Manager
- **Scope options:**
  - Todas as minhas equipes (default, if >1 team)
  - Individual teams they manage
  - Single team: auto-selected, no filter shown
- **Responsible:** Members of selected team(s)

### Executor
- **Scope:** Fixed to their assigned actions
- **Responsible:** Fixed to themselves
- No filter controls shown

## Technical Details

### State Management
- `scopeType`: ActionScopeFilter enum
- `selectedTeamId`: string | null (when SPECIFIC_TEAM)
- Store automatically resets responsible when scope changes

### API Translation
- Frontend: Hierarchical (scope → responsible)
- Backend: Flat (companyId, teamId, noTeam, responsibleId)
- Translation happens in `build-actions-api-filters.ts`

### Persistence
- Scope and team selections persist across sessions
- Invalid selections (deleted team, lost access) fall back to role defaults
