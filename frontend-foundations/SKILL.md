---
name: frontend-foundations
description: >
  Estabelece fundações de qualidade para projetos frontend desde o começo.
  Princípios, estrutura de diretórios, regras de estilo, estratégia de testes,
  templates acionáveis e anti-padrões a evitar. Invocar ao iniciar novo projeto
  frontend, ao auditar um existente, ao pedir "boas práticas React/Vue/Svelte",
  "como organizar frontend", "estabelecer arquitetura frontend", "setup de projeto",
  ou antes de escrever a primeira task de UI de uma feature.
version: 1.0.0
date: 2026-04-17
user-invocable: true
---

# Frontend Foundations — Qualidade desde a primeira linha

> **Princípio central:** frontend de qualidade é **boring**. Nenhuma das regras abaixo é inovadora. O que distingue bom frontend de legado é aplicar o trivial com **disciplina**. Quando disciplina falha, a dívida acumula invisivelmente até virar uma página de 878 LOC com cobertura de 5%.

Esta skill é um **manual operacional**, não um tutorial. Use os arquivos referenciados quando precisar do detalhe; a SKILL.md dá o overview para decidir.

## Dois casos de uso primários

Esta skill serve a **dois modos** igualmente importantes:

### 🌱 Modo Greenfield — iniciando projeto novo
Estabelecer as fundações certas **antes** da primeira linha de código. Evita acumular dívida desde o começo.
→ Use: [setup-checklist.md](setup-checklist.md) + [structure.md](structure.md) + [templates/](templates/)

### 🔎 Modo Auditoria — avaliando projeto existente
Diagnosticar violações de boas práticas em frontend já em produção, gerar relatório priorizado e propor plano de ação.
→ Use: [audit-playbook.md](audit-playbook.md) + [anti-patterns.md](anti-patterns.md)

## Quando invocar

- "Quero começar um projeto React/Vue/Svelte bem-feito"
- "Setup de projeto frontend"
- "Como organizar meu frontend"
- **"Audite/revise/avalie meu frontend"**
- **"Este frontend segue boas práticas?"**
- **"Quais problemas têm no meu projeto?"**
- "Vale a pena refatorar?"
- "Como estruturar componentes / testes / estilo?"
- Antes de escrever a primeira task de UI de uma feature nova
- Em retrospectiva para medir saúde do frontend

## Os 10 princípios (síntese)

| # | Princípio | Detalhe |
|---|-----------|---------|
| 1 | **Tamanho importa** | ≤250 LOC por arquivo, ideal <150. Página = composição + handlers, nada mais. |
| 2 | **Duas camadas de componentes** | Primitivos genéricos (`ui/`) vs. compostos de domínio (`domain/`). |
| 3 | **Reuso precisa de governança** | Regra explícita "verifique antes de criar" + ferramenta (agente ou lint). |
| 4 | **Camadas distintas** | Tipos em `types/`, mocks em `data/`, estado em `stores/`, lógica em `hooks/`, UI consome tudo. |
| 5 | **Estilo precisa de regra** | Documente em 5 linhas quando usar inline / Tailwind / cva / classes custom. |
| 6 | **Cobertura real, não teatro** | Threshold no CI só vale se os testes realmente cobrem comportamento. |
| 7 | **Hooks são primitivos de comportamento** | `useClickOutside`, `useEscapeKey`, `useClipboard` — não repita em cada componente. |
| 8 | **Resiliência por default** | Error Boundary + validação Zod em forms + loading/empty states. |
| 9 | **Decisão sem ADR não existe** | Stack declarada no README que ninguém adotou é desejo, não arquitetura. |
| 10 | **Tokens de design centralizados** | CSS custom properties, nunca hex espalhado por componente. |

Cada princípio expandido em [principles.md](principles.md).

## Fluxo sugerido para projeto novo

```
1. Escolha stack   → setup-checklist.md §1
2. Crie estrutura   → structure.md
3. Defina tokens   → structure.md §Design System
4. Regras de estilo → styling-rules.md
5. Primeiros primitivos (shadcn ou hand-rolled)
6. Hooks utilitários de base (useClickOutside, useEscapeKey, useClipboard)
7. ErrorBoundary + Zod em forms
8. Estratégia de testes (pirâmide) → testing-strategy.md
9. CI com thresholds + lint
10. ADR-001 do stack
```

## Fluxo sugerido para projeto existente (auditoria)

```
1. Diagnóstico    → anti-patterns.md (identifique quais se aplicam)
2. Métricas       → rodar: wc -l src/**/*.tsx | sort -n, coverage, lint
3. Priorize       → modularização > extração > testes (maior ROI primeiro)
4. Use spec-creator → gerar spec de refatoração antes de tocar no código
5. Aplique        → seguindo a spec, um grupo por PR
```

## Estrutura recomendada (resumo)

```
src/
├── components/
│   ├── ui/          # primitivos — Button, Dialog, Input (shadcn ou similar)
│   ├── domain/      # compostos com lógica de negócio — ProductCard, PersonaCard
│   └── layout/      # shell — Sidebar, Header
├── pages/
│   ├── HomePage.tsx
│   └── HomePage/
│       └── components/  # sub-componentes específicos desta página
├── hooks/            # comportamento reutilizável
├── lib/              # utils genéricos (cn, colors, date)
├── stores/           # Zustand/Jotai/etc
├── types/            # contratos de domínio
├── data/             # mocks/fixtures (antes de backend real)
├── services/         # HTTP / gRPC / SDK clients
└── index.css         # tokens globais (CSS custom properties)
```

Detalhe em [structure.md](structure.md).

## Arquivos desta skill

| Arquivo | Quando consultar |
|---------|------------------|
| [principles.md](principles.md) | Aprofundar um dos 10 princípios |
| [structure.md](structure.md) | Decidir onde colocar um arquivo |
| [styling-rules.md](styling-rules.md) | Inline style? Tailwind? cva? Classe custom? |
| [testing-strategy.md](testing-strategy.md) | Tipo de teste, cobertura, ferramentas |
| [anti-patterns.md](anti-patterns.md) | Diagnóstico — cada sintoma → regra violada + correção |
| [audit-playbook.md](audit-playbook.md) | 🔎 Protocolo de auditoria — varreduras, métricas, relatório priorizado |
| [setup-checklist.md](setup-checklist.md) | 🌱 Iniciando projeto — o que garantir antes da 1ª task |
| [templates/](templates/) | Skeletons prontos (primitivo, composto, hook, página, store, test) |

## Regras absolutas desta skill

1. **Nada de "vamos padronizar depois".** Depois = nunca. Padronize antes do 3º componente similar ser escrito.
2. **Nenhum arquivo de código acima de 250 LOC sem justificativa em ADR.**
3. **Zero hex/rgba hardcoded fora de `index.css` ou `lib/colors`.**
4. **Zero `any` injustificado.**
5. **Zero `console.log` em código de produção.** Warnings/erros intencionais = `console.warn` / `console.error` com justificativa inline.
6. **Test-first não é opcional** — se você está escrevendo componente sem um teste esboçado, pare.
7. **Antes de criar, busque.** Sempre verifique `ui/`, `domain/`, `hooks/`, `lib/` antes de reinventar.
