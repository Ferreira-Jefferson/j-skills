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

## 5. Peer-review entre agentes substitui aprovação humana

Cada fase é gateada pelo agente formal `spec-reviewer` (`@.claude/skills/spec-creator/agents/spec-reviewer.md`), não pelo usuário. O fluxo padrão é:

1. Agente produtor escreve o documento da fase
2. Documento é submetido ao spec-reviewer com prompt obrigatório de revisão sênior
3. Veredicto APROVADO → avança automaticamente; REJEITADO → produtor corrige e re-submete; ESCALAR → consulta humano
4. Após 3 rejeições consecutivas na mesma fase, o reviewer escala automaticamente

**Humanos só são acionados via escalação** — não para aprovar cada fase. Isso vale para:
- Ambiguidade de domínio que nenhum doc resolve
- Trade-off de política de negócio
- Risco de perda de dados ou regulatório
- Bloqueio após 3 rejeições

## 6. Todo agente revisor recebe o prompt de senior

Toda invocação de qualquer revisor (`spec-reviewer` nas fases 0-6, `code-reviewer` na implementação) DEVE começar com a frase obrigatória definida no arquivo do agente:

> *"Um desenvolvedor produziu/implementou [X]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer..."*

Este prompt não é opcional — é o que diferencia o reviewer de uma simples checklist automática.
