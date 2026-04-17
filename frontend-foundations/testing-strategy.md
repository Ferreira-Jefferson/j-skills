# Estratégia de Testes

> Pirâmide, quando usar cada nível, ferramentas, o que testar e o que **não** testar.

---

## Pirâmide

```
         /\
        /E2E\         ~10% — fluxos críticos end-to-end
       /------\
      / Integr \      ~20% — página + store, form + validação
     /----------\
    /    Unit    \    ~70% — componentes, hooks, stores, utils isolados
   /--------------\
```

### Por que esta proporção
- **UT são baratos e rápidos** (ms por teste)
- **IT detectam contratos** entre camadas
- **E2E detectam regressões de fluxo** mas são lentos e frágeis — economize

---

## Nível 1 — Unit Tests

**Ferramenta.** Vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom.

**O que testar.**

### Componentes primitivos (`ui/`)
- Renderiza com props obrigatórias
- Responde a eventos principais (click, change, submit)
- Aplica variantes visualmente distintas (assert por classe ou atributo)
- Respeita `disabled`, `required`, `aria-*`

```ts
describe('Button', () => {
  it('renders label', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })
  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>X</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### Compostos de domínio (`domain/`)
- Renderiza dados do tipo de domínio correto
- Dispara callbacks de interação (onSelect, onDelete, onCopy)
- Adapta-se a variações de props (size, selected)

### Hooks
- Retorno inicial
- Reage a mudança de dep
- Cleanup roda (listeners removidos)

```ts
describe('useClickOutside', () => {
  it('calls handler on outside click', () => {
    const handler = vi.fn()
    function Comp() {
      const ref = useRef<HTMLDivElement>(null)
      useClickOutside(ref, handler)
      return <div ref={ref}>inside</div>
    }
    render(<Comp />)
    fireEvent.mouseDown(document.body)
    expect(handler).toHaveBeenCalledOnce()
  })
})
```

### Stores
- Estado inicial
- Cada action muda estado esperado
- Edge cases (remover o selecionado deseleciona, etc)

```ts
describe('client-store', () => {
  beforeEach(() => {
    useClientStore.setState({ clients: [], selectedClientId: null })
  })
  it('adds client with id + createdAt', () => {
    useClientStore.getState().addClient({ name: 'Acme', color: '#FF0000' })
    expect(useClientStore.getState().clients[0]).toMatchObject({
      name: 'Acme',
      color: '#FF0000',
    })
    expect(useClientStore.getState().clients[0].id).toBeTruthy()
  })
})
```

### Utils (`lib/`)
- Casos normais
- Edge cases (input vazio, null, valores extremos)

---

## Nível 2 — Integration Tests

**Ferramenta.** Vitest + Testing Library com múltiplos componentes/stores (sem mockar stores).

**O que testar.**
- Página renderiza e reage a interação real com store
- Formulário → validação → submit → store atualizada → UI reflete
- Fluxos multi-step dentro de uma mesma tela

```ts
describe('HomePage integration', () => {
  beforeEach(() => {
    useProductStore.setState({ products: [], selectedProduct: null })
  })
  it('creates product and shows it in the list', async () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /Novo produto/i }))
    await userEvent.type(screen.getByLabelText(/Nome do Produto/i), 'Café')
    /* ... preencher form ... */
    await userEvent.click(screen.getByRole('button', { name: /Criar Produto/i }))
    expect(await screen.findByText('Café')).toBeInTheDocument()
  })
})
```

**Não teste.** Navegação entre rotas de verdade (use `MemoryRouter`), chamadas HTTP reais (use MSW quando tiver).

---

## Nível 3 — E2E

**Ferramenta.** Playwright (ou Cypress).

**O que testar.** Apenas **smoke** e **fluxos críticos** — aqueles em que falha = usuário bloqueado de usar o produto.

Lista típica:
1. App carrega sem erro
2. Navegação entre páginas principais funciona (nenhuma crasha)
3. 1-2 fluxos críticos de domínio (ex: criar cliente → criar produto → ver persona)

```ts
test('app loads and nav works', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('nav')).toBeVisible()

  for (const path of ['/clients', '/products', '/settings']) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
  }
})
```

**Não E2E.** Validação de formulário field-by-field, edge cases de componente, lógica de store. Tudo isso é UT ou IT — mais rápido e mais estável.

---

## O que NÃO testar

- ❌ Implementação interna (que `useEffect` chamou X)
- ❌ Markup inteiro via snapshot — quebra em toda mudança estética
- ❌ Comportamento nativo do browser (`<input>` aceita texto)
- ❌ Bibliotecas externas (React, Zustand, Axios — eles têm seus próprios testes)
- ❌ Tipos só de TypeScript (typecheck cobre)

---

## Cobertura

**Regra:** threshold **≥80%** em statements, branches, functions, lines.

```ts
// vite.config.ts
test: {
  coverage: {
    provider: 'v8',
    thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    exclude: ['src/main.tsx', 'src/vite-env.d.ts', '**/*.d.ts'],
  },
},
```

**Mas cobertura ≥ teatro.** Ver [anti-patterns.md](anti-patterns.md) #AP-06. Testes que passam por artefato (match de string errada, teste no arquivo errado, assertions vazias) aumentam o %, não protegem contra nada.

### Validação de que a cobertura é real
1. Comente uma linha crítica de código — pelo menos 1 teste deve ficar vermelho
2. Mude um comparador `===` para `!==` — idem
3. Se nada quebra, a cobertura daquele arquivo é ilusão

---

## Setup recomendado

```ts
// tests/setup.ts
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// limpar DOM entre testes
afterEach(() => cleanup())

// mock consistente de clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn(() => Promise.resolve()) },
  configurable: true,
})

// mock localStorage não-persistente nos testes
// (opcional — depende se stores fazem hidratação no teste)
```

---

## CI gate

```yaml
# .github/workflows/ci.yml (ou equivalente)
jobs:
  frontend:
    steps:
      - run: npm ci
      - run: npm run lint         # 0 warnings
      - run: npm run typecheck    # 0 errors
      - run: npm run test:coverage # ≥80%
      - run: npm run build        # sucesso
      - run: npm run test:e2e     # smoke verde
```

Se qualquer step falhar, o CI barra o merge. Thresholds **não são sugestão**, são bloqueio.

---

## Cheatsheet: "Onde testar essa coisa?"

| Quero testar que... | Nível |
|---------------------|-------|
| Um botão dispara onClick | UT |
| Um hook limpa listener | UT |
| Store atualiza ao addProduct | UT |
| Função formatCurrency gera "R$ 10,00" | UT |
| Formulário valida e bloqueia submit inválido | UT ou IT (se cruza com store) |
| HomePage cria produto e mostra na lista | IT |
| App carrega em `/` sem crashar | E2E |
| Fluxo "criar cliente → produto → ver personas" | E2E |
| React renderiza `<div>` | Não teste |
| Axios faz POST | Não teste (teste quem chama, com MSW) |
