# Templates

Skeletons prontos para copiar + adaptar. Todos em TypeScript + React 18 + Tailwind + cva. Adapte para Vue/Svelte/Angular se for o caso — a **estrutura mental** é a mesma, muda só a sintaxe.

| Arquivo | Para que serve |
|---------|----------------|
| [primitive.template.tsx](primitive.template.tsx) | Novo primitivo em `components/ui/` com variants via cva |
| [domain-component.template.tsx](domain-component.template.tsx) | Novo composto em `components/domain/` |
| [page.template.tsx](page.template.tsx) | Nova página em `pages/` (composição + handlers) |
| [hook.template.ts](hook.template.ts) | Novo hook em `hooks/` |
| [store.template.ts](store.template.ts) | Nova store Zustand em `stores/` |
| [error-boundary.template.tsx](error-boundary.template.tsx) | Error Boundary global |
| [form-with-zod.template.tsx](form-with-zod.template.tsx) | Formulário validado com Zod |
| [test-component.template.tsx](test-component.template.tsx) | Teste unitário de componente |
| [test-hook.template.ts](test-hook.template.ts) | Teste unitário de hook |
| [test-store.template.ts](test-store.template.ts) | Teste unitário de store |
| [adr.template.md](adr.template.md) | ADR (Architecture Decision Record) |

**Como usar.** Copie o template, renomeie e preencha. Os `TODO(author):` marcam pontos que precisam de decisão.
