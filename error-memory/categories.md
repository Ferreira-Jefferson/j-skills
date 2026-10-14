# Categorias de Erros

Referência rápida para classificação de erros. Esta skill é compartilhada por todos os
projetos: **não edite este arquivo para um projeto**. A lista de arquivos que um projeto
usa de fato mora no `INDEX.md` dele.

## Mapa de Categorias → Arquivo

| Categoria | Arquivo | Subcategorias típicas |
|-----------|---------|----------------------|
| `<plataforma>` | `<plataforma>.md` | Uma por plataforma central da stack (ex.: `supabase`, `firebase`, `aws`): CLI, migrations, secrets, link |
| `git` | `git.md` | commit, push, pull, merge, branch, hooks, rebase |
| `deploy` | `deploy.md` | Vercel, Cloud Run, Docker, CI/CD |
| `typescript` | `typescript.md` | tsc, Vite, ESLint, types, imports, build |
| `database` | `database.md` | SQL, PostgreSQL, triggers, functions, constraints, RLS |
| `runtime` | `runtime.md` | Deno, Node.js, Python, import, execution |
| `network` | `network.md` | HTTP, CORS, timeout, fetch, WebSocket, auth |
| `windows` | `windows.md` | WSL, paths, permissions, Device Guard, encoding |
| `tooling` | `tooling.md` | MCP, Playwright, npm, pnpm, CLI tools, packages |
| `other` | `other.md` | Não categorizado |

Crie o arquivo de categoria só no primeiro save que precisar dele.

## Regras de Classificação

1. **Priorize a CAUSA, não o sintoma.**
   - Erro 401 no deploy feito pela CLI da plataforma → `<plataforma>` (não `network`)
   - `EACCES` ao rodar uma CLI no Windows → `windows` (não a CLI)

2. **Na dúvida entre duas categorias, escolha a mais específica.**
   - TypeScript error no build Vite → `typescript`
   - Vite dev server crash → `runtime`

3. **Se toca duas categorias igualmente, use a da causa raiz.**
   - Migration SQL falha por tipo errado → `database`
   - Migration push falha por CLI → `<plataforma>`

## Limites por Arquivo

| Métrica | Limite | Ação |
|---------|--------|------|
| Linhas | > 300 | Dividir por subcategoria |
| Entradas | > 80 | Dividir por subcategoria |

### Como dividir

1. Identifique agrupamentos naturais (ex.: `supabase.md` → `supabase-cli.md` + `supabase-migrations.md`)
2. Crie os novos arquivos com o header de categoria abaixo
3. Mova as entradas (mesmo ID) para os arquivos corretos
4. Atualize a coluna Arquivo de TODAS as linhas afetadas no INDEX.md
5. Delete o arquivo original
6. Rode `python <skill-dir>/scripts/integrity.py`

## Headers

### INDEX

Cabeçalho do `.claude/memory/errors/INDEX.md` ao criar a base:

```markdown
# Error Memory — Índice Mestre

> Auto-gerenciado pela skill `error-memory`. Integridade: `python <skill-dir>/scripts/integrity.py`.

## Como buscar

1. Identifique 2-3 keywords do erro (código, ferramenta, operação).
2. Busque nesta tabela.
3. Abra o arquivo de categoria e **confira o campo Status** antes de aplicar:
   solução `OBSOLETA` não deve ser tentada de novo.

## Índice

| ID | Keywords | Arquivo | Descrição |
|----|----------|---------|-----------|
```

### Arquivo de categoria

```markdown
# Erros Aprendidos — [CATEGORIA]

> Auto-gerenciado pela skill error-memory. Uma entrada por problema; status sempre preenchido.

---
```
