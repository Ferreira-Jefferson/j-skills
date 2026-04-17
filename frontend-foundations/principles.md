# Os 10 Princípios — Detalhamento

> Cada princípio tem **observação** (o que acontece quando ignorado), **regra** (o que fazer) e **teste** (como verificar).

---

## 1. Tamanho importa

**Observação.** Arquivos grandes não falham a compilação. Falham a cognição. Quando uma página passa de ~250 LOC, qualquer alteração vira arqueologia — 3 minutos de leitura para 30 segundos de mudança.

**Regra.**
- Componentes: **≤150 LOC** ideal, **≤250 LOC** máximo absoluto
- Páginas: composição + handlers, nada mais — **≤150 LOC**
- Hooks: uma responsabilidade, tipicamente **≤50 LOC**
- Stores: uma entidade de domínio por store — **≤100 LOC**

Se um arquivo cresce além disso, divida por **responsabilidade**, não por tamanho artificial. Sub-componente vai para `pages/<Page>/components/<Subcomponent>.tsx` quando específico daquela página.

**Teste.**
```bash
wc -l src/**/*.{ts,tsx} | sort -rn | head -20
```
Os primeiros 20 já contam a história do projeto.

---

## 2. Duas camadas de componentes

**Observação.** Sem separar primitivos (genéricos) de compostos (de domínio), tudo vira uma pasta `components/` com 547-LOC `ClientDialog` fazendo modal + color picker + form + acesso à store.

**Regra.**
- `components/ui/` — **primitivos** zero-domínio: `Button`, `Dialog`, `Input`, `Select`, `Label`, `Badge`, `Avatar`, `Textarea`. Idealmente vindos de **shadcn/ui** (ou similar) — acessibilidade de graça via Radix.
- `components/domain/` — **compostos** com lógica de negócio: `ProductCard`, `ClientAvatar`, `PersonaCard`, `StatusBadge`, `MetaField`. Consomem primitivos; conhecem tipos do domínio.
- `components/layout/` — **shell** da aplicação: `Sidebar`, `NavGroup`, `Header`. Consomem primitivos e compostos.
- `pages/<Page>/components/` — **sub-componentes específicos** daquela página. Não reutilizar fora.

**Teste.**
- `ui/` imports só de `react`, `clsx`, `cva`, `lib/utils` — nunca de `stores/`, `data/`, `types/`
- `domain/` pode importar `types/` e `ui/`, mas **nunca de `pages/`**

---

## 3. Reuso precisa de governança

**Observação.** "Eu vou checar se já tem antes de criar" não acontece sozinho. Em time pequeno ou com agentes, sem processo a duplicação cresce invisivelmente.

**Regra.**
- Tenha um **agente `reuse-checker`** (ou check de review) que responde: "antes de criar X, varra `ui/`, `domain/`, `hooks/`, `lib/`, `types/` e reporte matches"
- CLAUDE.md (ou docs do projeto) deve ter regra absoluta: **antes de criar componente/hook/tipo/utilitário, verifique existência prévia**
- Review humana checa: "isso já existe com outro nome?"

**Teste.**
Busca periódica por duplicações:
```bash
# Componentes com nomes suspeitos de duplicação
grep -rh "^export function\|^export const" src/components/ | sort | uniq -d

# Strings repetidas que poderiam ser constantes
grep -r "rgba(" src/components/ | wc -l
```

---

## 4. Camadas distintas (types / data / stores / hooks / UI)

**Observação.** Tipos inline em páginas (`type Campaign = { ... }` dentro de `CampaignsPage.tsx`) impedem reuso. Mocks colados em componentes dificultam trocar por API real. Cada mistura dessas é dívida futura certa.

**Regra.**
| Camada | Responsabilidade | Nunca importa |
|--------|------------------|---------------|
| `types/` | Contratos de domínio (Product, Campaign, Persona) | nada |
| `data/` | Mocks/fixtures tipados | `components/`, `pages/` |
| `services/` | Clients HTTP/SDK | `components/`, `pages/` |
| `stores/` | Estado + persistência (Zustand/Jotai/Redux) | `components/`, `pages/` |
| `hooks/` | Comportamento reutilizável | `components/`, `pages/` |
| `lib/` | Utils genéricos (cn, date, colors) | tudo acima |
| `components/` | UI | `pages/` |
| `pages/` | Composição + roteamento | — (topo da pirâmide) |

**Teste.**
```bash
# Nenhum type/interface de domínio inline em páginas
grep -rn "^type \|^interface \|^export type \|^export interface " src/pages/
# Deve retornar ZERO (tipos de prop local de sub-componentes são toleráveis mas idealmente zero)

# Nenhum array de mock > 3 itens em componentes
grep -rn "const [A-Z_]* = \[" src/components/
```

---

## 5. Estilo precisa de regra

**Observação.** Quando cada desenvolvedor decide sozinho se usa `style={{ ... }}`, Tailwind utility ou classe custom, o resultado é uma página usando 3 abordagens para o mesmo padrão visual.

**Regra de ouro (escrita em 5 linhas):**

1. **Tokens de design** vivem em `index.css` como CSS custom properties (`--primary`, `--bg`, `--t1`).
2. **Tailwind utility** é a primeira opção — layout, espaçamento, tipografia estática.
3. **`cva` (class-variance-authority)** para variantes de primitivo (`<Button variant="destructive" size="lg">`).
4. **Classe custom** (`.forge-card`) só para padrões complexos de design system reutilizados em 3+ lugares; documentada em `index.css`.
5. **`style={{...}}` inline** exclusivamente para valores **dinâmicos derivados de props/state** (`style={{ backgroundColor: client.color }}`).

**Teste.**
```bash
# Inline styles suspeitos (estáticos)
grep -rn "style={{" src/ | grep -v "color\|backgroundColor\|width\|height"
```

---

## 6. Cobertura real, não teatro

**Observação.** CI com threshold 80% + 4 testes escritos em inglês para uma UI em português = verde no CI e bug em produção. O número existe, o valor não.

**Regra.**
- **TDD**: teste escrito **antes** do componente, falhando primeiro
- Teste o **comportamento observável**, não a implementação (não teste "esse `useEffect` chama X")
- Prefira `getByRole`/`getByLabelText` sobre `getByTestId` — força acessibilidade
- Strings de UI em testes devem vir do **mesmo idioma** da UI real
- Snapshot tests só para árvore pequena e estável — não para markup inteiro

**Teste.**
```bash
npm run test:coverage
# v8 coverage ≥80% em statements / branches / functions / lines
```
E depois: sabote um componente (mude um comparador `===` para `!==`) — pelo menos um teste deve ficar vermelho. Se nenhum falhar, a cobertura é teatro.

---

## 7. Hooks são primitivos de comportamento

**Observação.** Lógica de `addEventListener('mousedown', ...)` para click-outside, `keydown` para Escape, `navigator.clipboard.writeText` — copiada inline em cada dialog/menu/popover da aplicação. Um bug de cleanup em um não aparece no outro.

**Regra.** Comportamento reutilizável vira hook **na primeira repetição** (regra dos 2).

Hooks essenciais que todo projeto frontend tem (ou terá):
- `useClickOutside(ref, handler, when?)`
- `useEscapeKey(handler, when?)`
- `useClipboard(resetMs?)` — retorna `{ copy, copied }`
- `useDebouncedValue(value, delay)`
- `useMediaQuery(query)`
- `useLocalStorage(key, initial)` (se não usando Zustand persist)

Ver [templates/hook.template.ts](templates/hook.template.ts).

**Teste.**
```bash
# Se aparece >1 vez, devia ser hook
grep -rn "addEventListener('mousedown'" src/components/
grep -rn "addEventListener('keydown'" src/components/
```

---

## 8. Resiliência por default

**Observação.** App React sem Error Boundary: uma exceção em qualquer componente derruba a tela inteira. Form sem Zod: usuário digita email inválido e o store guarda, o backend rejeita depois.

**Regra — lista mínima que todo projeto deve ter:**
- **ErrorBoundary global** envolvendo `<main>` em `App.tsx`, com fallback útil ("Algo deu errado. Recarregue.")
- **Validação de entrada com Zod** (ou valibot/yup) em todo formulário
- **Loading state** explícito em toda ação assíncrona (`{ loading: boolean, error: Error | null }`)
- **Empty state** em toda lista que pode estar vazia (não mostrar só "[]")
- **Skeleton** ou spinner para carregamento inicial
- **Hidratação resiliente**: stores persistidos devem funcionar com `localStorage` corrompido

Ver [templates/error-boundary.template.tsx](templates/error-boundary.template.tsx).

**Teste.**
- Sabote um componente com `throw new Error('boom')` — ErrorBoundary deve pegar
- Digite lixo no formulário — validação deve bloquear submit com mensagem clara
- Limpe `localStorage` com devtools — app não deve crashar na hidratação

---

## 9. Decisão sem ADR não existe

**Observação.** README diz "usamos shadcn/ui". Ninguém nunca instalou. Nova pessoa/agente vê a menção, implementa modal caseiro achando que está seguindo o padrão. O desejo virou dívida.

**Regra.**
- Toda decisão arquitetural não-óbvia vira **ADR** (Architecture Decision Record) em `.claude/adrs/` ou equivalente
- Template mínimo: Contexto → Opções → Decisão → Consequências
- "Adotar X" não é decisão — é intenção. Decisão é "adotar X via comando Y, primeiro uso em Z, prazo W"
- Revisar ADRs em retrospectivas — alguns vão virar "Superseded"

Ver template em [templates/adr.template.md](templates/adr.template.md).

**Teste.**
Leia o README/CLAUDE.md do projeto. Para cada tecnologia mencionada, verifique: instalada? importada? usada em produção? Se não, é desejo — migre para ADR com status "Rejeitada/Postponed" ou adote de verdade.

---

## 10. Tokens de design centralizados

**Observação.** `backgroundColor: '#F59E0B'` em 12 lugares. Quando o designer muda o amarelo da marca, você edita 12 arquivos, esquece 2, a app fica inconsistente.

**Regra.**
- Cores brand, estados, tipografia, espaçamento, radius, shadows vivem como **CSS custom properties** em `index.css` (ou equivalente no framework de estilo)
- Nome semântico sempre que possível: `--primary`, `--destructive`, `--surface-1`. Nome cru (`--ember`) é aceitável se tem história/branding
- Tailwind v4 consome tokens via `@theme` (nativo). Tailwind v3 via `theme.extend.colors` no config
- **Zero hex/rgba hardcoded** em componentes — exceção única: `lib/colors.ts` para paletas enumeradas (ex: paleta de cores de cliente)

**Teste.**
```bash
# Hex fora de index.css e lib/
grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts" | grep -v "lib/colors\|index.css"
# Deve retornar ZERO
```

---

## Resumo operacional

Todos os princípios convergem para **uma ideia**: frontend de qualidade é uma soma de pequenas disciplinas aplicadas **consistentemente**. Nenhuma é difícil. Todas são fáceis de pular "só essa vez". É pular consistentemente que cria legado.

Cheque sua equipe/você contra os testes desta página uma vez por sprint. Os números não mentem.
