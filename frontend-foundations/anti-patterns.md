# Anti-padrões — Diagnóstico

> Catálogo dos 10 anti-padrões mais comuns em frontend. Cada um com **sintoma**, **evidência concreta** para detectar, **regra violada** (referência a `principles.md`) e **correção**. Use para auditoria e code review.

---

## AP-01 — Páginas gigantes

**Sintoma.** Um arquivo de página com 400+ LOC. Qualquer alteração vira leitura de contexto em vez de edição.

**Detecção.**
```bash
find src/pages -name "*.tsx" | xargs wc -l | sort -rn | head
```
Qualquer número >250 é 🟡, >500 é 🔴.

**Regra violada.** Princípio 1 (tamanho importa).

**Correção.**
1. Identifique seções coesas dentro da página (um painel, um formulário, um grid)
2. Extraia cada uma para `src/pages/<Page>/components/<Seção>.tsx`
3. A página vira composição: `<PageLayout><SecaoA /><SecaoB /></PageLayout>`
4. Alvo: página ≤150 LOC, sub-componentes ≤200 LOC cada

**Caso real (AdForge).** `SettingsPage.tsx` com 878 LOC — foi dividido em `ProfileSection`, `LlmModeSection`, `ApiKeyList`, `ApiKeyDialog`.

---

## AP-02 — Uma camada só de componentes

**Sintoma.** Pasta `components/` plana com modals, cards, formulários e layout todos juntos. Impossível saber o que é primitivo e o que é de domínio.

**Detecção.**
```bash
ls src/components/     # sem subpastas ui/domain/layout?
```

**Regra violada.** Princípio 2 (duas camadas).

**Correção.**
1. Crie `components/ui/`, `components/domain/`, `components/layout/`
2. Mova cada arquivo existente para a pasta correspondente conforme [structure.md](structure.md) §"Responsabilidade"
3. Corrija imports — a maioria funciona com find/replace de path
4. Lint com regras que **proíbem** `ui/` importar de `domain/` ou `pages/`

---

## AP-03 — Sem governança de reuso

**Sintoma.** A mesma lógica/padrão aparece 2-3 vezes em componentes diferentes porque ninguém checou antes de criar. Exemplos típicos:
- Modal backdrop + blur em 3 dialogs
- Lógica de avatar com iniciais em 2 lugares
- Paleta de cores definida 2 vezes

**Detecção.**
```bash
grep -rln "backdrop" src/components/                                   # modais
grep -rln "slice(0, 2).toUpperCase()" src/                            # avatars
grep -rn "#[0-9A-Fa-f]\{6\}" src/components/ src/stores/ | wc -l      # cores
```

**Regra violada.** Princípio 3 (governança).

**Correção.**
1. Criar agente `reuse-checker` em `.claude/agents/`
2. Adicionar ao CLAUDE.md: "antes de criar componente/hook/tipo, invoque reuse-checker"
3. Para cada duplicação detectada: extrair o padrão comum para `ui/` ou `domain/` e consolidar

---

## AP-04 — Camadas misturadas

**Sintoma.**
- `type Campaign = { ... }` definido dentro de `CampaignsPage.tsx`
- Array de 3 personas hardcoded dentro de `InsightsPage.tsx`
- `axios.get('/api/...')` chamado direto em um componente

**Detecção.**
```bash
# Tipos inline em pages/components
grep -rn "^type \|^interface " src/pages/ src/components/

# Arrays grandes de dados em components/pages
grep -rn "const [A-Z_]\+ = \[" src/pages/ src/components/
```

**Regra violada.** Princípio 4 (camadas distintas).

**Correção.**
1. Mover tipos para `src/types/<entity>.ts`
2. Mover mocks para `src/data/<entity>.ts`
3. Mover chamadas HTTP para `src/services/api.ts`
4. Componente passa a importar os 3; não declara nada disso inline

---

## AP-05 — Estilo anárquico

**Sintoma.** Mesma página usa:
- `style={{ padding: '20px', background: '#0F0F12' }}` (inline estático)
- `className="p-5 bg-zinc-900"` (Tailwind)
- `className="forge-card"` (classe custom)

Sem regra sobre qual usar quando.

**Detecção.**
```bash
# inline styles estáticos (bad smell)
grep -rn "style={{" src/ | grep -vE "Color|width:|height:|transform:" | head

# arquivo deveria existir
ls .claude/docs/FRONTEND_STYLE_GUIDE.md 2>&1
```

**Regra violada.** Princípio 5 (estilo precisa de regra).

**Correção.**
1. Escrever `.claude/docs/FRONTEND_STYLE_GUIDE.md` com as 5 linhas de regra (ver [styling-rules.md](styling-rules.md))
2. Passar uma vez pelas páginas convertendo o que não segue
3. (Opcional) lint rule customizada bloqueando inline styles estáticos

---

## AP-06 — Cobertura teatral

**Sintoma.** CI exige 80% de cobertura mas:
- Cobertura real é <30%
- Testes declarados estão quebrados (buscam label em idioma errado, por ex)
- O CI "passa" porque o comando de test está pulando os arquivos errados

**Detecção.**
```bash
npm run test 2>&1 | tail -10          # passa ou falha?
npm run test:coverage 2>&1 | tail -20 # % real vs threshold

# Arquivos de teste vs arquivos de código
find src -name "*.ts*" | wc -l
find tests -name "*.test.*" -o -name "*.spec.*" | wc -l
```

**Regra violada.** Princípio 6 (cobertura real).

**Correção.**
1. Consertar testes quebrados antes de qualquer coisa
2. Medir cobertura real atual
3. Escrever testes para caminhos críticos (stores, forms, fluxos principais)
4. Elevar threshold em steps (40% → 60% → 80%) em vez de saltar

---

## AP-07 — Hooks não extraídos

**Sintoma.** Vários componentes têm `useEffect` com `addEventListener('mousedown'/'keydown'/'click')` e cleanup manual. Se algum cleanup falha, vaza listeners.

**Detecção.**
```bash
grep -rn "addEventListener" src/components/ src/pages/
```
Se >1 lugar: precisa virar hook.

**Regra violada.** Princípio 7 (hooks são primitivos).

**Correção.**
1. Criar `hooks/useClickOutside.ts`, `hooks/useEscapeKey.ts`, `hooks/useClipboard.ts`
2. Substituir usos inline por `useClickOutside(ref, () => setOpen(false))`

---

## AP-08 — Resiliência ausente

**Sintoma.**
- App inteiro crash quando um componente lança erro (sem Error Boundary)
- Formulário aceita qualquer lixo (sem validação Zod/Yup)
- Lista vazia renderiza "[]" ou fica em branco
- Spinner genérico sem saber se é loading, error ou empty

**Detecção.**
```bash
grep -rn "class.*Boundary\|ErrorBoundary" src/           # existe?
grep -rn "z\." src/                                      # Zod usado?
grep -rn "isLoading\|loading &&" src/                    # loading states
```

**Regra violada.** Princípio 8 (resiliência por default).

**Correção.**
1. Criar `components/ErrorBoundary.tsx` e envolver `<main>` em `App.tsx`
2. Adicionar `zod` (ou valibot) e schema por form
3. Em toda lista: if `items.length === 0` → `<EmptyState>`
4. Em toda ação async: UI feedback de 3 estados (loading / error / success)

---

## AP-09 — Decisões sem ADR

**Sintoma.** README/CLAUDE.md menciona stack ou decisão ("usamos shadcn/ui", "aplicamos Clean Architecture") mas:
- A dependência nunca foi instalada
- Nenhum componente usa
- Novo dev/agente implementa caseiro achando que está seguindo

**Detecção.**
```bash
# Confrontar README/CLAUDE com package.json
cat README.md | grep -iE "shadcn|radix|zustand|react-query|zod"
cat package.json | jq '.dependencies'

# ADRs existem?
find . -path "*/adrs/*.md" -o -path "*/adr/*.md" 2>/dev/null
```

**Regra violada.** Princípio 9 (ADR).

**Correção.**
1. Para cada stack declarada e não adotada: decidir **adotar de verdade** ou **remover menção**
2. Decisão vira ADR em `.claude/adrs/` com Status: Accepted/Superseded/Rejected
3. CLAUDE.md só cita o que está operando

---

## AP-10 — Tokens dispersos

**Sintoma.** Cores hex em dezenas de lugares. Quando o brand muda:
- 37 arquivos tocados
- 3 esquecidos
- UI fica inconsistente

**Detecção.**
```bash
grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "index.css\|lib/colors" | wc -l
```
>10 é 🟡, >50 é 🔴.

**Regra violada.** Princípio 10 (tokens centralizados).

**Correção.**
1. Consolidar tokens em `index.css` como CSS vars (`--primary`, `--destructive`, `--surface-1`)
2. Substituir hex por `var(--token)` nos componentes
3. Paletas enumeradas (ex: 48 cores de cliente) vivem em `src/lib/colors.ts` e são importadas
4. Lint rule: proibir literais hex em `src/components/` e `src/pages/`

---

## Tabela-resumo para auditoria rápida

| # | Anti-padrão | Detecção em 1 linha | Severidade típica |
|---|-------------|---------------------|-------------------|
| AP-01 | Páginas gigantes | `find src/pages -name "*.tsx" -exec wc -l {} + \| sort -rn \| head` | 🔴 se > 500 LOC |
| AP-02 | Uma camada só | `ls src/components/` (sem subpastas) | 🔴 sempre |
| AP-03 | Sem governança de reuso | Existe `reuse-checker` ou check de review? | 🔴 em time 2+ |
| AP-04 | Camadas misturadas | `grep -rn "^type " src/pages src/components` | 🔴 se >5 matches |
| AP-05 | Estilo anárquico | Existe style guide? | 🔴 sem guide |
| AP-06 | Cobertura teatral | `npm run test:coverage` vs threshold | 🔴 se gap >20pp |
| AP-07 | Hooks não extraídos | `grep "addEventListener" src/components` | 🟡 2x, 🔴 3+ |
| AP-08 | Resiliência ausente | Tem ErrorBoundary? Zod em forms? | 🔴 sem Boundary |
| AP-09 | Decisões sem ADR | Stack declarada ≠ instalada | 🔴 divergência |
| AP-10 | Tokens dispersos | Hex fora de lib/ e index.css | 🟡 >10, 🔴 >50 |

---

## Um não-padrão que às vezes é aceitável

**"Componente grande por boa razão."** Se um componente tem 300 LOC mas a alternativa seria quebrar em 5 micro-componentes que só fazem sentido juntos, às vezes é melhor deixar. Regra: se a divisão aumenta o esforço mental de ler em vez de reduzir, não divida.

Essa exceção precisa de ADR: "ComponentX mantido com 300 LOC porque A, B, C".

---

## Uso em code review

Pergunte a si mesmo (ou ao autor do PR):
1. O arquivo ficou menor ou maior? (AP-01)
2. Tem tipo ou dado inline que deveria estar em `types/` ou `data/`? (AP-04)
3. Tem padrão visual que já existe em outro componente? (AP-03)
4. Tem `style={{...}}` estático ou hex hardcoded? (AP-05, AP-10)
5. Tem `addEventListener` que poderia ser hook? (AP-07)
6. Tem teste correspondente? (AP-06)
7. Formulário tem validação? (AP-08)

Se responder "sim" a alguma — aponte no review. Um anti-padrão por PR não é fim de mundo; 5 por PR é sinal de que o código vai virar legado rápido.
