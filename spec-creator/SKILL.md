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

> **Escopo desta skill:** apenas **definir** a spec. Nenhuma linha de código é escrita aqui. A implementação ocorre em sessão separada, guiada pelo `START.md` gerado ao final.

Execute fase por fase — leia o arquivo da fase **antes** de iniciá-la. Nunca carregue todos os arquivos de uma vez.

## Fluxo

```
[INPUT] Descrição da funcionalidade
  ↓ [SETUP] Cria pasta da spec + materializa agentes (orchestrator, code-reviewer, developer)
  ↓ [FASE 0] Entrevista & Clarificação    → @.claude/skills/spec-creator/phases/phase-0-interview.md
  ↓ [FASE 1] SPEC.md — Visão Geral        → @.claude/skills/spec-creator/phases/phase-1-spec.md
  ↓ [FASE 2] REQUIREMENTS.md              → @.claude/skills/spec-creator/phases/phase-2-requirements.md
  ↓ [FASE 3] DESIGN.md — Arquitetura      → @.claude/skills/spec-creator/phases/phase-3-design.md
  ↓ [FASE 4] TEST-PLAN.md                 → @.claude/skills/spec-creator/phases/phase-4-test-plan.md
  ↓ [FASE 5] TASKS.md — Tasks Atômicas    → @.claude/skills/spec-creator/phases/phase-5-tasks.md
  ↓ [FASE 6] REVIEW FINAL — Spec Review   → @.claude/skills/spec-creator/phases/phase-6-review.md
  ↓ [FASE 7] START.md — Handoff           → @.claude/skills/spec-creator/phases/phase-7-start.md
```

## SETUP (executa antes da FASE 0)

A skill faz, na ordem:

1. Definir `[feature-name]` (kebab-case) e `[feature-id]` (ex: `FEAT-018`) com base no input do usuário e no padrão do projeto (descobrir maior FEAT-NNN existente em `.claude/specs/`)
2. Criar pasta `.claude/specs/[feature-name]/` e subpasta `.claude/specs/[feature-name]/agents/`
3. Copiar os 3 templates de agentes da skill para a pasta da spec, **substituindo placeholders** (`[feature-name]`, `[feature-id]`, `[merge-target-branch]`, `[max-parallel]`):
   - `agents/orchestrator.md` (template) → `.claude/specs/[feature-name]/agents/orchestrator.md`
   - `agents/code-reviewer.md` (template) → `.claude/specs/[feature-name]/agents/code-reviewer.md`
   - `agents/developer.md` (template) → `.claude/specs/[feature-name]/agents/developer.md`
4. **Não copiar `spec-reviewer.md`** — esse agente é da skill, usado durante as fases 0-6 (não vai junto com a spec porque a spec já está pronta quando chega no orquestrador)

Os agentes materializados são **artefatos da spec** — vivem com ela, são consumidos pela sessão de implementação.

## Gates

Cada transição entre fases (0-6) é gateada pelo **`spec-reviewer`** (na skill) — não por aprovação humana. Após cada fase, o documento produzido é submetido ao revisor; se APROVADO, avança automaticamente. Humanos só são acionados via escalação (ambiguidade de domínio, política de negócio, ou após 3 rejeições consecutivas).

A FASE 7 é automática após a FASE 6 e gera o `START.md` consumido pelo `orchestrator` (já materializado na pasta da spec) em sessão separada de implementação.

## Agentes

**Da skill** (vivem em `.claude/skills/spec-creator/agents/`):
- `spec-reviewer.md` — revisor sênior das fases 0-6 (regula a saída da skill)
- `orchestrator.md`, `code-reviewer.md`, `developer.md` — **TEMPLATES** copiados para a pasta da spec no SETUP

**Da spec** (vivem em `.claude/specs/[feature-name]/agents/`, gerados no SETUP):
- `orchestrator.md` — coordena a implementação desta feature específica
- `code-reviewer.md` — revisa cada task desta feature
- `developer.md` — implementa cada task desta feature

## Referências

- `@.claude/skills/spec-creator/gotchas.md` — erros frequentes; leia **antes** de iniciar
- `@.claude/skills/spec-creator/rules.md` — regras críticas aplicáveis a todas as fases
- `@.claude/skills/spec-creator/sdd-checklist.md` — checklist de qualidade por fase (input do spec-reviewer)
- `@.claude/skills/spec-creator/adr-template.md` — template para ADRs
