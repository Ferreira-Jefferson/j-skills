# plan-executor

> Executa um plano de implementação existente com agentes em paralelo. **Paralelismo provado, plano de ação revisado, prova de conclusão que pode falhar — com processo proporcional ao risco.**

---

## Para quê

Você tem um plano (`X.md`) e quer que ele seja implementado por vários agentes ao mesmo tempo. Sem estrutura, isso vira: dois agentes editando o mesmo arquivo, features "prontas" que ninguém provou, e um plano de ação inventado no meio da execução. Com estrutura demais, vira o oposto: 3 agentes e um RED/GREEN para trocar uma constante.

Esta skill resolve os dois lados:

| Problema | Mecanismo |
|----------|-----------|
| Agentes se atropelando | **Teste de disjunção** por arquivo escrito + dependência, antes de spawnar ninguém. Colisões vão para a WAVE 0 |
| Feature "concluída" sem estar | **Prova de conclusão** declarada antes de codar, em formato executável, e obrigatoriamente falsificável |
| Plano de ação frouxo | **Gate de revisão do plano** por agente independente que **corrige** o plano antes de qualquer linha de código |
| Cerimônia cara demais | **Tiers T1/T2/T3** + **modo enxuto**: revisão de plano em lote para features mecânicas, RED só em T3, prova reusada antes de criada |
| Trabalho já feito virando feature | **Checagem de estado atual**: item já implementado vira `NO-OP` com evidência, não consome agente |
| Ping-pong de revisão | Gate 1 é **passada única** (corrigir já libera); gate 2 tem **2 tentativas**, depois escala |
| Contexto crescendo até degradar | **Delegação em cascata**: orquestrador → feature-owner → worker por etapa. Cada etapa é agente novo, briefing de ≤10 linhas com **caminhos, não conteúdo** |
| Plano escrito sobre código que vai mudar | **Planejamento just-in-time**: feature instável é marcada `ADIADA` e só é planejada quando a wave dela abre; **checkpoint** revalida premissas ao fechar cada wave |

Complementa `spec-creator`: aquela **cria** a spec, esta **executa** um plano que já existe (de qualquer origem — spec, issue, doc, brainstorm).

---

## Como invocar

- "implemente o plano `X.md`"
- "executa o plano `X.md` com agentes em paralelo"
- "roda esse plano em paralelo"
- `/plan-executor`

---

## Fluxo

```
[INPUT] "implemente o plano X.md"
  ↓ SETUP    localiza o plano, cria .claude/plan-runs/<slug>/, materializa 3 agentes
  ↓ FASE 0   lê o plano inteiro → estado atual (NO-OPs) + inventário: features, arquivos, deps, provas
  ↓ FASE 1   tiers + modo da run + mapa de paralelismo → EXEC-MAP.md (waves, WAVE 0, serializações)
  ↓ FASE 2   wave por wave — abre liberando as features ADIADAS, fecha com checkpoint:
  │          feature-owner por feature, delegando cada etapa a um worker novo:
  │            1. planner        → ACTION-PLAN.md + prova + premissas a montante
  │            2. plan-reviewer  → revisa e CORRIGE o plano  ← gate 1 (lote em T1, passada única)
  │            3. implementer    → executa o plano liberado  (agente NOVO, lê só o plano)
  │            4. code-reviewer  → revisa a execução         ← gate 2 (individual, máx. 2 tentativas)
  │            5. commit + merge + cleanup → feature CONCLUÍDA
  ↓ FASE 3   suite global, cobertura item-a-item do plano, auditoria de cleanup, relatório
```

**Cascata de agentes (contexto mínimo por etapa):**

```
orquestrador (0)  waves, veredictos, quadro       — nunca lê código, diff ou log
  └ feature-owner (1)  coordena UMA feature       — nunca planeja, codifica ou revisa
      └ workers (2)    planner · plan-reviewer · implementer · code-reviewer · fixer
```

Nível 3 é proibido. Se o runtime não permitir spawn aninhado, o owner emite `DELEGAR: …` e o
orquestrador spawna por ele — a árvore lógica é a mesma.

**Modo enxuto:** plano com ≤4 features, todas T1 → sem waves, sem worktree, 1 feature-agent sequencial,
1 revisão de planos em lote, 1 code review do diff completo. FASE 3 continua obrigatória.

O orquestrador é a **sessão principal** — não implementa feature nenhuma, só a WAVE 0 (fundação compartilhada).

---

## Os dois gates

Nenhuma aprovação humana no caminho feliz. Humano só entra via `ESCALAR`.

**Gate 1 — `plan-reviewer`** (o diferencial da skill)

Único revisor que **edita o artefato**: ele corrige o `ACTION-PLAN.md` em vez de devolver lista de pendências. Verifica:
- o plano de ação bate com o que o plano original pediu para essa feature?
- os passos, na ordem, realmente chegam ao resultado? falta passo? sobra passo?
- a prova de conclusão comprova a feature — ou **passaria com a feature quebrada**?

Veredictos: `APROVADO` | `CORRIGIDO` (plano já ajustado — **é liberação**, não nova rodada) | `ESCALAR`.
Em features T1, um revisor cobre até 4 planos da mesma wave numa passada.

**Gate 2 — `code-reviewer`** (sempre individual, em todo tier)

Revisa a execução contra o plano liberado: passos entregues, prova realmente executada com evidência, escopo respeitado, sem poluição de outra feature, qualidade técnica.

Veredictos: `APROVADO` | `REJEITADO` (N/2, com arquivo:linha) | `ESCALAR`.

---

## Prova de conclusão

Cada feature declara, **antes** de codar, **uma** prova. Ordem de preferência — reusar antes de criar:

1. **Comando/teste que já existe** — `<comando>` exits 0
2. **Asserção nova em teste existente** — teste `<nome>` em `<arquivo já existente>` passa
3. **Teste novo** — só quando 1 e 2 são impossíveis
4. **Estado observável** — `<endpoint/função>` com `<input>` produz `<output>`

Rejeitados: "funcionar corretamente", "estar implementado", "sem erros no console", "verificar visualmente"; e criar harness/fixture nova para provar feature mecânica.

RED antes de GREEN: obrigatório em T3, opcional-se-barato em T2, **não fazer** em T1.

E o filtro que separa prova de teatro:

> **Teste de falsificação:** qual cenário de feature quebrada ainda passaria nessa prova?

Se não houver resposta, a prova é inválida e o `plan-reviewer` a reescreve.

---

## Paralelismo: quando duas features podem rodar juntas

Só quando **todas** as condições valem:

- conjuntos de arquivos **escritos** disjuntos (leitura compartilhada é livre)
- nenhuma consome artefato produzido pela outra
- sem teste/fixture/snapshot/seed em comum
- sem agregador em comum (`index.*`, rotas, i18n, lockfile, config)
- **sem colisão semântica**: não mexem no mesmo comportamento observável nem fazem o mesmo teste existente mudar de resultado — mesmo em arquivos diferentes

Na dúvida, serializa. E o que colide vai para a **WAVE 0**, executada pelo orquestrador antes de qualquer agente existir: boilerplate, contratos, agregadores, migrations, dependências novas.

## Quando **não** rodar uma feature ainda

Disjunção diz *quem roda junto*; estabilidade diz *quando dá para planejar*. Uma feature pode estar sozinha na wave e ainda assim ser **ADIADA**:

- consome artefato cuja forma ainda pode mudar (assinatura, shape, schema, rota)
- depende de decisão que uma feature a montante ainda vai tomar
- o alvo dela é código que a wave anterior vai reescrever
- a prova dela depende de comportamento que a montante altera

Feature ADIADA **não recebe agente nenhum** até a wave dela abrir. Todo plano declara suas **premissas a montante**; ao fechar cada wave, o orquestrador cruza os desvios reportados com essas premissas e decide: re-planejar (plano descartado, planner novo), re-mapear (refaz disjunção) ou escalar.

---

## Artefatos gerados

```
.claude/plan-runs/<plan-slug>/
├── EXEC-MAP.md                    # waves, tiers, adiamentos, colisões, revalidações, cobertura
├── agents/                        # 4 agentes materializados com placeholders resolvidos
│   ├── feature-owner.md
│   ├── feature-agent.md           # 3 modos: PLANO | EXECUÇÃO | CORREÇÃO
│   ├── plan-reviewer.md
│   └── code-reviewer.md
└── features/
    ├── FEAT-001-<slug>.md         # ACTION-PLAN: passos, prova, correções do revisor, evidência
    └── FEAT-002-<slug>.md
```

---

## Conteúdo da skill

| Arquivo | Para que serve |
|---------|----------------|
| [SKILL.md](SKILL.md) | Ponto de entrada — fluxo, SETUP, gates, agentes |
| [rules.md](rules.md) | 17 regras críticas válidas em todas as fases |
| [gotchas.md](gotchas.md) | 30 erros frequentes de execução paralela |
| [phases/phase-0-inventory.md](phases/phase-0-inventory.md) | Leitura do plano, checagem de estado atual, matriz de arquivos |
| [phases/phase-1-parallel-map.md](phases/phase-1-parallel-map.md) | Tiers, modo da run, teste de disjunção, WAVE 0, waves |
| [phases/phase-2-feature-cycle.md](phases/phase-2-feature-cycle.md) | Ciclo de 5 etapas, briefings, quadro de progresso |
| [phases/phase-3-closeout.md](phases/phase-3-closeout.md) | Suite global, cobertura do plano, cleanup, relatório |
| [agents/feature-owner.md](agents/feature-owner.md) | Coordenador de uma feature: delega cada etapa a um worker novo |
| [agents/feature-agent.md](agents/feature-agent.md) | Worker de etapa: MODO PLANO / EXECUÇÃO / CORREÇÃO |
| [agents/plan-reviewer.md](agents/plan-reviewer.md) | Revisor independente que corrige o plano de ação |
| [agents/code-reviewer.md](agents/code-reviewer.md) | Revisor independente da execução |
| [templates/exec-map.template.md](templates/exec-map.template.md) | Template do mapa de execução |
| [templates/action-plan.template.md](templates/action-plan.template.md) | Template do plano de ação por feature |

---

## Regras que mais economizam retrabalho

1. **Nada de código antes do gate 1.** Trabalho feito antes é descartado.
2. **O que já existe não vira feature** — checagem de estado atual antes de fatiar e antes de planejar.
3. **Disjunção provada, não presumida.** Dúvida = serializar.
4. **Prova reusada antes de criada**, executada, com evidência colada — "deve passar" não conta.
5. **Processo proporcional:** tier define o gasto; T1 revisa em lote e não faz RED.
6. **Furo no plano:** delta trivial se corrige e registra; delta de decisão **escala**. Improviso silencioso é a maior fonte de retrabalho.
7. **Execução não é exploração:** >3 arquivos não previstos ou troca de abordagem = plano errado = escalar.
8. **Cada etapa, um agente novo**, briefing com caminhos e não conteúdo — contexto não se acumula.
9. **Não planejar sobre areia:** feature instável fica ADIADA; wave só abre depois do checkpoint de premissas.
10. **Orquestrador nunca implementa feature** e nunca carrega diff/log no contexto.
11. **Wave só fecha 100% concluída** (merge + cleanup verificados por comando).

---

## Anti-padrões

- ❌ Spawnar agentes "porque as tasks parecem independentes"
- ❌ Declarar disjunção por pasta (`src/**`) em vez de por arquivo
- ❌ Paralelizar migrations
- ❌ Prova genérica ("os testes passam")
- ❌ Trocar a prova no meio da execução
- ❌ O mesmo agente escrever e revisar o mesmo artefato
- ❌ Avançar de wave com feature em review
- ❌ Deixar worktree/branch órfã
- ❌ Rodar o aparato completo (3 agentes + RED + worktree) numa mudança mecânica
- ❌ Reimplementar item do plano que já está no código
- ❌ Criar teste/harness novo quando um comando existente já provaria
- ❌ Insistir em tentativa-e-erro em vez de escalar plano errado
- ❌ Reusar o mesmo agente para planejar, executar e corrigir
- ❌ Colar diff, log ou "o que o agente anterior concluiu" no briefing do próximo
- ❌ Escrever todos os planos de ação no início da run
- ❌ Abrir a wave seguinte sem cruzar desvios × premissas
