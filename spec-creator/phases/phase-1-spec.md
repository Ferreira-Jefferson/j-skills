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

## Saída e dispatch ao reviewer

Gere `.claude/specs/[feature-name]/SPEC.md` e submeta ao **spec-reviewer** com o prompt obrigatório:

> *"Um desenvolvedor produziu o documento SPEC.md (FASE 1) para a feature [feature-name]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: o problema está articulado? A solução é em alto nível (sem virar design)? Riscos têm mitigação real? Escopo negativo é específico? Aprovar ou pedir correções."*

- **APROVADO** → avançar automaticamente para FASE 2
- **REJEITADO** → corrigir os issues bloqueantes apontados e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer
