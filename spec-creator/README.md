# spec-creator

> Spec-Driven Development (SDD) agent. **Objetivo: produzir uma spec robusta e completa — não implementar.** Transforma pedidos de funcionalidade em um conjunto de documentos rastreáveis: SPEC → REQUIREMENTS → DESIGN → TEST-PLAN → TASKS → REVIEW-FINAL → START.

---

## Para quê

Features médias e grandes frequentemente viram dívida quando são implementadas direto do pedido em linguagem natural. Faltam requisitos verificáveis, decisões arquiteturais viram "tribal knowledge", testes são lembrados depois, e ninguém sabe o critério de "pronto".

O `spec-creator` força **disciplina de engenharia** via 8 fases sequenciais (0 a 7), cada uma com aprovação explícita antes da próxima. O resultado é uma pasta `.claude/specs/<feature>/` com tudo que uma sessão de implementação futura precisa para executar a feature — humano ou agente.

**Importante:** esta skill não escreve código. A implementação acontece em sessão separada, guiada pelo `START.md` gerado na FASE 7.

---

## Como invocar

### Triggers automáticos (frases do usuário)

A skill dispara quando aparecem padrões como:
- "Quero desenvolver X"
- "Preciso implementar Y"
- "Cria um sistema de Z"
- "Desenvolve um módulo de W"
- "Adicionar feature de A"
- "Como implementar B"
- Qualquer pedido de desenvolvimento de software de porte médio/grande

### Manual
- `/spec-creator`
- "use spec-creator para a feature X"

### Quando NÃO usar
- Bug fix pequeno (2-3 arquivos)
- Alteração cosmética / copy change
- Tarefa operacional sem decisão arquitetural
- Protótipo descartável

Regra prática: se a feature vai gerar **5+ arquivos ou envolver 2+ pessoas/sessões**, use o spec-creator. Abaixo disso, provavelmente overhead maior que benefício.

---

## Fluxo completo

```
[INPUT] Descrição da funcionalidade
  ↓ [SETUP] Cria pasta da spec + materializa agentes na pasta da spec
  ↓ [FASE 0] Discovery + Entrevista          → phases/phase-0-interview.md
  ↓ [FASE 1] SPEC.md        (POR QUÊ)        → phases/phase-1-spec.md
  ↓ [FASE 2] REQUIREMENTS.md  (O QUÊ)        → phases/phase-2-requirements.md
  ↓ [FASE 3] DESIGN.md        (COMO)         → phases/phase-3-design.md
  ↓ [FASE 4] TEST-PLAN.md     (VALIDAÇÃO)    → phases/phase-4-test-plan.md
  ↓ [FASE 5] TASKS.md         (UNIDADES)     → phases/phase-5-tasks.md
  ↓ [FASE 6] REVIEW-FINAL.md  (REVIEW SPEC)  → phases/phase-6-review.md
  ↓ [FASE 7] START.md         (HANDOFF)      → phases/phase-7-start.md
```

Cada transição entre fases (0-6) é gateada pelo **`spec-reviewer`** (agente interno da skill) — **não por aprovação humana**. Após cada fase, o documento produzido é submetido ao revisor; se APROVADO, avança automaticamente. Humanos só são acionados via escalação: ambiguidade de domínio, política de negócio, ou após 3 rejeições consecutivas. A FASE 7 é automática após FASE 6.

---

## Papel de cada artefato

| Artefato | Natureza | Foco |
|----------|----------|------|
| `SPEC.md` | executivo | POR QUÊ a feature existe, problema, escopo, valor |
| `REQUIREMENTS.md` | contratual | O QUE precisa ser verdade — user stories + ACs verificáveis |
| `DESIGN.md` | arquitetural | COMO vai ser feito — componentes, modelo, API, segurança |
| `TEST-PLAN.md` | verificação | Como saberemos que funciona — casos de teste por AC |
| `TASKS.md` | plano | Unidades atômicas de trabalho com dependências e arquivos mapeados |
| `REVIEW-FINAL.md` | completude da spec | Consistência entre documentos, cobertura de RFs/RNFs, gaps |
| `START.md` | handoff | Ponto de entrada único para a sessão de implementação executar a spec |

---

## Quickstart

### Cenário — Nova feature

```
> Quero desenvolver um sistema de notificações que envia email, SMS e push
  quando o status de um pedido muda.

[spec-creator dispara]
```

A skill executa o SETUP primeiro (cria pasta, materializa agentes), depois FASE 0 e cada documento em sequência. O `spec-reviewer` gateia cada transição automaticamente:

```
SETUP → cria .claude/specs/order-notifications/ + agents/
      → materializa orchestrator.md, code-reviewer.md, developer.md com placeholders preenchidos

FASE 0 → identifica stack (FastAPI + PostgreSQL + Redis)
       → pergunta apenas: integrações externas, SLA, escopo negativo, prazo
       → spec-reviewer avalia → APROVADO → avança para FASE 1

FASE 1 → gera SPEC.md: problema, solução em alto nível, valor, riscos, escopo negativo
       → spec-reviewer avalia → APROVADO → avança para FASE 2

FASE 2 → REQUIREMENTS.md: User stories MoSCoW, ACs verificáveis, RNFs com métrica
       → matriz de rastreabilidade US ↔ RF ↔ RNF ↔ RN

... e assim por diante até FASE 7 (START.md).
```

Humanos só são acionados quando o `spec-reviewer` escala: ambiguidade de domínio, política de negócio, ou após 3 rejeições consecutivas do mesmo documento.

---

## Estrutura da pasta da spec

```
.claude/specs/<feature-name>/
├── SPEC.md                   # Fase 1 — executivo
├── REQUIREMENTS.md           # Fase 2 — ACs
├── DESIGN.md                 # Fase 3 — arquitetura
├── TEST-PLAN.md              # Fase 4 — casos de teste
├── TASKS.md                  # Fase 5 — plano de execução
├── REVIEW-FINAL.md           # Fase 6 — review da spec completa
├── START.md                  # Fase 7 — handoff para implementação
├── agents/                   # Agentes de implementação (gerados no SETUP)
│   ├── orchestrator.md
│   ├── code-reviewer.md
│   └── developer.md
└── adrs/                     # Architecture Decision Records
    ├── ADR-001-<tema>.md
    └── ADR-002-<tema>.md
```

---

## Agentes

A skill opera com dois tiers de agentes:

**Agentes da skill** (vivem em `.claude/skills/spec-creator/agents/`):
| Agente | Papel |
|--------|-------|
| `spec-reviewer.md` | Gatekeeper das fases 0-6 — avalia cada documento e aprova/rejeita/escala |
| `orchestrator.md` | **Template** — copiado para a pasta da spec no SETUP |
| `code-reviewer.md` | **Template** — copiado para a pasta da spec no SETUP |
| `developer.md` | **Template** — copiado para a pasta da spec no SETUP |

**Agentes da spec** (vivem em `.claude/specs/<feature>/agents/`, gerados no SETUP):
| Agente | Papel |
|--------|-------|
| `orchestrator.md` | Coordena a implementação desta feature específica |
| `code-reviewer.md` | Revisa cada task desta feature |
| `developer.md` | Implementa cada task desta feature |

Os agentes da spec são **artefatos da spec** — vivem com ela e são consumidos pela sessão de implementação a partir do `START.md`. O `spec-reviewer` **não** vai junto; ele só existe durante a criação da spec.

---

## Conteúdo da skill

### Arquivos principais

| Arquivo | Para que serve |
|---------|----------------|
| [SKILL.md](SKILL.md) | Manual — fluxo das 8 fases + triggers |
| [rules.md](rules.md) | Regras críticas aplicáveis a todas as fases |
| [gotchas.md](gotchas.md) | 10 erros frequentes a evitar (G-001 a G-010) |
| [sdd-checklist.md](sdd-checklist.md) | Checklist de qualidade por fase — validação pós-fase |
| [adr-template.md](adr-template.md) | Template para ADRs |

### Phases

Cada fase tem arquivo dedicado em `phases/`:

| Fase | Arquivo |
|------|---------|
| 0 — Discovery + Entrevista | [phase-0-interview.md](phases/phase-0-interview.md) |
| 1 — SPEC | [phase-1-spec.md](phases/phase-1-spec.md) |
| 2 — REQUIREMENTS | [phase-2-requirements.md](phases/phase-2-requirements.md) |
| 3 — DESIGN | [phase-3-design.md](phases/phase-3-design.md) |
| 4 — TEST-PLAN | [phase-4-test-plan.md](phases/phase-4-test-plan.md) |
| 5 — TASKS | [phase-5-tasks.md](phases/phase-5-tasks.md) |
| 6 — Review Final da Spec | [phase-6-review.md](phases/phase-6-review.md) |
| 7 — START.md (Handoff) | [phase-7-start.md](phases/phase-7-start.md) |

A skill **carrega uma fase por vez** — não tenta ter todas em contexto simultaneamente (evita ruído).

---

## Regras críticas (do rules.md)

1. **Esta skill não implementa.** Nenhuma linha de código é escrita aqui. Branch, TDD, commits e execução são responsabilidade da sessão de implementação que consome o START.md.
2. **Schema/infra segue convenções do projeto** descobertas na FASE 0 — nunca especificar changes ad-hoc.
3. **Artefatos isolados** em `.claude/specs/<feature>/`. Prefixos de contexto: `CONTEXT-`, `ERRORS-`, `NOTES-`, `ADR-`.
4. **Inconsistência entre docs → pare e sinalize.** Decisão arquitetural não prevista → crie ADR.

---

## Gotchas clássicos (do gotchas.md)

| ID | Sintoma | Fix |
|----|---------|-----|
| G-001 | Pular FASE 0 e ir direto para SPEC | FASE 0 é obrigatória |
| G-002 | Carregar todos os phase files de uma vez | Carregue só a fase atual |
| G-003 | Tentar implementar durante a skill | Skill só define; implementação via START.md |
| G-004 | Review da FASE 6 cobrir implementação | Review cobre a spec (consistência, cobertura, gaps) |
| G-005 | Salvar SPEC/REQ na raiz ou em `docs/` | Tudo em `.claude/specs/<feature>/` |
| G-006 | START.md antes da REVIEW FINAL | Só na FASE 7 |
| G-007 | Escalar para o usuário em cada fase | Gates são do `spec-reviewer`; humano só entra via escalação |
| G-008 | START.md com tasks "em andamento" | Todas pendentes; TASK-001 é a próxima |
| G-009 | Assumir stack ao invés de descobrir | FASE 0 existe para isso |
| G-010 | Forçar seções irrelevantes do template | Use a seção "Adaptação" de cada phase file |

---

## Checklist de qualidade (do sdd-checklist.md)

Cada fase tem uma mini-checklist para validar pós-fase. Exemplos:

**FASE 2 (REQUIREMENTS)**
- [ ] Toda user story tem ≥3 critérios de aceitação
- [ ] ACs são VERIFICÁVEIS (não ambíguos)
- [ ] RNFs têm MÉTRICAS concretas (p95, SLA, cobertura)
- [ ] Matriz de rastreabilidade preenchida

**FASE 3 (DESIGN)**
- [ ] Diagrama de componentes presente
- [ ] API contract completo (request + response + erros)
- [ ] Segurança — OWASP Top 10 revisado
- [ ] ≥1 ADR por decisão não-óbvia
- [ ] Validação de entrada especificada

**FASE 6 (Review Final da Spec)**
- [ ] Todo RF com entrada em DESIGN, TEST-PLAN e TASKS
- [ ] Todo RNF com métrica e teste
- [ ] Matriz de rastreabilidade completa
- [ ] Gaps bloqueantes listados ou confirmados como zero

Ver [sdd-checklist.md](sdd-checklist.md) para lista completa.

---

## ADRs (Architecture Decision Records)

Decisões não-óbvias viram ADR em `.claude/specs/<feature>/adrs/`. Template em [adr-template.md](adr-template.md). Estrutura:

1. **Contexto** — por que a decisão é necessária
2. **Opções avaliadas** — com prós/contras de cada
3. **Decisão** — qual foi e justificativa
4. **Consequências** — positivas, negativas, riscos
5. **Plano de execução** — como sai do papel

"Adotar X" sem plano é desejo, não decisão. Toda ADR precisa de plano executável.

---

## Adaptação por tamanho

| Tamanho | Como adaptar |
|---------|--------------|
| Feature pequena (1 página de SPEC) | Pule seções vazias, não force template rígido |
| Feature média | Siga o fluxo completo |
| Feature grande | Quebre TASKS.md em seções por grupo (Setup → Backend → Frontend → QA) |
| Pipeline / backend-only | Pule seções de Frontend no DESIGN |
| Infra / devops | Foque em diagrama de deploy, rollback |

Cada phase file tem uma seção "Adaptação" documentando o que pode ser cortado.

---

## Integração com outras skills

| Skill | Como se conecta |
|-------|-----------------|
| [frontend-foundations](../frontend-foundations/) | Audita projeto → relatório vira input do spec-creator para refatoração |
| [error-memory](../error-memory/) | Consultado em decisões de infra/deploy durante DESIGN |
| [feature-first](../feature-first/) | Consultado durante DESIGN quando há dúvida de arquitetura — feature-first define o layout de módulos que o DESIGN.md vai adotar |

**Fluxo recomendado para refatoração grande:**
```
frontend-foundations (audit) → relatório priorizado
       ↓
spec-creator → SPEC + REQUIREMENTS + DESIGN + TEST-PLAN + TASKS + REVIEW-FINAL + START
       ↓
sessão de implementação consome START.md → aplica as tasks task-por-task
       ↓
PR aberto quando todas as tasks estiverem concluídas
```

---

## Comando de handoff

Depois que a skill termina, uma nova sessão executa a spec enviando:

```
use .claude/specs/<feature>/START.md
```

O START.md tem:
- Plano de implementação (todas as tasks pendentes, TASK-001 é a próxima)
- Referência ordenada aos docs da spec
- Protocolo de execução (branch dedicada, TDD, 1 task = 1 commit, aprovação entre tasks)
- Stack, ambiente e contexto de negócio

Qualquer agente Claude consegue executar a partir dali — o propósito é **zero perguntas redundantes**.

---

## Benefícios concretos

| Antes | Depois |
|-------|--------|
| "Ah, esqueci de pensar em auth nessa feature" | REQUIREMENTS força US + ACs de auth se aplicável |
| Decisão arquitetural esquecida em 3 meses | ADR versionado em `adrs/` |
| Testes pensados depois do código | TEST-PLAN existe antes da primeira linha |
| Nova pessoa leva dias pra entender a feature | START.md é suficiente para executar em minutos |
| Escopo infla durante implementação | Escopo negativo explícito no SPEC + tasks atômicas |
| Retrabalho por desalinhamento | Aprovação entre fases + REVIEW-FINAL capturam problemas cedo |

---

## Anti-padrões

- ❌ Pedir "só a spec rápida" para feature grande — a disciplina é que dá valor
- ❌ Saltar FASE 0 ("já sei a stack") — stack muda, convenções mudam
- ❌ REQUIREMENTS com ACs vagos ("deve funcionar") — não é verificável
- ❌ DESIGN sem ADR para decisões difíceis — conhecimento vira tribal
- ❌ TASKS.md com placeholders em vez de caminhos reais de arquivo
- ❌ Implementar durante a skill — viola o escopo (definir, não executar)

---

## Filosofia

> A spec não é obstáculo à implementação. A spec **é** o mapa executável que a sessão de implementação vai seguir.

Cada fase captura decisões que **de qualquer forma** precisariam ser tomadas — a diferença é que aqui elas são tomadas **antes** do código, revisadas, versionadas, e deixadas em formato que sessões futuras conseguem consumir sem contexto prévio.

É caro no começo. É barato ao longo da vida da feature.
