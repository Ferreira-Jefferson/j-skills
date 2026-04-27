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
- **Definition of Done (DoD) da feature** — Checklist final de aceitação aplicado quando toda a implementação terminar (ver abaixo)

## Definition of Done — checklist obrigatório

Lista de critérios que provam que a feature como um todo está pronta. Diferente dos ACs por story (granulares), o DoD é a aceitação **da feature inteira** — o orquestrador valida no fim contra essa lista. Cada item deve ser binário (passa/não passa) e verificável sem ambiguidade.

Exemplo de estrutura:

```
DoD-01: Todos os ACs de cada user story estão verdes (testes passando)
DoD-02: Todos os RNFs com métrica configurada são atendidos (medir e provar)
DoD-03: Smoke test E2E do happy path executa sem erro em ambiente de homolog
DoD-04: Logs estruturados aparecem nas operações chave (X, Y, Z) — verificar amostra
DoD-05: Migrations aplicadas com sucesso em staging sem rollback
DoD-06: Documentação de uso atualizada (se aplicável)
DoD-07: [outros critérios específicos da feature]
```

O orquestrador, na finalização, roda o DoD como última etapa — se algum item falha, a feature **não está pronta** mesmo que tasks individuais estejam todas merged.

## Adaptação

- Backend-only / pipeline: user stories podem ser "Como [sistema/cron], quero..."
- Micro-feature: 1-2 user stories bastam. Não infle artificialmente.
- Se o projeto já tem padrões de documentação (descobertos na FASE 0), siga-os.

## Anti-padrões

- ACs vagos: "deve funcionar corretamente" — não é verificável
- RNFs sem métrica: "deve ser rápido" — inútil sem número
- Esquecer fluxos de erro — todo happy path tem edge cases
- Requisitos que repetem a SPEC em vez de refiná-la

## Saída e dispatch ao reviewer

Gere `.claude/specs/[feature-name]/REQUIREMENTS.md` e submeta ao **spec-reviewer** com o prompt obrigatório:

> *"Um desenvolvedor produziu o documento REQUIREMENTS.md (FASE 2) para a feature [feature-name]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: cada AC é verificável? RNFs têm métricas concretas? Fluxos de erro estão mapeados? Matriz de rastreabilidade está completa? Aprovar ou pedir correções."*

- **APROVADO** → avançar automaticamente para FASE 3
- **REJEITADO** → corrigir os issues bloqueantes e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer
