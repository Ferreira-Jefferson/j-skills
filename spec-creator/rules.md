# SDD — Regras Críticas

Aplicam-se a **todas as fases**. São princípios universais do workflow SDD.

## 1. Esta skill NÃO implementa

O objetivo é entregar uma spec completa, consistente e verificável. Nenhuma linha de código é escrita durante a execução desta skill.

A implementação ocorre em uma sessão separada, que consome o `START.md` gerado na FASE 7. Criação de branch, TDD, commits e execução de testes são responsabilidades dessa sessão — não desta.

## 2. Schema e infraestrutura: siga as convenções do projeto na spec

Mudanças estruturais (schema, migrations, infra) devem ser **especificadas** conforme as práticas do projeto descobertas na FASE 0 (migrations, IaC, CI/CD). A execução dessas mudanças acontece na sessão de implementação.

## 3. Arquivos da spec: organizados e isolados

Todos os artefatos da spec vivem em uma pasta dedicada por feature.
Default: `.claude/specs/[feature-name]/`.
Use prefixos para contexto: `CONTEXT-`, `ERRORS-`, `NOTES-`, `ADR-`.

Se o projeto já tem uma convenção diferente para documentação (descoberta na FASE 0), siga-a.

## 4. Inconsistências e decisões não previstas

Se encontrar inconsistência entre documentos → pare e sinalize.
Decisões arquiteturais não previstas → crie um ADR usando `@.claude/skills/spec-creator/adr-template.md`.
Nenhuma fase avança com gaps bloqueantes não resolvidos.
