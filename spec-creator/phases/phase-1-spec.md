# FASE 1 — SPEC.md (Visão Geral)

> **Propósito:** Documento executivo que qualquer stakeholder entende. Define O QUE e POR QUÊ — nunca o COMO.

## O que deve constar

- **Sumário executivo** — 2-3 frases: o que é e por que existe
- **Problema** — Descrição clara da dor ou necessidade
- **Solução proposta** — Abordagem em alto nível (sem detalhes de implementação)
- **Valor de negócio** — Impacto concreto para o usuário ou produto
- **Riscos** — Com probabilidade, impacto e mitigação para cada um
- **Fora do escopo** — Tão importante quanto o escopo; elimina expectativas falsas
- **Glossário** — Termos do domínio que aparecem nas fases seguintes

## Adaptação

- Feature pequena: a SPEC pode ter 1 página. Não force seções vazias.
- Feature complexa: adicione stakeholders, dependências externas, timeline.
- Calibre o nível de detalhe pelo contexto do projeto descoberto na FASE 0.

## Anti-padrões

- Descrever a solução técnica aqui — isso é DESIGN (FASE 3)
- Copiar o escopo positivo como escopo negativo invertido ("não fará o oposto de X")
- Riscos genéricos sem mitigação ("pode ter bugs" não é risco útil)

## Saída

Gere `.claude/specs/[feature-name]/SPEC.md` e pergunte:
> *"SPEC gerada. Revise e me diga se posso avançar para REQUIREMENTS."*
