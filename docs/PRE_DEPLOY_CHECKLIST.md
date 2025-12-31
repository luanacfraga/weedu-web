# ✅ Checklist Pré-Deploy

Use esta lista rápida antes de fazer merge/push para a branch `main`.

## 🛡️ Qualidade do Código

- [ ] **Verificação Completa**: Execute `npm run verify` (roda lint + build).
- [ ] **Lint**: Execute `npm run lint` para verificar estilo de código.
- [ ] **Tipagem**: Execute `npm run typecheck` para garantir que não há erros de TypeScript.
- [ ] **Build Local**: Execute `npm run build` para garantir que o projeto compila sem erros (inclui checagem de tipos).
- [ ] **Limpeza**: Remova `console.log` de debug, códigos comentados e imports não utilizados.

## ⚙️ Configuração e Ambiente

- [ ] **Dependências**: O `package-lock.json` está sincronizado? (Tente rodar `npm ci` localmente para validar).
- [ ] **Variáveis**: Se adicionou novas variáveis de ambiente, elas foram adicionadas no AWS Amplify Console?
- [ ] **API**: A URL da API (`NEXT_PUBLIC_API_URL`) está correta para o ambiente de destino?
- [ ] **Segurança**: Nenhuma chave secreta (API Keys privadas) foi commitada no código?

## 🚀 Funcionalidades Críticas

- [ ] **Login**: O fluxo de autenticação está funcionando?
- [ ] **Navegação**: As rotas principais (Dashboard, Empresas, Ações) abrem sem erro 500/404?
- [ ] **Ações**: O novo fluxo de criação (IA/Manual) e o Kanban estão funcionais?
- [ ] **Estilos**: O layout está responsivo e sem quebras visuais óbvias (teste em mobile)?

---

> **Nota**: Para resolver problemas comuns de deploy, consulte a seção **Troubleshooting** em **[DEPLOY.md](./DEPLOY.md)**.
