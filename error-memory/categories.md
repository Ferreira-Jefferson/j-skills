# Categorias de Erros

Referência rápida para classificação de erros.

## Mapa de Categorias → Arquivo

| Categoria | Arquivo | Subcategorias típicas |
|-----------|---------|----------------------|
| `supabase` | `supabase.md` | CLI, migrations, deploy, secrets, link/unlink, RLS |
| `git` | `git.md` | commit, push, pull, merge, branch, hooks, rebase |
| `deploy` | `deploy.md` | Vercel, Cloud Run, GCloud, Docker, CI/CD |
| `typescript` | `typescript.md` | tsc, Vite, ESLint, types, imports, build |
| `database` | `database.md` | SQL, PostgreSQL, triggers, functions, constraints |
| `runtime` | `runtime.md` | Deno, Node.js, Python, import, execution |
| `network` | `network.md` | HTTP, CORS, timeout, fetch, WebSocket, auth |
| `windows` | `windows.md` | WSL, paths, permissions, Device Guard, encoding |
| `tooling` | `tooling.md` | MCP, Playwright, npm, pnpm, CLI tools, packages |
| `other` | `other.md` | Não categorizado |

## Regras de Classificação

1. **Priorize a CAUSA, não o sintoma.**
   - Erro 401 no deploy de Edge Function → `supabase` (não `network`)
   - `EACCES` ao rodar supabase no Windows → `windows` (não `supabase`)

2. **Na dúvida entre duas categorias, escolha a mais específica.**
   - TypeScript error no build Vite → `typescript`
   - Vite dev server crash → `runtime`

3. **Se toca duas categorias igualmente, use a da causa raiz.**
   - Migration SQL falha por tipo errado → `database`
   - Migration push falha por CLI → `supabase`

## Limites por Arquivo

| Métrica | Limite | Ação |
|---------|--------|------|
| Linhas | > 300 | Dividir por subcategoria |
| Entradas | > 80 | Dividir por subcategoria |
| Tamanho | > 30KB | Dividir por subcategoria |

### Como dividir

Quando um arquivo exceder os limites:

1. Identifique agrupamentos naturais (ex: `supabase.md` → `supabase-cli.md` + `supabase-migrations.md`)
2. Crie os novos arquivos com header padrão
3. Mova as entradas para os arquivos corretos
4. Atualize TODAS as referências no INDEX.md
5. Delete o arquivo original
6. Atualize esta tabela com os novos arquivos
