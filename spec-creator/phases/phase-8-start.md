# FASE 8 — START.md (Documento de Início Autônomo)

Gere automaticamente (sem pedir aprovação) `.claude/specs/[feature-name]/START.md`.

Este é o **ponto de entrada único** para execução autônoma: qualquer sessão Claude deve conseguir retomar o desenvolvimento a partir dele com o mínimo de perguntas.

## O que START.md deve conter

1. **Identidade** — Feature ID, nome, status atual, pasta da spec, datas (criação + última atualização)
2. **Resumo** — 2 frases: o que faz e por que existe
3. **Documentos de Referência** — Tabela com todos os docs da spec e ordem de leitura
4. **Stack e Ambiente** — Tecnologias, variáveis de ambiente, comandos de setup (baseados no que foi observado na FASE 0)
5. **Estado Atual de Implementação** — Tasks concluídas, task em andamento (INICIAR AQUI), tasks pendentes, bloqueios conhecidos
6. **Protocolo de Execução Autônoma** — Quando agir vs. quando perguntar
7. **Contexto de Negócio** — Branch de trabalho, ambiente alvo, solicitante, objetivo

## Regras do protocolo de execução

O agente autônomo deve:
- Ler todos os docs de referência na ordem antes de agir
- Iniciar pela task marcada como "em andamento" sem pedir confirmação
- Perguntar SOMENTE se: docs se contradizem, decisão técnica não coberta, ambiente ambíguo, ou risco de perda de dados
- Atualizar a seção "Estado Atual" a cada sessão de trabalho

## Princípio de geração

Gere o START.md baseado no que FOI OBSERVADO no projeto e nas fases anteriores.
Não copie templates genéricos — o documento deve refletir a realidade da feature e do projeto.

## Após gerar

> *"Spec completa. START.md gerado em `.claude/specs/[feature-name]/START.md`. Para retomar em qualquer sessão futura, envie: 'use `.claude/specs/[feature-name]/START.md`' e executo autonomamente a partir de onde parou."*
