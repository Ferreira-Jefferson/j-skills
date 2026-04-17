# Audit Playbook — Avaliando um Frontend Existente

> **Objetivo:** produzir um **relatório de saúde do frontend** com diagnóstico objetivo, severidades, e plano de ação priorizado. Use este playbook quando o usuário pedir "avalie meu frontend", "quais problemas tenho", "vale refatorar", ou similar.

## Como executar a auditoria

Siga as 5 etapas **em ordem**. Cada uma produz artefatos que alimentam a próxima.

---

## Etapa 1 — Discovery silenciosa

Antes de qualquer opinião, colete **fatos**. Use as ferramentas disponíveis (Bash, Grep, Glob, Read) para coletar:

### 1.1 Stack e configuração
- `package.json` — stack, scripts, dependências
- `tsconfig.json` / `jsconfig.json` — strict mode?
- `vite.config.*` / `next.config.*` / `webpack.config.*` — aliases, plugins
- `.eslintrc` / `eslint.config.js` — regras ativas
- `.prettierrc` — formatação
- `vitest.config.*` / `jest.config.*` — config de testes, thresholds

### 1.2 Estrutura
```bash
# 1 nível
ls src/
# 2 níveis dos componentes
ls src/components/ src/pages/ src/hooks/ src/stores/ src/types/ 2>/dev/null
# contagem de arquivos por pasta
find src -type f -name "*.ts*" | awk -F/ '{print $2}' | sort | uniq -c
```

### 1.3 Histórico
```bash
git log --oneline -20
git shortlog -sn --all | head -10     # autores principais
```

---

## Etapa 2 — Métricas objetivas (quantitativo)

Rode todas as varreduras abaixo. Salve os números — vão para o relatório.

### 2.1 Tamanho de arquivos
```bash
# Top 20 arquivos por LOC
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20

# Quantos arquivos acima do limite?
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 250' | wc -l
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 150' | wc -l

# LOC total
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1
```

### 2.2 Duplicação de padrões
```bash
# Modais caseiros
grep -rln "backdrop\|onClose\|onOpenChange" src/components/

# Hex color hardcoded fora de lib/ e index.css
grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "lib/colors\|index.css" | wc -l

# rgba inline
grep -rn "rgba(" src/ --include="*.tsx" | wc -l

# classes CSS repetidas (candidatas a componente)
grep -rho "class[N]\?ame=\"[^\"]*\"" src/ | sort | uniq -c | sort -rn | head -20
```

### 2.3 Tipos inline em páginas/componentes
```bash
# types/interfaces declarados fora de src/types/
grep -rn "^type \|^interface \|^export type \|^export interface " src/pages/ src/components/ \
  | wc -l
```

### 2.4 Console.log / any
```bash
grep -rn "console\.log" src/ | wc -l
grep -rn ": any\b\|as any\b" src/ | wc -l
```

### 2.5 Testes e cobertura
```bash
# Arquivos de teste
find . -name "*.test.*" -o -name "*.spec.*" | wc -l

# Se projeto tem vitest/jest: rodar coverage
npm run test:coverage 2>/dev/null || npm test -- --coverage 2>/dev/null
# Olhar cobertura final em statements / branches / functions / lines
```

### 2.6 Lint e typecheck
```bash
npm run lint 2>&1 | tail -20        # quantidade de warnings/errors
npm run typecheck 2>&1 | tail -20   # erros de tipo
```

### 2.7 Bundle (se build disponível)
```bash
npm run build 2>&1 | tail -30       # olhar tamanho final; flag chunks > 300kb
```

---

## Etapa 3 — Diagnóstico qualitativo

Com as métricas em mãos, rode o **check dos 10 anti-padrões** de [anti-patterns.md](anti-patterns.md). Para cada um, classifique:

| Status | Significado |
|--------|-------------|
| 🟢 OK | não detectado ou dentro dos limites |
| 🟡 Atenção | presente em pequena escala — cuidado |
| 🔴 Crítico | presente e afetando manutenibilidade |

**Checagem dos 10 (resumo):**

1. **Páginas gigantes** — arquivo > 250 LOC? → 🟡 acima de 250 / 🔴 acima de 500
2. **Uma camada só de componentes** — pastas `ui/` e `domain/` separadas? → 🔴 se tudo está em `components/` plano
3. **Sem governança de reuso** — há agente/lint/processo documentado? → 🔴 se não
4. **Camadas misturadas** — tipos inline em páginas? mocks em componentes? → 🔴 se > 5 ocorrências
5. **Estilo anárquico** — mix inline + tailwind + css custom sem regra? → 🔴 se não há `STYLE_GUIDE.md` ou equivalente
6. **Cobertura teatral** — threshold declarado mas testes não rodam/quebrados? → 🔴 se threshold < real + 20pp, ou testes broken
7. **Hooks não extraídos** — `addEventListener` inline duplicado? → 🟡 se 2-3x, 🔴 se >3x
8. **Resiliência ausente** — tem ErrorBoundary? validação Zod? loading/empty states? → 🔴 se nenhum presente
9. **ADRs ausentes** — decisões importantes documentadas? → 🟡 se nenhuma, 🔴 se README menciona stack não adotada
10. **Tokens dispersos** — hex/rgba espalhados? → 🟡 > 10 ocorrências, 🔴 > 50

---

## Etapa 4 — Priorização (matriz impacto × esforço)

Para cada 🔴 e 🟡 identificado, atribua:

| Impacto | O que significa |
|---------|-----------------|
| Alto | Bloqueia novas features / tem bug grave / CI está quebrado |
| Médio | Desacelera desenvolvimento mas não bloqueia |
| Baixo | Irritante, não urgente |

| Esforço | O que significa |
|---------|-----------------|
| S (dias) | 1 pessoa em <5 dias |
| M (semanas) | 1-2 pessoas em 1-3 semanas |
| L (meses) | Time inteiro, 1+ mês |

**Ordem sugerida:**
1. Alto impacto + esforço S (quick wins)
2. Alto impacto + esforço M
3. Médio impacto + esforço S
4. Alto impacto + esforço L (só depois de quick wins resolverem o sangramento)
5. Médio/Baixo impacto + esforço M/L (tratar como dívida de fundo)

---

## Etapa 5 — Relatório (template)

Gere um documento markdown seguindo este template. Salve em `.claude/audits/frontend-YYYY-MM-DD.md` ou caminho equivalente.

````markdown
# Auditoria de Frontend — <projeto>

**Data:** YYYY-MM-DD
**Auditor:** <nome/agente>
**Versão do código auditada:** `<commit hash>`
**Stack observada:** React X, Vite Y, TypeScript Z, ...

---

## 1. Resumo executivo

<2-3 parágrafos:>
- Estado geral do frontend (saudável / atenção / crítico)
- Top 3 riscos
- Esforço estimado para atingir baseline saudável

---

## 2. Métricas

| Métrica | Valor | Referência saudável | Status |
|---------|------:|--------------------:|:------:|
| LOC total `src/` | X | — | — |
| Maior arquivo | X LOC | ≤250 | 🔴 / 🟡 / 🟢 |
| Arquivos > 250 LOC | X | 0 | 🔴 / 🟡 / 🟢 |
| Arquivos > 150 LOC | X | <20% | — |
| Hex hardcoded (fora lib/) | X | 0 | — |
| Tipos inline em pages | X | 0 | — |
| `console.log` em src | X | 0 | — |
| `any` injustificado | X | 0 | — |
| Cobertura statements | X% | ≥80% | — |
| Testes quebrados | X | 0 | — |
| Lint warnings | X | 0 | — |
| Typecheck erros | X | 0 | — |
| Bundle final (gzipped) | X kB | budget do projeto | — |

---

## 3. Diagnóstico (10 anti-padrões)

| # | Anti-padrão | Status | Evidência | Nota |
|---|-------------|:------:|-----------|------|
| 1 | Páginas gigantes | 🔴 | `SettingsPage.tsx` 878 LOC | Impossível de navegar |
| 2 | Uma camada só | 🔴 | `components/` flat com 5 arquivos mistos | Sem `ui/` ou `domain/` |
| ... | ... | ... | ... | ... |

---

## 4. Top findings (detalhados)

### 4.1 [🔴 Alto] <nome do problema>

**Sintoma:** <o que foi observado, com evidência concreta>
**Arquivos afetados:** `<paths>`
**Por que dói:** <impacto em manutenibilidade / bug risk / velocidade>
**Como corrigir:** <referência ao princípio de `principles.md` e ao template em `templates/`>
**Esforço:** S/M/L

### 4.2 [...]

...

---

## 5. Plano de ação priorizado

### Quick wins (1 sprint)
1. [ ] Fix testes quebrados (labels pt-BR) — <task id>
2. [ ] Extrair paleta de cores para `lib/colors.ts` — <task id>
3. [ ] ...

### Médio prazo (2-4 sprints)
1. [ ] Dividir páginas > 500 LOC em sub-componentes
2. [ ] Extrair primitivos para `ui/` (shadcn ou hand-rolled)
3. [ ] ...

### Dívida de fundo
1. [ ] Migrar testes para cobertura real ≥80%
2. [ ] ...

---

## 6. Recomendações estruturais

<Se o projeto vai crescer:>
- Adotar skill `frontend-foundations` como guia vivo
- Invocar `spec-creator` antes de features novas de porte
- Rodar esta auditoria trimestralmente

<Se o projeto é legado em sunset:>
- Focar apenas em segurança e estabilidade
- Não investir em modularização

---

## 7. Apêndice — comandos usados

```bash
# Comandos exatos rodados durante a auditoria para reprodutibilidade
wc -l src/...
grep -r ...
npm run lint
...
```
````

---

## Modo rápido (audit express)

Quando o usuário quer **só um diagnóstico de 5 minutos**, pule diretamente para:

1. `wc -l src/pages/*.tsx | sort -rn | head -5`
2. `wc -l src/components/*.tsx | sort -rn | head -5`
3. Check visual da estrutura de `src/` (tem `ui/`, `domain/`, `hooks/`, `types/`?)
4. Abrir 1 página grande e 1 componente grande para ver qualidade interna
5. Resumir em 10 linhas com os 3 maiores problemas e 1 recomendação concreta

Ideal para validar se vale fazer a auditoria completa ou se o projeto está saudável.

---

## Regras da auditoria

1. **Fatos primeiro, opinião depois.** Toda afirmação do relatório tem que citar evidência concreta (path + linha + número).
2. **Severidade baseada em impacto, não em estética.** Uma página de 600 LOC que funciona é 🟡; uma de 200 LOC que derruba a app em erro é 🔴.
3. **Não recomende refatoração total.** Sempre priorize — a recomendação útil é "3 quick wins nesta sprint".
4. **Nenhuma recomendação sem referência.** Toda ação sugerida aponta para um princípio em `principles.md` ou template em `templates/`.
5. **Respeite contexto.** POC de validação pessoal ≠ produto em produção. Ajuste o bar.
6. **Nunca proponha mudança de stack** como primeiro recurso. Mudança de stack é custo alto e raramente é a raiz do problema.

---

## Quando entregar o relatório

- Se o usuário tem autonomia → entregue o .md e pergunte "quer que eu gere a spec de refatoração com `spec-creator`?"
- Se o usuário quer discutir → destaque o Top 3 em chat e ofereça o relatório completo como arquivo
- Se a auditoria revelou escopo grande → sugira quebrar em specs menores (por eixo: modularização / testes / estilo) em vez de uma refatoração monolítica
