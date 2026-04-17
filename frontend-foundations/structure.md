# Estrutura de Diretórios

> Árvore completa, **responsabilidade de cada pasta** e regras de importação. Use quando estiver em dúvida sobre onde colocar um arquivo.

## Árvore completa

```
<projeto>/
├── .claude/                              # instruções, agentes, specs, ADRs
│   ├── agents/
│   │   └── reuse-checker.md              # invocado antes de criar código novo
│   ├── docs/
│   │   ├── FRONTEND_STYLE_GUIDE.md
│   │   └── ARCHITECTURE.md
│   ├── adrs/                             # ou dentro das specs
│   └── specs/                            # specs geradas pelo spec-creator
├── src/
│   ├── components/
│   │   ├── ui/                           # PRIMITIVOS (shadcn-like)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── domain/                       # COMPOSTOS DE DOMÍNIO
│   │   │   ├── ProductCard.tsx
│   │   │   ├── PersonaCard.tsx
│   │   │   └── ...
│   │   ├── layout/                       # SHELL
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ...
│   │   └── ErrorBoundary.tsx             # componente "global" não-UI
│   ├── pages/                            # uma página = uma rota
│   │   ├── HomePage.tsx                  # composição + handlers, ≤150 LOC
│   │   └── HomePage/
│   │       └── components/               # sub-componentes específicos desta página
│   │           ├── ProductDetailPanel.tsx
│   │           └── AIAnalysisAccordion.tsx
│   ├── hooks/                            # comportamento reutilizável
│   │   ├── useClickOutside.ts
│   │   ├── useEscapeKey.ts
│   │   └── useClipboard.ts
│   ├── lib/                              # utils genéricos
│   │   ├── utils.ts                      # cn, classe utilities
│   │   ├── colors.ts                     # paleta fixa (fonte única)
│   │   └── date.ts
│   ├── stores/                           # Zustand/Jotai/Redux
│   │   ├── client-store.ts
│   │   └── product-store.ts
│   ├── types/                            # contratos de domínio
│   │   ├── client.ts
│   │   ├── product.ts
│   │   └── index.ts                      # barrel
│   ├── data/                             # mocks, fixtures, enums de conteúdo
│   │   ├── personas.ts
│   │   └── platforms.ts
│   ├── services/                         # HTTP / SDK clients
│   │   └── api.ts
│   ├── config/                           # config runtime (env, flags)
│   │   └── index.ts
│   ├── App.tsx                           # provider + router, ≤80 LOC
│   ├── main.tsx
│   └── index.css                         # tokens globais + classes custom
├── tests/
│   ├── setup.ts
│   ├── unit/
│   │   ├── components/{ui,domain,layout}/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── lib/
│   │   └── pages/
│   └── e2e/
│       └── smoke.spec.ts
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── components.json                       # se usar shadcn CLI
└── README.md
```

---

## Responsabilidade de cada pasta

### `components/ui/` — Primitivos

**O que é.** Blocos básicos de UI sem lógica de domínio. Botões, inputs, dialogs, selects, labels, badges, avatars, tooltips.

**Origem preferida.** Geração via `shadcn-ui` CLI (Radix + Tailwind) — acessibilidade e API consagrada de graça. Alternativa: hand-rolled com API compatível (`<Button variant="destructive">`).

**O que NÃO pode ter.**
- Nenhum import de `stores/`, `data/`, `services/`, `types/` (exceto se tipos forem 100% UI, tipo `ButtonProps`)
- Nenhum texto hardcoded do domínio (ex: "Criar Produto" — isso é lugar do composto ou da página)
- Nenhuma decisão de negócio

**Imports permitidos.** `react`, `clsx`, `class-variance-authority`, `lucide-react` (ou ícones), `@/lib/utils`.

### `components/domain/` — Compostos de domínio

**O que é.** Componentes que consomem primitivos e agregam regras/tipos do negócio. `ProductCard` conhece `Product`, `PersonaCard` conhece `Persona`.

**O que pode ter.**
- Tipos de domínio importados de `@/types`
- Dados de `@/data` para enumerações fechadas (ex: lista de plataformas)
- Hooks de `@/hooks`
- Primitivos de `@/components/ui`

**O que NÃO pode ter.**
- Acesso direto a stores ou API — receba por props. Exceção: componentes "connected" bem definidos (ex: `<ClientSwitcher>` pode consumir `useClientStore` porque é essa sua função).
- Lógica de roteamento (é da página)

### `components/layout/` — Shell

**O que é.** Chrome da aplicação — sidebar, header, footer, toolbars globais.

**Pode consumir.** Primitivos, compostos, stores globais de layout (ex: sidebar colapsada).

### `pages/<Page>/components/` — Sub-componentes locais

**Regra.** Se o sub-componente é usado em 1 única página → fica em `pages/<Page>/components/`. Se passa a ser usado em 2+ → promover para `domain/` ou `ui/`.

### `hooks/` — Comportamento

Regra dos 2: na 2ª repetição de um mesmo comportamento inline, vira hook.

### `lib/` — Utilitários genéricos

Puras funções, sem React. `cn()`, `formatDate`, `clientColorBg`. Testáveis com vitest/jest sem renderização.

### `stores/` — Estado global

- Uma entidade de domínio por store (client-store, product-store)
- Persistência com chave estável (nunca mude o shape sem migration)
- Tipos importados de `@/types`

### `types/` — Contratos

Tipos de domínio, enums-literais (`type Platform = 'facebook' | 'google' | ...`). Sem lógica. Com `index.ts` barrel para import único.

### `data/` — Fixtures e enumerações de conteúdo

Dados que não mudam em runtime: lista de plataformas suportadas, personas demo, copy variants de exemplo. Tipados com types do `@/types`. Importados por componentes e páginas.

### `services/` — Clients externos

Axios/fetch wrappers, SDK clients, WebSocket setup. Retornam `Promise<Type>` usando tipos de `@/types`.

### `config/` — Configuração runtime

`import.meta.env` wrappers, feature flags, constantes derivadas do ambiente. Centralizar aqui evita `import.meta.env.VITE_XYZ` espalhado pelo código.

---

## Fluxo de dependência (acíclico)

```
pages → components/{ui,domain,layout}
pages → hooks → stores → services → types
pages → data → types
components/domain → components/ui
components/domain → types, data, hooks
components/layout → components/{ui,domain}
components/ui → lib
lib → (nada)
types → (nada)
```

**Regra crítica:** nenhuma seta inversa. `components/ui/button.tsx` NUNCA importa de `components/domain/` ou `pages/`. Se parece que precisa, repense o design.

---

## Tests mirror structure

Cada arquivo em `src/` tem correspondente em `tests/unit/` no **mesmo caminho relativo**:

- `src/components/ui/button.tsx` → `tests/unit/components/ui/Button.test.tsx`
- `src/hooks/useClipboard.ts` → `tests/unit/hooks/useClipboard.test.ts`
- `src/stores/client-store.ts` → `tests/unit/stores/client-store.test.ts`

Facilita encontrar o teste a partir do arquivo e vice-versa.

---

## Design System (tokens em `index.css`)

```css
:root {
  /* Superfícies */
  --background:   #09090B;
  --card:         #0F0F12;
  --popover:      #141418;

  /* Brand */
  --primary:              #F59E0B;
  --primary-foreground:   #0A0A0C;

  /* Estados */
  --destructive:          #F43F5E;
  --success:              #10B981;
  --warning:              #FB923C;

  /* Texto */
  --foreground:   #FFFFFF;   /* t1 */
  --muted:        #9898A8;   /* t3 */

  /* Borders */
  --border:       rgba(255,255,255,0.08);
  --input:        rgba(255,255,255,0.08);
  --ring:         rgba(245,158,11,0.22);

  /* Raio */
  --radius: 0.625rem;
}
```

Todo componente consome `var(--primary)`, nunca `#F59E0B`. Designer muda o brand → 1 edição → app inteira propaga.

---

## Onde colocar cada coisa (FAQ)

| "Preciso de um..." | Vai em |
|--------------------|--------|
| Botão genérico | `components/ui/button.tsx` |
| Card mostrando um Produto | `components/domain/ProductCard.tsx` |
| Modal específico só da página Home | `pages/HomePage/components/CloneToClientDialog.tsx` |
| Sidebar | `components/layout/Sidebar.tsx` |
| Hook para detectar clique fora | `hooks/useClickOutside.ts` |
| Função `formatCurrency` | `lib/format.ts` |
| Tipo `Product` | `types/product.ts` |
| Lista das 3 personas demo | `data/personas.ts` |
| Cliente HTTP para `/api/products` | `services/api.ts` |
| `productApi.list()` call | `services/api.ts` (retorna) → `stores/product-store.ts` (consome) |
| Paleta de 48 cores para escolher cor de cliente | `lib/colors.ts` |
| Variável de ambiente `VITE_API_URL` | `config/index.ts` |

Se sua resposta precisou olhar 2 pastas ao mesmo tempo, você provavelmente está criando algo que viola o fluxo de dependência. Repense.
