# Regras de Estilo

> Quando usar inline, Tailwind, cva ou classe custom — 5 regras escritas.

---

## As 5 regras

### 1. Tokens vivem em `index.css`
CSS custom properties definem tudo que muda com marca/tema: cores, radius, typography scale, spacing tokens, shadows.

```css
:root {
  --primary:      #F59E0B;
  --destructive:  #F43F5E;
  --radius:       0.625rem;
  --surface-1:    #0F0F12;
}
```

Componentes consomem via `var(--token)`, **nunca** literais hex/rgba.

### 2. Tailwind utility é a primeira opção
Para layout, espaçamento, tipografia estática, responsividade, estados nativos (hover/focus/disabled).

```tsx
<div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-zinc-800">
```

Se 80% do seu CSS cabe em utilities, está bem.

### 3. `cva` (class-variance-authority) para variantes de primitivo
Quando um componente tem 2+ variantes (size, variant, tone), use `cva`.

```tsx
const buttonVariants = cva('base classes here', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-white',
      ghost: 'hover:bg-accent',
    },
    size: { sm: 'h-8 px-3', default: 'h-10 px-5', lg: 'h-12 px-8' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
```

Esse padrão é o que o shadcn usa — fica pronto para adotar shadcn depois se quiser.

### 4. Classe custom (`.my-card`) só para design system reutilizado 3+ vezes
Padrões complexos de design system que apareceriam em muitos utilities Tailwind espalhados. Ficam em `index.css` documentados.

```css
.forge-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: border-color 200ms, box-shadow 200ms, transform 200ms;
}
.forge-card:hover { border-color: var(--border-strong); }
```

Regra dos 3: só cria classe custom quando o padrão está em **3+ lugares reais**. Senão é Tailwind.

### 5. `style={{}}` inline exclusivamente para valores dinâmicos
Derivados de props/state em runtime. Jamais para padrões estáticos.

```tsx
// ✅ OK — valor vem de props
<div style={{ backgroundColor: client.color }} />

// ✅ OK — posição calculada
<div style={{ transform: `translateX(${offset}px)` }} />

// ❌ NÃO — estático, deveria ser Tailwind ou classe
<div style={{ padding: '20px', backgroundColor: '#0F0F12' }} />
```

---

## Resumo decisório

```
Preciso estilizar ALGO. O valor é...

  ├── Token de design (cor brand, radius, spacing)?
  │   └── use var(--token) em Tailwind arbitrary value OU em classe custom
  │
  ├── Layout ou utility simples (flex, gap, padding)?
  │   └── Tailwind utility direto
  │
  ├── Variante de um primitivo (Button variant/size)?
  │   └── cva
  │
  ├── Padrão complexo usado em 3+ lugares?
  │   └── Classe custom em index.css, documentada
  │
  ├── Valor dinâmico (prop/state)?
  │   └── style={{}} inline
  │
  └── Nada acima?
      └── Provavelmente Tailwind utility
```

---

## Lint rules sugeridas

Para forçar essas regras automaticamente:

### Proibir hex fora de paths permitidos
ESLint custom rule ou grep no CI:
```bash
# CI step
! grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "lib/colors\|index.css"
```

### Proibir `style={{}}` estático
Regra `eslint-plugin-react` `react/forbid-dom-props` com config para apontar padrões suspeitos:
```json
{
  "react/forbid-component-props": ["warn", {
    "forbid": [{ "propName": "style", "message": "Use Tailwind ou cva para padrões estáticos" }]
  }]
}
```
(Aviso, não erro — permite uso dinâmico.)

---

## Antipattern radar

- **Duplicar tokens em vários componentes.** Se `#F59E0B` aparece em 3 componentes, é bug.
- **Classes custom abandonadas.** `.forge-thing-v2` usada em 1 lugar — provavelmente deveria virar inline ou Tailwind.
- **`!important` em classes custom.** Sinal de que a especificidade/ordenação está errada; reescreva.
- **Tailwind arbitrary value abusivo.** `text-[13.5px]` em 1 lugar é OK; em 10 lugares deveria virar token ou classe.

---

## Documentação viva

Este documento é espelho de `.claude/docs/FRONTEND_STYLE_GUIDE.md` do projeto. Quando algo mudar em um, atualize o outro.

Toda decisão não óbvia aqui (ex: "por que cva em vez de enum de classes") vira ADR.
