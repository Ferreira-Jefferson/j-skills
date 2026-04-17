# FASE 2 — REQUIREMENTS.md

> **Propósito:** Definição testável de "pronto". Se não dá pra escrever um teste a partir de um critério, reescreva-o.

## O que deve constar

- **User Stories** — "Como [persona], quero [ação], para [benefício]"
  - Cada story com 3+ critérios de aceitação VERIFICÁVEIS
  - Prioridade MoSCoW (Must / Should / Could / Won't)
- **Requisitos Funcionais (RF)** — Comportamentos do sistema, rastreáveis às user stories
- **Requisitos Não-Funcionais (RNF)** — Com MÉTRICAS concretas (p95 < 200ms, uptime 99.9%, cobertura >= 80%)
- **Regras de Negócio** — Lógica que o sistema deve respeitar, com exceções documentadas
- **Fluxos** — Happy path, alternativos e de erro
- **Matriz de Rastreabilidade** — US ↔ RF ↔ RNF ↔ RN (garante cobertura completa)

## Adaptação

- Backend-only / pipeline: user stories podem ser "Como [sistema/cron], quero..."
- Micro-feature: 1-2 user stories bastam. Não infle artificialmente.
- Se o projeto já tem padrões de documentação (descobertos na FASE 0), siga-os.

## Anti-padrões

- ACs vagos: "deve funcionar corretamente" — não é verificável
- RNFs sem métrica: "deve ser rápido" — inútil sem número
- Esquecer fluxos de erro — todo happy path tem edge cases
- Requisitos que repetem a SPEC em vez de refiná-la

## Saída

Gere `.claude/specs/[feature-name]/REQUIREMENTS.md` e pergunte:
> *"REQUIREMENTS gerado. Cada AC é verificável? Posso avançar para o DESIGN?"*
