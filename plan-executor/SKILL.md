---
name: plan-executor
description: >
  Executa um plano de implementação já existente com agentes e subagentes em paralelo.
  Mapeia dentro do plano tudo o que pode rodar em paralelo sem colisão, fatia em fases (waves),
  e para cada feature roda o ciclo: plano de ação + prova de conclusão → revisão independente do
  plano (corrigindo o que estiver errado) → execução → code review → commit → feature concluída.
  O peso do processo escala com o risco da feature (tiers T1/T2/T3 e modo enxuto), cada etapa roda
  num agente novo com contexto mínimo (orquestrador → feature-owner → worker), e feature cujo alvo
  ainda pode mudar é adiada até a wave dela abrir.
  Trigger: "implemente o plano X.md", "executa o plano", "implementar plano com agentes em paralelo",
  "rodar o plano em paralelo", "executar plano de implementação", "implementa esse plano".
version: 1.2.0
date: 2026-08-10
user-invocable: true
---

# Plan Executor — Implementação Paralela de Plano

> **Escopo desta skill:** **executar** um plano que já existe. Ela não cria specs nem redesenha o plano — se o plano tem furos, a skill escala ou aplica patch pontual (regra 10 de `rules.md`). Para *criar* o plano, use `spec-creator`.

> **Princípio 1 — paralelismo provado.** Paralelismo só é real quando os agentes não se atrapalham. Antes de qualquer execução, a skill mapeia o plano inteiro e prova, por arquivo e por dependência, o que pode rodar junto.

> **Princípio 2 — processo proporcional.** Cada etapa precisa pagar o próprio custo. Feature mecânica não consome o mesmo aparato que mudança de schema: o tier (regra 5) define quantos agentes ela usa, e o modo enxuto existe para planos inteiramente triviais. O que **nunca** cai: plano de ação antes de código, revisão independente da execução, e prova executada.

> **Princípio 3 — contexto não se acumula.** Cada trabalho novo é um **agente novo** com o contexto inicial mínimo, em cascata: o orquestrador delega ao `feature-owner`, que delega cada etapa a um worker (regra 16). Ninguém herda conversa; passa-se **caminho de arquivo**, nunca conteúdo.

> **Princípio 4 — não planejar sobre areia.** Feature cujo alvo, contrato ou prova ainda pode mudar por causa de algo que roda antes é marcada **ADIADA** e só é planejada quando a wave dela abre; ao fechar cada wave há um **checkpoint** que revalida as premissas das seguintes (regra 17).

Execute fase por fase — leia o arquivo da fase **antes** de iniciá-la. Nunca carregue todos de uma vez.

## Fluxo

```
[INPUT] "implemente o plano <arquivo>.md"
  ↓ [SETUP]  Localiza o plano, define run, materializa agentes
  ↓ [FASE 0] Leitura, estado atual (NO-OPs) & inventário → @.claude/skills/plan-executor/phases/phase-0-inventory.md
  ↓ [FASE 1] Tiers + mapa de paralelismo → EXEC-MAP.md   → @.claude/skills/plan-executor/phases/phase-1-parallel-map.md
  ↓ [FASE 2] Ciclo por feature, wave por wave            → @.claude/skills/plan-executor/phases/phase-2-feature-cycle.md
  │          (abertura da wave: libera o planejamento das features ADIADAS)
  │          feature-owner por feature → delega cada etapa a um worker novo:
  │            1. planner escreve ACTION-PLAN.md + prova + premissas a montante
  │            2. plan-reviewer independente revisa e CORRIGE o plano  ← gate 1 (lote em T1)
  │            3. implementer (agente NOVO) executa o plano liberado
  │            4. code-reviewer independente revisa a execução        ← gate 2 (sempre individual)
  │            5. commit + feature declarada CONCLUÍDA
  │          (fechamento da wave: checkpoint de revalidação das premissas seguintes)
  ↓ [FASE 3] Encerramento: suite global, merges, cleanup, relatório
              → @.claude/skills/plan-executor/phases/phase-3-closeout.md
```

## Identidade do orquestrador

O orquestrador **é a sessão principal** — quem recebeu "implemente o plano X.md". Não é subagente. Ele coordena, gateia e reporta. **Não implementa feature** e **não escreve ACTION-PLAN** por conta própria (só a WAVE 0 de fundação).

**Orçamento de contexto:** o orquestrador carrega o plano original (1×, na FASE 0), o `EXEC-MAP.md` e os *brief reports* dos agentes. **Nunca** carrega diffs, output completo de testes ou código implementado — isso vive no worktree/na saída do agente.

## SETUP (antes da FASE 0)

1. **Localizar o plano.** Usar o caminho dado pelo usuário. Se não existir, procurar por nome em `.claude/plans/`, `.claude/specs/`, `docs/` e raiz — e confirmar o arquivo encontrado com o usuário antes de seguir. Nunca adivinhar entre dois candidatos.
2. Definir `[plan-slug]` (kebab-case, derivado do nome do plano) e `[run-dir]` = `.claude/plan-runs/[plan-slug]/`.
3. Definir `[target-branch]` = branch atual (`git branch --show-current`). Se for `main`/`master`, criar branch de trabalho `plan/[plan-slug]` e usá-la como target.
4. Definir `[max-parallel]` — máximo de feature-agents simultâneos por wave. **Default: 4.** Reduzir para 2 em testes pesados/hardware fraco. Acima de 4 só a pedido explícito.
5. Verificar repositório limpo (`git status --porcelain` vazio). Se houver mudanças pendentes, parar e perguntar ao usuário.
6. Criar `[run-dir]`, `[run-dir]features/` e `[run-dir]agents/`; copiar os 4 templates de agente substituindo placeholders (`[plan-file]`, `[plan-slug]`, `[run-dir]`, `[target-branch]`):
   - `agents/feature-owner.md` → `[run-dir]agents/feature-owner.md`
   - `agents/feature-agent.md` → `[run-dir]agents/feature-agent.md`
   - `agents/plan-reviewer.md` → `[run-dir]agents/plan-reviewer.md`
   - `agents/code-reviewer.md` → `[run-dir]agents/code-reviewer.md`

Os agentes materializados são artefatos da run — vivem com ela e são consumidos pelas waves.

## Tiers e custo de processo

Definidos na FASE 1, registrados no `EXEC-MAP.md` (regra 5 de `rules.md`):

| Tier | Quando | Custo em agentes por feature |
|------|--------|------------------------------|
| **T1** mecânica | ≤2 arquivos, sem lógica nova, sem contrato/schema/dep nova, prova já existe | gate 1 **em lote** (1 revisor por até 4 planos) + gate 2 individual |
| **T2** padrão | o resto | gate 1 + gate 2 individuais |
| **T3** crítica | contrato público, schema/migration, auth, dado de usuário, dinheiro/crédito, remoção de comportamento | gate 1 + gate 2 individuais, RED obrigatório |

**Modo enxuto:** plano com ≤4 features, todas T1 → sem waves, sem worktree, 1 feature-agent sequencial, 1 revisão de planos em lote, 1 code review final do diff completo. Declarado e justificado no `EXEC-MAP.md`. FASE 3 continua obrigatória.

Tier sobe durante a run quando a realidade exige; **nunca desce**.

## Gates

Cada feature passa por **dois gates de agente independente**, nunca por aprovação humana:

| Gate | Agente | Objeto | Veredicto | Rodadas |
|------|--------|--------|-----------|---------|
| 1 | `plan-reviewer` | `ACTION-PLAN.md` (passos + prova de conclusão) | APROVADO / CORRIGIDO / ESCALAR | **passada única** |
| 2 | `code-reviewer` | execução + diff + evidência da prova | APROVADO / REJEITADO / ESCALAR | **máx. 2 tentativas** |

Regras dos gates:
- **Sem gate 1 liberado não se escreve código.** Sem gate 2 aprovado não se faz commit da feature.
- `CORRIGIDO` **é liberação**: o revisor já ajustou o `ACTION-PLAN.md`, o feature-agent re-lê do disco e executa. Não volta para nova revisão.
- 2ª rejeição no gate 2 da mesma feature → escala ao humano automaticamente. Não existe 3ª rodada.
- Humano só é acionado via `ESCALAR`.

## Agentes e cascata de delegação (regra 16)

```
nível 0  ORQUESTRADOR (sessão principal)     waves, veredictos, quadro de progresso
  └ nível 1  feature-owner (1 por feature)   coordena; não planeja, não codifica, não revisa
      └ nível 2  workers (1 por etapa)       planner · plan-reviewer · implementer · code-reviewer · fixer
```

Materializados em `[run-dir]agents/` no SETUP:

- **`feature-owner.md`** — coordenador de UMA feature. Spawna um worker novo por etapa, com briefing de ≤10 linhas contendo **caminhos, não conteúdo**. Nunca escreve plano nem código.
- **`feature-agent.md`** — worker de etapa, invocado em `MODO: PLANO` (planner), `MODO: EXECUÇÃO` (implementer) ou `MODO: CORREÇÃO` (fixer). Cada modo é um **agente novo**: quem planejou não executa, quem foi rejeitado não corrige.
- **`plan-reviewer.md`** — revisor sênior **independente** do plano de ação. Corrige o plano e libera na mesma passada (único revisor que edita artefato). Em T1, revisa em lote.
- **`code-reviewer.md`** — revisor sênior da execução. Aprova/rejeita antes do commit. Sempre individual, em todo tier.

Nível 3 é proibido — worker não spawna worker. Se o runtime não permitir spawn aninhado, o owner emite `DELEGAR: <papel> …` e o orquestrador spawna em nome dele, devolvendo só o veredicto/artefato.

## Planejamento just-in-time (regra 17)

Nem toda feature pode ser planejada no começo da run. Na FASE 1 cada uma é classificada:

- **ESTÁVEL** — nada que roda antes altera o código, o contrato ou o comportamento que ela toca → planejável já.
- **ADIADA** — consome artefato cuja forma ainda pode mudar, depende de decisão a montante, ataca código que a wave anterior vai reescrever, ou tem prova que depende de comportamento que vai mudar → **nenhum agente é spawnado para ela** antes da wave dela abrir.

Todo `ACTION-PLAN.md` declara suas **premissas a montante**. Ao fechar cada wave, o orquestrador confere os desvios reportados contra essas premissas: premissa quebrada → re-planejar (plano descartado, planner novo), re-mapear (refazer disjunção) ou escalar. Nunca executar sobre premissa inválida.

## Referências

- `@.claude/skills/plan-executor/rules.md` — 17 regras críticas, válidas em todas as fases. **Leia antes da FASE 0.**
- `@.claude/skills/plan-executor/gotchas.md` — erros frequentes desta skill.
- `@.claude/skills/plan-executor/templates/exec-map.template.md` — template do `EXEC-MAP.md`.
- `@.claude/skills/plan-executor/templates/action-plan.template.md` — template do `ACTION-PLAN.md` por feature.
