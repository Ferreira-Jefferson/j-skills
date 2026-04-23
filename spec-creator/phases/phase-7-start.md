# FASE 7 — START.md (Handoff para Implementação)

Gere automaticamente (sem pedir aprovação) `.claude/specs/[feature-name]/START.md`.

Este é o **ponto de entrada único** para a sessão de implementação que vai consumir esta spec. A skill `spec-creator` termina aqui — a implementação acontece em sessão separada usando o START.md como guia.

## O que START.md deve conter

1. **Identidade** — Feature ID, nome, status (`spec-ready`), pasta da spec, datas (criação)
2. **Resumo** — 2 frases: o que faz e por que existe
3. **Documentos de Referência** — Tabela com todos os docs da spec e ordem de leitura (SPEC → REQUIREMENTS → DESIGN → TEST-PLAN → TASKS → REVIEW-FINAL)
4. **Stack e Ambiente** — Tecnologias, variáveis de ambiente, comandos de setup (baseados no que foi observado na FASE 0)
5. **Plano de Implementação** — Lista ordenada de tasks da FASE 5. Todas começam como **pendentes**. Indica TASK-001 como próxima a iniciar.
6. **Protocolo de Execução** — Como a sessão de implementação deve proceder (branch dedicada, TDD, 1 task = 1 commit, aprovação entre tasks)
7. **Contexto de Negócio** — Branch a criar (sugestão), ambiente alvo, solicitante, objetivo

## Protocolo de execução (a ser seguido na sessão de implementação)

O agente que consumir o START.md deve:
- Ler todos os docs de referência na ordem antes de agir
- Criar a branch dedicada (`feature/feat-NNN-kebab-name`, `fix/fix-NNN-...`, etc.) antes da TASK-001
- Seguir TDD: teste falhando → código mínimo → teste passando → refatora → commit
- Executar **uma task por vez**, aguardando aprovação entre elas
- Perguntar SOMENTE se: docs se contradizem, decisão técnica não coberta, ambiente ambíguo, ou risco de perda de dados
- Atualizar a seção "Plano de Implementação" marcando tasks concluídas a cada sessão

## Princípio de geração

Gere o START.md baseado no que FOI OBSERVADO no projeto e nas fases anteriores desta spec.
Não copie templates genéricos — o documento deve refletir a realidade da feature e do projeto.

Todas as tasks começam como **pendentes** (nenhuma concluída), pois esta skill não implementa.

## Após gerar

> *"Spec completa e pronta para implementação. Artefatos em `.claude/specs/[feature-name]/`. Para implementar em uma nova sessão, envie: 'use `.claude/specs/[feature-name]/START.md`' — o agente seguirá o plano task por task."*
