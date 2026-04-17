---
name: error-memory
description: >
  Memória persistente de erros e soluções aprendidos. Evita retry loops desnecessários
  consultando soluções já descobertas antes de tentar novamente.
  Trigger AUTOMÁTICO: após 2 falhas consecutivas na mesma operação.
  Trigger MANUAL: "consultar erros", "buscar solução", "já resolvemos isso?",
  "error memory", "erros conhecidos", "learned errors", "known errors".
version: 1.0.0
date: 2026-04-16
user-invocable: true
---

# Error Memory — Aprendizado Persistente de Erros

Nunca repita o mesmo erro duas vezes. Este skill mantém uma base de conhecimento
de problemas encontrados e suas soluções, organizada por categoria.

## Princípio

```
Falhou 2x no mesmo problema?
  ↓
PARE. Consulte a base de erros aprendidos.
  ↓
Encontrou? → Aplique a solução documentada.
Não encontrou? → Continue resolvendo. Quando resolver, SALVE.
```

## Armazenamento

```
.claude/memory/errors/
├── INDEX.md                 # Índice mestre — lookup rápido por keywords
├── supabase.md              # Supabase CLI, migrations, deploy, secrets
├── git.md                   # Git, branches, commits, push/pull
├── deploy.md                # Vercel, Cloud Run, Edge Functions deploy
├── typescript.md            # TypeScript, build, types, compilation
├── database.md              # SQL, PostgreSQL, RLS, policies, queries
├── runtime.md               # Deno, Node, Python, runtime errors
├── network.md               # HTTP, API, CORS, timeouts, auth
├── windows.md               # Windows-specific, WSL, paths, permissions
├── tooling.md               # MCP, Playwright, CLI tools, packages
└── other.md                 # Não categorizado
```

## Workflow 1: LOOKUP (Automático — após 2 falhas)

Quando uma operação falhar **2 vezes seguidas**, execute este fluxo:

### Passo 1 — Extrair keywords do erro
```
Identifique 3-5 keywords do erro:
- Código de erro (401, ENOENT, TypeError)
- Ferramenta (supabase, git, vercel, npm)
- Operação (deploy, push, migrate, build)
- Mensagem chave (permission denied, not found)
```

### Passo 2 — Buscar no INDEX.md
```
Leia .claude/memory/errors/INDEX.md
Procure as keywords na tabela de índice
```

### Passo 3a — ENCONTROU: Aplicar solução
```
1. Leia o arquivo da categoria indicada no índice
2. Localize a entrada pelo ID do erro
3. Aplique a solução documentada
4. Se a solução não funcionar mais, ATUALIZE a entrada com a nova solução
5. Atualize "last_seen" e "times_hit" na entrada
```

### Passo 3b — NÃO ENCONTROU: Continuar e salvar
```
1. Continue tentando resolver o problema
2. Quando resolver, execute o Workflow 2: SAVE
```

## Workflow 2: SAVE (Após resolver um problema novo)

Quando resolver um problema que exigiu 2+ tentativas e NÃO estava na base:

### Passo 1 — Classificar o erro
```
Determine a categoria usando a tabela abaixo:

| Categoria    | Quando usar                                          |
|-------------|------------------------------------------------------|
| supabase    | CLI, migrations, deploy functions, secrets, link     |
| git         | Commits, branches, merge, push, pull, hooks          |
| deploy      | Vercel, Cloud Run, GCloud, CI/CD                     |
| typescript  | tsc, types, build errors, Vite, ESLint               |
| database    | SQL, PostgreSQL, RLS, policies, triggers, functions   |
| runtime     | Deno, Node.js, Python, import errors, execution       |
| network     | HTTP status, CORS, timeouts, fetch, API calls         |
| windows     | WSL, paths, permissions, Device Guard, line endings   |
| tooling     | MCP servers, Playwright, npm/pnpm, CLI tools          |
| other       | Não se encaixa em nenhuma categoria acima              |
```

### Passo 2 — Criar a entrada no arquivo de categoria

Leia o template em `@.claude/skills/error-memory/error-entry-template.md` e
preencha os campos. Adicione a entrada ao FINAL do arquivo de categoria
correspondente (ex: `.claude/memory/errors/supabase.md`).

Se o arquivo de categoria não existir, crie-o com o header padrão:
```markdown
# Erros Aprendidos — [CATEGORIA]

> Auto-gerenciado pelo skill error-memory. Não edite o INDEX.md manualmente.

---
```

### Passo 3 — Atualizar o INDEX.md

Adicione uma linha na tabela do INDEX.md com o formato:
```
| ERR-NNN | keywords separadas por vírgula | categoria | descrição curta |
```

O ID é sequencial global (ERR-001, ERR-002, ...). Verifique o último ID no INDEX.md
antes de criar um novo.

## Workflow 3: MAINTAIN (Gerenciamento de arquivos)

Execute este workflow quando:
- Um arquivo de categoria ultrapassar **80 entradas** ou **300 linhas**
- O usuário pedir para organizar/limpar a base de erros
- Houver entradas duplicadas ou obsoletas

### Regras de manutenção

1. **Arquivo grande demais (>300 linhas)?**
   - Divida por subcategoria criando arquivos como `supabase-cli.md`, `supabase-migrations.md`
   - Atualize o INDEX.md para apontar para os novos arquivos
   - Delete o arquivo original após a divisão

2. **Entradas duplicadas?**
   - Mantenha a mais completa, remova a outra
   - Atualize o INDEX.md

3. **Solução obsoleta (não funciona mais)?**
   - Marque como `[DEPRECATED]` no título
   - Adicione a nova solução como entrada separada
   - NÃO delete a entrada antiga (serve como histórico)

4. **Entrada nunca mais atingida (>6 meses sem last_seen)?**
   - Mova para uma seção "Arquivo" no final do arquivo de categoria

## Regras Críticas

1. **NUNCA ignore este skill após 2 falhas.** A consulta é obrigatória.
2. **SEMPRE salve erros novos.** Se levou 2+ tentativas, merece ser documentado.
3. **Keywords são a chave.** Use keywords específicas e técnicas no INDEX.md.
4. **Mantenha soluções atualizadas.** Se uma solução parou de funcionar, atualize-a.
5. **Um erro = uma entrada.** Não agrupe problemas diferentes na mesma entrada.
6. **Prefira soluções completas.** Inclua o comando exato, não apenas "rode o comando X".
7. **Contexto importa.** Inclua o ambiente (Windows, WSL, versão) quando relevante.

## Integração com KNOWN_ISSUES.md

O arquivo `.claude/KNOWN_ISSUES.md` já existente no projeto é complementar:
- **KNOWN_ISSUES.md** = problemas do PROJETO (ambiente, infra, ferramentas bloqueadas)
- **error-memory** = problemas do FLUXO DE TRABALHO (erros que o Claude encontra ao executar tarefas)

Se um erro é específico do projeto (ex: "Device Guard bloqueia supabase no Windows"),
ele deve estar em AMBOS: KNOWN_ISSUES.md (para humanos) e error-memory (para o Claude).

## Comandos do Usuário

| Comando | Ação |
|---------|------|
| `/error-memory` | Abre este skill, mostra status da base |
| "consultar erros de [X]" | Busca no INDEX.md por keywords |
| "limpar base de erros" | Executa Workflow 3: MAINTAIN |
| "mostrar erros de [categoria]" | Lista todas entradas de uma categoria |
| "estatísticas de erros" | Conta entradas por categoria, mais frequentes |
