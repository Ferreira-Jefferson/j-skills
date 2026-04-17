# Setup Checklist — Iniciando Projeto Novo

> Checklist sequencial para iniciar um projeto frontend **com disciplina desde a primeira linha**. Pule qualquer item por sua conta e risco — cada um é uma dívida que você evita pagar depois.

---

## Pré-setup

- [ ] Defina o **stack essencial** (Framework, build tool, CSS, state, HTTP, testes)
- [ ] Defina o **idioma da UI** e documente (evita o bug "teste em inglês, UI em português")
- [ ] Escreva um **README mínimo** com stack e comandos
- [ ] Escreva um **CLAUDE.md** (ou `.cursorrules`) com regras absolutas do projeto

---

## 1. Scaffolding

```bash
# Exemplo React + Vite + TS strict
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

- [ ] `tsconfig.json` com `"strict": true`
- [ ] Alias `@/` → `src/` no `vite.config.ts` e `tsconfig.json`

---

## 2. Estilo

- [ ] Instalar Tailwind v4 (ou versão equivalente do framework escolhido)
- [ ] Criar `src/index.css` com **tokens** (ver [structure.md](structure.md) § Design System)
- [ ] Instalar `clsx`, `tailwind-merge`, `class-variance-authority`
- [ ] Criar `src/lib/utils.ts` com `cn()`
- [ ] Escrever `.claude/docs/FRONTEND_STYLE_GUIDE.md` baseado em [styling-rules.md](styling-rules.md)

---

## 3. Componentes base

- [ ] Criar estrutura `src/components/{ui,domain,layout}/`
- [ ] Instalar shadcn-ui OU escrever primitivos hand-rolled com API equivalente
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button dialog input textarea select label badge avatar
  ```
- [ ] Cada primitivo já tem teste unitário
- [ ] Definir template de composto de domínio (ver [templates/domain-component.template.tsx](templates/domain-component.template.tsx))

---

## 4. Estado e dados

- [ ] Escolher lib de estado (Zustand, Jotai, Redux Toolkit) — **documente o motivo em ADR**
- [ ] Instalar `@tanstack/react-query` se precisar de server state
- [ ] Criar `src/types/` vazio com `index.ts` barrel
- [ ] Criar `src/stores/` vazio
- [ ] Criar `src/services/api.ts` com cliente HTTP configurado (Axios/fetch wrapper)
- [ ] Criar `src/data/` vazio (para fixtures quando não houver backend ainda)

---

## 5. Hooks utilitários

- [ ] Criar `src/hooks/` com os essenciais ([templates/hook.template.ts](templates/hook.template.ts)):
  - `useClickOutside`
  - `useEscapeKey`
  - `useClipboard`
  - `useDebouncedValue`

---

## 6. Resiliência

- [ ] Criar `src/components/ErrorBoundary.tsx` e envolver `<main>` em `App.tsx`
- [ ] Instalar `zod`; criar schema por form
- [ ] Definir componente `<EmptyState>` e `<LoadingSpinner>` em `domain/`
- [ ] Validar que app não crasha com `localStorage` vazio ou corrompido

---

## 7. Testes

- [ ] Instalar `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitest/coverage-v8`
- [ ] Configurar `vite.config.ts` com `test.coverage.thresholds` a 80%
- [ ] Criar `tests/setup.ts` com imports do jest-dom + mocks globais
- [ ] Criar estrutura `tests/{unit,e2e}/` espelhando `src/`
- [ ] Instalar e configurar Playwright: `npm init playwright@latest`
- [ ] Escrever 1 teste E2E de smoke (app carrega em `/`)

---

## 8. Lint e format

- [ ] `npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier prettier`
- [ ] `eslint.config.js` com `--max-warnings 0` no script
- [ ] `.prettierrc` com preferências (sem semi, single quote, etc)
- [ ] Script `format` (prettier write) e `lint` configurados

---

## 9. CI

Workflow mínimo (GitHub Actions / GitLab CI / ...):

```yaml
- npm ci
- npm run lint
- npm run typecheck
- npm run test:coverage    # threshold 80%
- npm run build
- npm run test:e2e
```

- [ ] PR bloqueado quando qualquer step falha
- [ ] Badge de status no README

---

## 10. Governança e documentação

- [ ] Criar `.claude/agents/reuse-checker.md` (ver ADR-002 do frontend-refactor para template)
- [ ] Adicionar ao CLAUDE.md: "antes de criar componente/hook/util/tipo, invoque reuse-checker"
- [ ] Criar `.claude/adrs/` com ADR-001 do stack escolhido
- [ ] (Opcional) instalar skill `spec-creator` para features grandes
- [ ] Documentar **convenções de commit** (convencional commits: `feat:`, `fix:`, `refactor:`...)

---

## 11. Primeira feature — teste do setup

Escolha uma feature **trivial** para validar que tudo funciona end-to-end. Ex: "página Home com um botão que abre um dialog que mostra hello world".

Valide:
- [ ] Roteamento funciona
- [ ] Primitivo `<Button>` e `<Dialog>` funcionam
- [ ] Teste unitário do componente roda verde
- [ ] Teste E2E do fluxo roda verde
- [ ] `npm run build` gera bundle
- [ ] CI passa em todos os steps
- [ ] `npm run dev` + ação visual funciona no browser

Se isso passa, o setup está validado. Se não, consertar **agora**, antes de escrever qualquer feature real.

---

## 12. Primeiro commit de baseline

```bash
git add .
git commit -m "chore: scaffold frontend with strict foundations (setup-checklist complete)"
git tag baseline-v0
```

A partir desse commit, toda dívida técnica que aparecer tem que ser investigada — o setup foi calibrado para não permitir esses vazamentos.

---

## Baseline atingido — e agora?

Você tem agora:
- Estrutura de diretórios modular
- Primitivos + hooks base + design tokens
- Error Boundary + validação Zod
- Testes unitários + E2E smoke rodando
- CI com thresholds
- Governance de reuso documentada

A partir daqui, **cada nova feature** deve:
1. Passar pelo `spec-creator` se tiver porte médio/grande
2. Invocar `reuse-checker` antes de criar qualquer coisa
3. Seguir TDD (teste primeiro)
4. Ficar abaixo dos limites de LOC
5. Respeitar as 10 regras absolutas de [principles.md](principles.md)

---

## Checklist condensado (para colar em issue de setup)

```md
- [ ] 1. Scaffolding + TS strict + alias @/
- [ ] 2. Tailwind + tokens + style guide
- [ ] 3. Primitivos ui/ (shadcn ou hand-rolled) com testes
- [ ] 4. types/, stores/, services/, data/ vazios prontos
- [ ] 5. Hooks base (useClickOutside, useEscapeKey, useClipboard)
- [ ] 6. ErrorBoundary + Zod + EmptyState
- [ ] 7. Vitest + Playwright + thresholds 80%
- [ ] 8. ESLint + Prettier + --max-warnings 0
- [ ] 9. CI com todos os steps bloqueantes
- [ ] 10. reuse-checker agent + ADR-001 + CLAUDE.md
- [ ] 11. Feature trivial valida end-to-end
- [ ] 12. Commit baseline-v0
```
