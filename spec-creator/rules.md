# SDD — Regras Críticas

Aplicam-se a **todas as fases**. São princípios universais do workflow SDD.

## 1. Branch dedicada: obrigatória antes de qualquer código

Crie no início da FASE 6, antes da TASK-001.

Formato sugerido:
- Nova funcionalidade → `feature/feat-NNN-nome-kebab`
- Correção → `fix/fix-NNN-nome-kebab`
- Refatoração → `refactor/refactor-NNN-nome-kebab`

**Bloqueio hard:** se a branch não foi criada, não execute nenhuma task. Pergunte ao usuário.

## 2. Schema e infraestrutura: siga as convenções do projeto

Mudanças estruturais (schema, migrations, infra) devem seguir as práticas do projeto descobertas na FASE 0. Nunca aplique changes estruturais por meios ad-hoc — use o workflow oficial do projeto (migrations, IaC, CI/CD).

## 3. Arquivos da spec: organizados e isolados

Todos os artefatos da spec vivem em uma pasta dedicada por feature.
Default: `.claude/specs/[feature-name]/`.
Use prefixos para contexto: `CONTEXT-`, `ERRORS-`, `NOTES-`, `ADR-`.

Se o projeto já tem uma convenção diferente para documentação (descoberta na FASE 0), siga-a.

## 4. Nenhum código antes da FASE 5 aprovada

Se encontrar inconsistência entre documentos → pare e sinalize.
Decisões arquiteturais não previstas → crie um ADR usando `@.claude/skills/spec-creator/adr-template.md`.
