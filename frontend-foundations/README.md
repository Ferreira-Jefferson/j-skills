# frontend-foundations

> Skill para **estabelecer** ou **auditar** fundações de qualidade em projetos frontend. Nenhum dos princípios aqui é inovador — o que muda é aplicá-los com disciplina desde o começo ou diagnosticar por que eles quebraram em um projeto legado.

---

## Para quê

Esta skill serve a dois momentos:

| 🌱 **Greenfield** | 🔎 **Auditoria** |
|-----------------|-------------------|
| Você está começando um projeto React/Vue/Svelte e quer evitar acumular dívida técnica | Você tem um projeto existente e quer diagnóstico objetivo dos problemas |
| Quer setup padrão alinhado: estrutura, tokens, primitivos, hooks base, testes, CI | Quer relatório priorizado com matriz impacto × esforço |
| Quer templates prontos para cada tipo de arquivo | Quer saber se vale refatorar ou se o projeto está saudável |

---

## Como invocar

A skill é invocada automaticamente pelo sistema quando você usar frases como:

- "Quero começar um projeto React bem-feito"
- "Setup de projeto frontend"
- "Como organizar meu frontend"
- **"Audite/avalie meu frontend"**
- **"Este projeto segue boas práticas?"**
- **"Quais problemas tenho no meu código?"**
- "Vale a pena refatorar?"
- "Como estruturar componentes / testes / estilo?"

Também pode ser invocada manualmente: `/frontend-foundations` (se habilitada como comando) ou referenciada em contexto: `use frontend-foundations`.

---

## Quickstart

### Começando projeto novo

```
> vou começar um projeto React para um dashboard de analytics

[skill é invocada]
```

A skill vai guiar você pelos 12 passos do [setup-checklist.md](setup-checklist.md):

1. Scaffolding (Vite + TS strict)
2. Tailwind + tokens de design
3. Primitivos em `components/ui/`
4. Estrutura de `types/`, `stores/`, `services/`, `data/`
5. Hooks essenciais (`useClickOutside`, `useEscapeKey`, `useClipboard`)
6. ErrorBoundary + validação Zod
7. Vitest + Playwright com thresholds 80%
8. ESLint + Prettier `--max-warnings 0`
9. CI com todos os gates
10. Agente `reuse-checker` + ADR-001 do stack
11. Feature trivial validando end-to-end
12. Commit `baseline-v0`

No fim, seu projeto sai com disciplina embutida — dívida técnica vira exceção, não padrão.

### Auditando projeto existente

```
> audite meu frontend em ./frontend

[skill é invocada]
```

A skill executa o protocolo de 5 etapas do [audit-playbook.md](audit-playbook.md):

1. **Discovery silenciosa** — stack, estrutura, histórico
2. **Métricas objetivas** — LOC por arquivo, duplicação, cobertura, lint
3. **Diagnóstico dos 10 anti-padrões** — cada um classificado 🟢/🟡/🔴
4. **Priorização** — matriz impacto × esforço
5. **Relatório** — .md em `.claude/audits/` com quick wins, médio prazo e dívida de fundo

Exemplo de saída:

```
## Métricas
- Maior arquivo: SettingsPage.tsx — 878 LOC 🔴
- Cobertura real: 5% (threshold CI: 80%) 🔴
- Hex hardcoded fora de lib/: 37 ocorrências 🔴
- Testes quebrados: 4 (labels em idioma errado) 🔴

## Quick wins (1 sprint)
1. [ ] Fix testes quebrados → TASK-INFRA-008
2. [ ] Extrair paleta para lib/colors.ts → TASK-INFRA-004
3. [ ] Criar ui/ e mover primitivos
```

Dali você pode passar direto para [spec-creator](../spec-creator/SKILL.md) gerar a spec de refatoração.

---

## Conteúdo da skill

### Documentação operacional

| Arquivo | Quando consultar |
|---------|------------------|
| [SKILL.md](SKILL.md) | Manual principal — overview + regras absolutas |
| [principles.md](principles.md) | Os 10 princípios detalhados com regra + teste para cada |
| [structure.md](structure.md) | Árvore de diretórios + responsabilidade de cada pasta + FAQ "onde colocar" |
| [styling-rules.md](styling-rules.md) | 5 regras: quando inline / Tailwind / cva / classe custom |
| [testing-strategy.md](testing-strategy.md) | Pirâmide 70/20/10 + o que NÃO testar |
| [anti-patterns.md](anti-patterns.md) | Catálogo de 10 anti-padrões com detecção em 1 linha |
| [audit-playbook.md](audit-playbook.md) | 🔎 Protocolo de auditoria + template de relatório |
| [setup-checklist.md](setup-checklist.md) | 🌱 12 passos para projeto novo até baseline-v0 |

### Templates prontos

Pasta [templates/](templates/) tem 11 skeletons TS + React copiáveis:

| Template | Para |
|----------|------|
| `primitive.template.tsx` | Primitivo em `components/ui/` com cva |
| `domain-component.template.tsx` | Composto em `components/domain/` |
| `page.template.tsx` | Página em `pages/` (composição + handlers) |
| `hook.template.ts` | Hook em `hooks/` (useClickOutside, useEscapeKey) |
| `store.template.ts` | Zustand com persist + migration |
| `error-boundary.template.tsx` | Error Boundary global |
| `form-with-zod.template.tsx` | Formulário validado com Zod |
| `test-component.template.tsx` | Teste unitário de componente |
| `test-hook.template.ts` | Teste de hook com `renderHook` |
| `test-store.template.ts` | Teste de store Zustand |
| `adr.template.md` | Architecture Decision Record |

---

## Os 10 princípios (síntese)

1. **Tamanho importa** — ≤150 LOC ideal, ≤250 LOC absoluto
2. **Duas camadas de componentes** — `ui/` primitivos vs `domain/` compostos
3. **Reuso precisa de governança** — `reuse-checker` ou equivalente
4. **Camadas distintas** — tipos, dados, estado, UI separados
5. **Estilo precisa de regra** — 5 linhas de decisão documentadas
6. **Cobertura real, não teatro** — sabote um comparador, algum teste tem que quebrar
7. **Hooks são primitivos de comportamento** — regra dos 2 (2ª repetição vira hook)
8. **Resiliência por default** — ErrorBoundary + Zod + loading/empty states
9. **Decisão sem ADR não existe** — stack declarada ≠ stack adotada
10. **Tokens de design centralizados** — zero hex hardcoded em componentes

Detalhe completo em [principles.md](principles.md).

---

## Frameworks cobertos

Os exemplos usam **React 18 + TypeScript + Tailwind + Vite + Zustand**, mas a **estrutura mental** é universal:

| Conceito | React | Vue | Svelte |
|----------|-------|-----|--------|
| Primitivos | `ui/` com cva | `ui/` components | `ui/` components |
| Compostos | `domain/` | `domain/` | `domain/` |
| Estado | Zustand | Pinia | Svelte stores |
| Testes | Vitest + RTL | Vitest + Vue Test Utils | Vitest + Testing Library |
| Estilo | Tailwind + cva | Tailwind + vue-cva | Tailwind + cva |

Adapte a sintaxe, preserve os princípios.

---

## Integração com outras skills

| Skill | Como se conecta |
|-------|-----------------|
| [spec-creator](../spec-creator/SKILL.md) | Gera spec de refatoração a partir do relatório de auditoria |
| [frontend-design](../frontend-design/) | Cuida do design visual; frontend-foundations cuida da arquitetura |
| [simplify](../simplify/) | Limpa código depois de escrito; frontend-foundations evita o problema desde o começo |

**Fluxo recomendado para refatoração grande:**

```
frontend-foundations (audit) → gera relatório
       ↓
spec-creator → gera SPEC/REQUIREMENTS/DESIGN/TASKS/IMPLEMENTATION
       ↓
sessão de execução → aplica as tasks
       ↓
frontend-foundations (audit de novo) → valida que baseline foi atingido
```

---

## Origem

Os princípios desta skill foram **destilados** de uma refatoração real do frontend do AdForge (POC de marketing digital) em abril/2026, onde encontramos:

- ~7.126 LOC em 27 arquivos
- Páginas de 400–878 LOC
- Paleta de 48 cores duplicada em 2 arquivos
- Modal backdrop replicado em 3 dialogs
- 4 testes para 27 arquivos (cobertura real ~5%, threshold CI 80%)
- Labels de teste em inglês enquanto UI era em português
- Stack `shadcn/ui` declarada no CLAUDE.md mas nunca instalada

Cada um desses sintomas gerou um princípio desta skill e um anti-padrão diagnóstico. Se você está lendo esta skill e se reconhece em algum dos casos, a intenção é evitar que o próximo projeto sofra o mesmo.

---

## Regras absolutas (repetidas do SKILL.md)

1. Nada de "padronizamos depois" — depois = nunca
2. Nenhum arquivo > 250 LOC sem ADR justificando
3. Zero hex/rgba fora de `index.css` ou `lib/colors`
4. Zero `any` injustificado
5. Zero `console.log` em produção
6. Test-first não é opcional
7. Antes de criar, busque

Se seu time topa essas 7 regras, 80% do valor desta skill está garantido.

---

## Contribuir / evoluir

A skill é um **documento vivo**. Quando encontrar um novo anti-padrão, um princípio violado de forma inesperada ou um template faltando, edite os arquivos correspondentes e commit. Os princípios evoluem conforme o estado da arte do frontend.

Mudanças significativas merecem ADR em `.claude/adrs/` do próprio projeto que usa a skill.

---

## Licença e uso

Uso interno dos projetos do autor. Livre para copiar, adaptar, remixar em outros projetos — a estrutura não é proprietária, é destilado de prática acumulada.
