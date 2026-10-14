# error-memory

Memória persistente de erros e soluções, **por projeto**, para o Claude Code nunca repetir
o mesmo loop de erro duas vezes. Versão 2.0.0.

## Para quê

Sem memória, cada sessão redescobre a mesma solução (ou pior, reaplica a que já parou de
funcionar). A skill mantém em `.claude/memory/errors/` de cada projeto um índice por
keywords e uma entrada por problema, com status explícito: `ATIVA` ou `OBSOLETA`.

## Instalação (uma vez por máquina)

1. Deixe a skill acessível em `~/.claude/skills/error-memory` (cópia ou link para este
   repositório) — assim todos os projetos a enxergam.
2. Adicione o hook ao `~/.claude/settings.json` (bloco completo em
   [auto-trigger-rules.md](auto-trigger-rules.md#configuração-uma-vez-no-settingsjson-do-usuário--vale-para-todos-os-projetos)).
   Não repita o hook nos `settings.json` dos projetos.

A base de cada projeto nasce no primeiro save; nada a configurar por projeto.

## Como funciona

| Momento | O que acontece |
|---|---|
| 2ª falha da mesma operação de shell | O hook `failure_hook.py` injeta o lembrete; o Claude faz **LOOKUP** |
| Solução da base falhou | **FAIL**: a entrada vira `OBSOLETA` na hora, antes de qualquer outra tentativa |
| Resolveu algo que levou 2+ tentativas | **SAVE**: entrada nova (ou atualização da existente) + `integrity.py` |
| Antes de deploy/migration/push | LOOKUP preventivo |

## Comandos

| Comando | Ação |
|---|---|
| `/error-memory` | Status da base |
| `/error-memory lookup <keywords>` | Busca |
| `/error-memory save <categoria> <descrição>` | Registra |
| `/error-memory fail <ERR-NNN> <motivo>` | Marca solução como obsoleta |
| `/error-memory check` | Integridade |

## Conteúdo

| Arquivo | Papel |
|---|---|
| [SKILL.md](SKILL.md) | Workflows e regras (o que o Claude segue) |
| [auto-trigger-rules.md](auto-trigger-rules.md) | Hook, o que conta como "mesma operação", gatilhos |
| [categories.md](categories.md) | Categorias e headers para criar a base |
| [error-entry-template.md](error-entry-template.md) | Formato da entrada e valores de Status |
| `scripts/integrity.py` | Checa a base (IDs, índice, Status, segredos) e dá o próximo ID |
| `scripts/failure_hook.py` | Hook `PostToolUseFailure` que conta falhas por operação |

## Novidades da 2.0

- Workflow **FAIL**: solução que falhou vira `OBSOLETA` na mesma sessão — a base nunca
  devolve uma solução morta como válida.
- Hook que **conta** falhas por operação: silencioso na 1ª falha e em comandos que saem 1
  por design; antes, avisava em todo erro.
- `integrity.py` dentro da skill (antes era copiado em cada projeto), com `--next-id` e
  detecção de credencial colada na base.
- Fingerprint de ambiente e "como saber que voltou a quebrar" obrigatórios na entrada.
