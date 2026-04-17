# spec-creator

> Spec-Driven Development (SDD) agent. **Nenhuma linha de código sem spec aprovada.** Transforma pedidos de funcionalidade em um conjunto de documentos rastreáveis: SPEC → REQUIREMENTS → DESIGN → TEST-PLAN → TASKS → IMPLEMENTATION → REVIEW-FINAL → START.

---

## Para quê

Features médias e grandes frequentemente viram dívida quando são implementadas direto do pedido em linguagem natural. Faltam requisitos verificáveis, decisões arquiteturais viram "tribal knowledge", testes são lembrados depois, e ninguém sabe o critério de "pronto".

O `spec-creator` força **disciplina de engenharia** via 9 fases sequenciais, cada uma com aprovação explícita antes da próxima. O resultado é uma pasta `.claude/specs/<feature>/` com tudo que qualquer sessão futura precisa para retomar e terminar a feature — humano ou agente.

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

## Fluxo das 9 fases

```
[INPUT] Descrição da funcionalidade
  ↓ [FASE 0] Discovery + Entrevista          → phases/phase-0-interview.md
  ↓ [FASE 1] SPEC.md        (POR QUÊ)        → phases/phase-1-spec.md
  ↓ [FASE 2] REQUIREMENTS.md  (O QUÊ)        → phases/phase-2-requirements.md
  ↓ [FASE 3] DESIGN.md        (COMO)         → phases/phase-3-design.md
  ↓ [FASE 4] TEST-PLAN.md     (VALIDAÇÃO)    → phases/phase-4-test-plan.md
  ↓ [FASE 5] TASKS.md         (UNIDADES)     → phases/phase-5-tasks.md
  ↓ [FASE 6] Implementação (task a task)     → phases/phase-6-implementation.md
  ↓ [FASE 7] REVIEW-FINAL.md                 → phases/phase-7-review.md
  ↓ [FASE 8] START.md (retomada autônoma)    → phases/phase-8-start.md
```

Toda transição (exceto FASE 7 → 8, que é automática) **requer aprovação explícita do usuário**. "Parece bom" não conta — aguarde "aprovado", "pode ir" ou equivalente.

---

## Papel de cada artefato

| Artefato | Natureza | Foco |
|----------|----------|------|
| `SPEC.md` | executivo | POR QUÊ a feature existe, problema, escopo, valor |
| `REQUIREMENTS.md` | contratual | O QUE precisa ser verdade — user stories + ACs verificáveis |
| `DESIGN.md` | arquitetural | COMO vai ser feito — componentes, modelo, API, segurança |
| `TEST-PLAN.md` | verificação | Como saberemos que funciona — casos de teste por AC |
| `TASKS.md` | plano | Unidades atômicas de trabalho com dependências |
| `IMPLEMENTATION` | execução | Task a task, commit atômico, aprovação entre tasks |
| `REVIEW-FINAL.md` | completude | Confirma que tudo foi implementado + testado |
| `START.md` | retomada | Ponto de entrada único para sessão futura executar/continuar |

---

## Quickstart

### Cenário — Nova feature

```
> Quero desenvolver um sistema de notificações que envia email, SMS e push
  quando o status de um pedido muda.

[spec-creator dispara]
```

A skill executa FASE 0 (discovery silenciosa + entrevista focada no que não é derivável do código), depois gera cada documento em sequência:

```
FASE 0 → identifica stack, descobre que projeto usa FastAPI + PostgreSQL + Redis
       → pergunta apenas: integrações externas, SLA, escopo negativo, prazo
       → "posso avançar para FASE 1?"

FASE 1 → gera .claude/specs/order-notifications/SPEC.md
       → problema, solução em alto nível, valor, riscos, escopo negativo
       → "revisa e diz se posso avançar para REQUIREMENTS?"

FASE 2 → REQUIREMENTS.md
       → User stories MoSCoW, ACs verificáveis, RNFs com métrica
       → matriz de rastreabilidade US ↔ RF ↔ RNF ↔ RN

... e assim por diante até FASE 8 (START.md).
```

Cada aprovação sua = avanço de 1 fase. Se algo não está bom, volta à fase anterior e refaz.

---

## Estrutura da pasta da spec

```
.claude/specs/<feature-name>/
├── SPEC.md                   # Fase 1 — executivo
├── REQUIREMENTS.md           # Fase 2 — ACs
├── DESIGN.md                 # Fase 3 — arquitetura
├── TEST-PLAN.md              # Fase 4 — casos de teste
├── TASKS.md                  # Fase 5 — plano de execução
├── REVIEW-FINAL.md           # Fase 7 — checklist de entrega
├── START.md                  # Fase 8 — ponto de retomada
└── adrs/                     # Architecture Decision Records
    ├── ADR-001-<tema>.md
    └── ADR-002-<tema>.md
```

Feature grande pode adicionar subpastas como `implementation/` com subdocumentos por grupo de tasks.

---

## Conteúdo da skill

### Arquivos principais

| Arquivo | Para que serve |
|---------|----------------|
| [SKILL.md](SKILL.md) | Manual — fluxo das 9 fases + triggers |
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
| 6 — Implementação | [phase-6-implementation.md](phases/phase-6-implementation.md) |
| 7 — Review Final | [phase-7-review.md](phases/phase-7-review.md) |
| 8 — START.md | [phase-8-start.md](phases/phase-8-start.md) |

A skill **carrega uma fase por vez** — não tenta ter todas em contexto simultaneamente (evita ruído).

---

## Regras críticas (do rules.md)

1. **Branch dedicada antes da FASE 6.** Formato: `feature/feat-NNN-kebab-name`, `fix/fix-NNN-...`, `refactor/refactor-NNN-...`. Sem branch ativa, a FASE 6 não começa.
2. **Schema/infra segue convenções do projeto** descobertas na FASE 0 — nunca aplicar changes ad-hoc.
3. **Artefatos isolados** em `.claude/specs/<feature>/`. Prefixos de contexto: `CONTEXT-`, `ERRORS-`, `NOTES-`, `ADR-`.
4. **Nenhum código antes da FASE 5 aprovada.** Se encontrar inconsistência entre docs, PARE e sinalize. Decisão arquitetural não prevista? Crie ADR.

---

## Gotchas clássicos (do gotchas.md)

| ID | Sintoma | Fix |
|----|---------|-----|
| G-001 | Pular FASE 0 e ir direto para SPEC | FASE 0 é obrigatória |
| G-002 | Carregar todos os phase files de uma vez | Carregue só a fase atual |
| G-003 | Avançar sem aprovação explícita | Aguarde "ok", "aprovado" |
| G-004 | Criar branch depois de começar a codar | Branch antes da TASK-001 |
| G-005 | Salvar SPEC/REQ na raiz ou em `docs/` | Tudo em `.claude/specs/<feature>/` |
| G-006 | START.md antes da REVIEW FINAL | Só na FASE 8 |
| G-007 | Executar múltiplas tasks sem pausa | 1 task por vez, aprovação entre elas |
| G-008 | Esboçar código antes da FASE 5 aprovada | ADR se precisar; código só depois |
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

**FASE 6 (Implementação)**
- [ ] Nenhuma task avança sem aprovação
- [ ] Testes escritos junto com código (TDD preferencial)
- [ ] Critério de conclusão verificado antes de done

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
| Feature grande | Subdivida IMPLEMENTATION em `implementation/0N-*.md` por grupo |
| Pipeline / backend-only | Pule seções de Frontend no DESIGN |
| Infra / devops | Foque em diagrama de deploy, rollback |

Cada phase file tem uma seção "Adaptação" documentando o que pode ser cortado.

---

## Integração com outras skills

| Skill | Como se conecta |
|-------|-----------------|
| [frontend-foundations](../frontend-foundations/) | Audita projeto → relatório vira input do spec-creator para refatoração |
| [error-memory](../error-memory/) | Consultado em decisões de infra/deploy durante DESIGN |
| [frontend-design](../frontend-design/) | Se a feature tem UI, consultado ao decidir visual |

**Fluxo recomendado para refatoração grande:**
```
frontend-foundations (audit) → relatório priorizado
       ↓
spec-creator → SPEC + REQUIREMENTS + DESIGN + TASKS + IMPLEMENTATION
       ↓
sessão executora → aplica as tasks
       ↓
REVIEW-FINAL aprova → abre PR
```

---

## Comando de retomada

Sessão futura retoma enviando:

```
use .claude/specs/<feature>/START.md
```

O START.md tem:
- Estado atual (tasks concluídas / em andamento / pendentes)
- Próximo passo concreto com referência a arquivos
- Protocolo de execução autônoma (quando agir vs. quando perguntar)
- Bloqueios conhecidos

Qualquer agente Claude consegue retomar a partir dali — o propósito é **zero perguntas redundantes**.

---

## Benefícios concretos

| Antes | Depois |
|-------|--------|
| "Ah, esqueci de pensar em auth nessa feature" | REQUIREMENTS força US + ACs de auth se aplicável |
| Decisão arquitetural esquecida em 3 meses | ADR versionado em `adrs/` |
| Testes pensados depois do código | TEST-PLAN existe antes da primeira linha |
| Nova pessoa leva dias pra entender a feature | START.md é suficiente para retomar em minutos |
| Escopo infla durante implementação | Escopo negativo explícito no SPEC |
| Retrabalho por desalinhamento | Aprovação entre fases captura problemas cedo |

---

## Anti-padrões

- ❌ Pedir "só a spec rápida" para feature grande — a disciplina é que dá valor
- ❌ Saltar FASE 0 ("já sei a stack") — stack muda, convenções mudam
- ❌ REQUIREMENTS com ACs vagos ("deve funcionar") — não é verificável
- ❌ DESIGN sem ADR para decisões difíceis — conhecimento vira tribal
- ❌ TASKS.md com placeholders em vez de caminhos reais de arquivo
- ❌ FASE 6 sem branch dedicada — viola rules.md §1

---

## Filosofia

> A spec não é obstáculo à implementação. A spec **é** a implementação, só que em prosa executável.

Cada fase captura decisões que **de qualquer forma** precisariam ser tomadas — a diferença é que aqui elas são tomadas **antes** do código, revisadas, versionadas, e deixadas em formato que sessões futuras conseguem consumir sem contexto prévio.

É caro no começo. É barato ao longo da vida da feature.
