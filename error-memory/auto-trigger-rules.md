# Regras de Ativação Automática

Quando e como a skill error-memory é ativada sem comando explícito do usuário.

## Mecanismo: hook `PostToolUseFailure` que conta falhas

O gatilho é **sistêmico**, não memória comportamental: o hook roda a cada falha de
shell e decide sozinho se é hora de lembrar o Claude.

```
Bash/PowerShell falha (exit != 0)
  ↓
failure_hook.py recebe o payload (session_id, tool_input.command, is_interrupt)
  ↓
Reduz o comando a uma "operação" (ex.: `supabase db`, `git push`, `python run.py`)
e soma 1 no contador da sessão (arquivo em <tmp>/claude-error-memory/<session>.json)
  ↓
1ª falha da operação → silêncio
2ª+ falha da mesma operação → injeta additionalContext:
  "[error-memory] `<operação>` falhou Nx nesta sessão. ANTES da próxima tentativa:
   Skill(error-memory, "lookup <keywords>")..."
```

Por que contar no hook: a versão anterior injetava o lembrete em **toda** falha, inclusive
`grep` sem match e checagens que saem 1 por design. Lembrete em todo erro vira ruído, e
ruído é ignorado. Também não depende do Claude contar certo.

### Configuração (uma vez, no `settings.json` do usuário — vale para todos os projetos)

`~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUseFailure": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "command": "\"<caminho-absoluto>/python.exe\" \"<home>/.claude/skills/error-memory/scripts/failure_hook.py\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Use o caminho absoluto do Python.** Se o `settings.json` define `env.PATH`, esse PATH
substitui o do hook; sem o Python nele, o comando não acha `python` e o hook falha em
silêncio (nenhum lembrete, nenhum arquivo de contagem). Para conferir: depois de duas
falhas da mesma operação, deve existir `<tmp>/claude-error-memory/<session_id>.json`.

Não repita o bloco no `.claude/settings.json` de cada projeto: os dois rodariam e o
lembrete sairia duplicado. Hook declarado no frontmatter da skill não serve aqui — ele só
é registrado depois que a skill é invocada, e o objetivo é justamente fazê-la ser invocada.

O hook nunca quebra a sessão: payload inválido ou erro interno saem 0 sem saída.

## O que conta como "mesma operação"

O hook usa `programa subcomando` do último trecho encadeado (`cd x && ...` é ignorado;
prefixos `npx`, `sudo`, `env`, `VAR=1` também):

| Comando | Operação |
|---|---|
| `npx supabase db push --linked` | `supabase db` |
| `git push origin main` | `git push` |
| `python a/b/run.py \| head` | `python run.py` |
| `python -m pytest -n auto` | `python pytest` |

**Ignorados** (exit != 0 é resposta, não falha): `grep`, `rg`, `diff`, `cmp`, `test`/`[`,
`find`, `ls`, `git check-ignore|diff|grep|ls-files|rev-parse|merge-base|show-ref`, e
falhas com `is_interrupt`.

O julgamento do Claude continua valendo além do hook: a mesma abordagem tentada por dois
caminhos (instalar um pacote de dois jeitos) ou o mesmo arquivo editado 2x para o mesmo
bug também contam como "falhou 2x".

### O que NÃO conta

- Dois erros diferentes em operações diferentes
- Erro esperado (teste que deve falhar, comando de checagem)

## Gatilhos secundários

### Antes de operação de risco

```
SE (operação é deploy, migration, push ou mudança de schema)
  → LOOKUP com keywords: [operação] + [ambiente]
  → Se há entrada ATIVA para essa combinação: aplique/mostre antes de rodar
```

### Depois de resolver

```
SE (problema resolvido APÓS 2+ tentativas)
E  (solução NÃO estava na base, ou estava OBSOLETA)
ENTÃO: Workflow 2 (SAVE) e informe "Erro salvo na base: ERR-NNN <descrição>"
```

## Ordem de consulta

1. error-memory (mais rápido, mais específico)
2. `.claude/KNOWN_ISSUES.md`, se o projeto tiver (contexto estrutural, escrito por humanos)
3. Nenhum dos dois: resolva e salve no error-memory

## Anti-patterns

1. **Salvar erro trivial** (typo, path errado) ou bug de lógica de negócio.
2. **Consultar na 1ª falha** — tente de novo normalmente; o hook avisa na 2ª.
3. **Ignorar a base quando ela tem a solução.**
4. **Salvar solução não verificada.**
5. **Tentar de novo uma solução OBSOLETA** em vez de seguir para a que a substituiu.
