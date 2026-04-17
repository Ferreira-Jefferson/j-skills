# error-memory

> Memória persistente de erros e suas soluções. **Nunca repita o mesmo erro duas vezes.**

---

## Para quê

Agentes (e humanos) repetem os mesmos erros: tentam o mesmo comando que já falhou semana passada, descobrem de novo que o Supabase no Windows precisa de `--no-verify-jwt`, passam 15 minutos reinventando o workaround do Edge Function 401.

Esta skill mantém uma base de conhecimento estruturada:
- Você falha 2x no mesmo problema → **a skill é consultada automaticamente**
- A solução já existe → aplica e segue
- A solução é nova → quando resolver, **salva** para não repetir

O objetivo é **economia de tokens e tempo** via reuso de conhecimento já descoberto.

---

## Como invocar

### Automático (regra das 2 falhas)
A skill dispara sozinha quando uma operação falha **2 vezes consecutivas**:
- Mesmo comando falhando do mesmo jeito
- Mesma abordagem tentada duas vezes
- Mesmo arquivo editado duas vezes tentando corrigir o mesmo bug

### Manual (comandos do usuário)
- "consultar erros"
- "buscar solução"
- "já resolvemos isso?"
- "error memory"
- "erros conhecidos"
- "learned errors"
- `/error-memory`

---

## Quickstart

### Cenário 1 — Você acabou de falhar duas vezes

```
[tentativa 1]
$ supabase functions deploy my-fn
Error: 401 Unauthorized

[tentativa 2]
$ supabase functions deploy my-fn --verify-jwt
Error: 401 Unauthorized

[skill dispara automaticamente]
```

A skill extrai keywords (`401`, `supabase`, `functions`, `deploy`), busca no [INDEX.md](../../memory/errors/INDEX.md), encontra `ERR-003`, abre [supabase.md](../../memory/errors/supabase.md), mostra:

```
Solução:
$ supabase functions deploy my-fn --no-verify-jwt
```

E atualiza `last_seen` + `times_hit` na entrada.

### Cenário 2 — Você resolveu um problema novo

Se gastou 2+ tentativas e a base **não tinha** a solução, ao resolver:

1. Classifica em uma das 10 categorias (ver [categories.md](categories.md))
2. Cria uma entrada seguindo [error-entry-template.md](error-entry-template.md)
3. Salva no arquivo da categoria (ex: `.claude/memory/errors/supabase.md`)
4. Atualiza o `INDEX.md` com keywords para busca futura

### Cenário 3 — Consulta manual

```
> consultar erros de CORS no deploy

[skill busca keywords "CORS + deploy" no INDEX.md]

Encontrei 2 entradas:
  ERR-012 — Vercel CORS headers não propagam em Edge Functions
  ERR-027 — Cloud Run CORS precisa config explícita em main.ts
```

---

## Estrutura de armazenamento

```
.claude/memory/errors/
├── INDEX.md          # índice mestre — lookup rápido por keywords
├── supabase.md       # CLI, migrations, deploy, secrets, RLS
├── git.md            # commits, branches, push/pull, hooks
├── deploy.md         # Vercel, Cloud Run, GCloud, CI/CD
├── typescript.md     # tsc, Vite, ESLint, types, build
├── database.md       # SQL, PostgreSQL, triggers, policies
├── runtime.md        # Deno, Node, Python, import/execution
├── network.md        # HTTP, CORS, timeouts, fetch, auth
├── windows.md        # WSL, paths, permissions, Device Guard
├── tooling.md        # MCP, Playwright, npm/pnpm
└── other.md          # não categorizado
```

Cada entrada tem:
- **ID sequencial** (ERR-001, ERR-002, ...)
- **Keywords** para busca
- **Sintoma** (mensagem de erro exata)
- **Causa raiz** (por quê aconteceu)
- **Solução** (passo a passo acionável)
- **Contexto** (SO, versões, pré-condições)
- **Severidade** e métricas de uso (`times_hit`, `last_seen`)

---

## Conteúdo da skill

| Arquivo | Para que serve |
|---------|----------------|
| [SKILL.md](SKILL.md) | Manual operacional — workflows LOOKUP/SAVE/MAINTAIN |
| [auto-trigger-rules.md](auto-trigger-rules.md) | Quando disparar automaticamente vs quando não disparar |
| [categories.md](categories.md) | Mapa categoria → arquivo + regras de classificação |
| [error-entry-template.md](error-entry-template.md) | Template de entrada + regras para preencher |

---

## Workflows

### Workflow 1 — LOOKUP (automático após 2 falhas)

```
Falha 2x detectada
  ↓
Extrair 3-5 keywords do erro (código, ferramenta, operação, mensagem)
  ↓
Buscar no INDEX.md
  ↓
Encontrou? → Abrir categoria → Aplicar solução → Atualizar times_hit
Não encontrou? → Continuar resolvendo
```

### Workflow 2 — SAVE (após resolver algo novo)

```
Resolveu um problema que levou 2+ tentativas
  ↓
Problema estava no error-memory? → Sim: pular. Não: continuar
  ↓
Classificar (uma das 10 categorias)
  ↓
Preencher template (keywords, sintoma, causa, solução, contexto)
  ↓
Appendar ao arquivo de categoria
  ↓
Adicionar linha no INDEX.md: | ERR-NNN | keywords | categoria | descrição |
  ↓
Informar: "Erro salvo: ERR-NNN [descrição]"
```

### Workflow 3 — MAINTAIN (housekeeping)

Execute quando:
- Arquivo de categoria > 300 linhas ou > 80 entradas → **dividir por subcategoria**
- Entradas duplicadas → consolidar
- Solução obsoleta → marcar `[DEPRECATED]`, adicionar nova
- Entrada sem uso por >6 meses → mover para seção "Arquivo"

---

## Regras críticas

1. **NUNCA ignore a skill após 2 falhas.** A consulta é obrigatória.
2. **SEMPRE salve erros novos** que levaram 2+ tentativas.
3. **Keywords são a chave.** Use termos técnicos específicos, não genéricos.
4. **Mantenha soluções atualizadas** — se parou de funcionar, atualize.
5. **Um erro = uma entrada.** Não agrupe problemas diferentes.
6. **Prefira soluções completas** — o comando exato, não "rode X".
7. **Contexto importa** — inclua ambiente, versões, pré-condições.

---

## Anti-padrões

- ❌ Salvar erros triviais (typo, path errado)
- ❌ Salvar bug de código do usuário (não é erro de fluxo)
- ❌ Consultar para erros únicos (1ª falha ainda não qualifica)
- ❌ Ignorar a base quando ela tem a solução (defeat o propósito)
- ❌ Salvar soluções não testadas
- ❌ Editar `INDEX.md` manualmente — sempre via workflow

---

## Integração com outros sistemas

### Com `.claude/KNOWN_ISSUES.md`
Complementares, não redundantes:

| `KNOWN_ISSUES.md` | `error-memory` |
|-------------------|----------------|
| Problemas estruturais do projeto | Problemas encontrados na execução |
| Documentado por humanos | Auto-gerenciado pelo agente |
| Abrangente, contexto de projeto | Específico, contexto de fluxo |

**Ordem de consulta recomendada:**
1. error-memory (mais rápido, mais específico)
2. KNOWN_ISSUES.md (contexto de projeto)
3. Não achou? → Resolver e salvar no error-memory

Se um erro é estrutural do projeto (ex: "Device Guard bloqueia X no Windows desta máquina"), ele deve estar em **ambos** — `KNOWN_ISSUES.md` para humanos, `error-memory` para o Claude.

### Com outras skills
- `spec-creator` pode consultar error-memory antes de definir infra/migrations
- `frontend-foundations` pode consultar ao diagnosticar problemas de build/test

---

## Comandos do usuário

| Comando | Ação |
|---------|------|
| `/error-memory` | Abre a skill, mostra status da base |
| "consultar erros de [X]" | Busca no INDEX.md por keywords |
| "mostrar erros de [categoria]" | Lista entradas de uma categoria |
| "limpar base de erros" | Workflow 3 — MAINTAIN |
| "estatísticas de erros" | Contagem por categoria + mais frequentes |

---

## Exemplo de entrada real

```markdown
## [ERR-003] Edge Function deploy retorna 401 sem --no-verify-jwt

| Campo | Valor |
|-------|-------|
| **Keywords** | 401, supabase, functions, deploy, jwt, unauthorized |
| **Categoria** | supabase |
| **Severidade** | high |
| **Primeira vez** | 2026-01-15 |
| **Última vez** | 2026-04-16 |
| **Vezes atingido** | 7 |
| **Tentativas até solução** | 3 |

### Sintoma
```
$ supabase functions deploy my-fn
Error: 401 Unauthorized
```

### Causa raiz
Edge Functions públicas (sem autenticação) precisam da flag `--no-verify-jwt`
explícita. Sem ela, o gateway rejeita a requisição antes de chegar na função.

### Solução
```bash
supabase functions deploy my-fn --no-verify-jwt
```

Para funções que devem ser autenticadas, configure o JWT secret no Supabase:
```bash
supabase secrets set JWT_SECRET=<secret>
```

### Contexto adicional
- Ambiente: Windows 11, Supabase CLI 1.142.2
- Válido para funções deployadas como públicas
- Se a função precisa de auth, não use `--no-verify-jwt` — configure o token
```

---

## Benefícios concretos

| Antes | Depois |
|-------|--------|
| Gasta 15 min redescobrindo solução conhecida | 2 segundos de lookup + aplicação |
| 3 tentativas do mesmo comando errado | Solução correta na 1ª tentativa pós-lookup |
| Conhecimento mora só na cabeça de quem resolveu | Conhecimento persistido em markdown versionado |
| Agentes novos repetem erros antigos | Base compartilhada entre sessões |

O ROI aparece depois das primeiras ~10 entradas — dali, cada falha resolvida via base é um incidente que não precisou ser re-debugado.
