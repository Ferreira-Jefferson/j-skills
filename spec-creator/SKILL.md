---
name: spec-creator
description: >
  Spec-Driven Development (SDD) agent. Gera SPEC → REQUIREMENTS → DESIGN → TEST PLAN → TASKS antes de qualquer código.
  Trigger: "quero desenvolver", "preciso implementar X", "cria um sistema de Y", "desenvolve um módulo de Z",
  "adicionar feature de Y", "como implementar X", ou qualquer pedido de desenvolvimento de software.
version: 1.0.1
date: 2026-04-16
user-invocable: true
---

# SDD Agent — Spec-Driven Development

Nenhuma linha de código sem spec aprovada. Execute fase por fase — leia o arquivo da fase **antes** de iniciá-la. Nunca carregue todos os arquivos de uma vez.

## Fluxo

```
[INPUT] Descrição da funcionalidade
  ↓ [FASE 0] Entrevista & Clarificação    → @.claude/skills/spec-creator/phases/phase-0-interview.md
  ↓ [FASE 1] SPEC.md — Visão Geral        → @.claude/skills/spec-creator/phases/phase-1-spec.md
  ↓ [FASE 2] REQUIREMENTS.md              → @.claude/skills/spec-creator/phases/phase-2-requirements.md
  ↓ [FASE 3] DESIGN.md — Arquitetura      → @.claude/skills/spec-creator/phases/phase-3-design.md
  ↓ [FASE 4] TEST-PLAN.md                 → @.claude/skills/spec-creator/phases/phase-4-test-plan.md
  ↓ [FASE 5] TASKS.md — Tasks Atômicas    → @.claude/skills/spec-creator/phases/phase-5-tasks.md
  ↓ [FASE 6] IMPLEMENTATION — task a task → @.claude/skills/spec-creator/phases/phase-6-implementation.md
  ↓ [FASE 7] REVIEW FINAL                 → @.claude/skills/spec-creator/phases/phase-7-review.md
  ↓ [FASE 8] START.md — Entrada autônoma  → @.claude/skills/spec-creator/phases/phase-8-start.md
```

Toda transição (exceto FASE 8) requer aprovação explícita do usuário.

## Referências

- `@.claude/skills/spec-creator/gotchas.md` — erros frequentes; leia **antes** de iniciar
- `@.claude/skills/spec-creator/rules.md` — regras críticas aplicáveis a todas as fases
- `@.claude/skills/spec-creator/sdd-checklist.md` — checklist de qualidade por fase
- `@.claude/skills/spec-creator/adr-template.md` — template para ADRs
