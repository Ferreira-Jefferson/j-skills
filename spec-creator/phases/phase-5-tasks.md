# FASE 5 — TASKS.md (Tasks Atômicas)

> **Propósito:** Plano de execução. Cada task é auto-contida, verificável e gerará um commit atômico.

## O que cada task deve ter

- **ID e título** — TASK-NNN: descrição clara e objetiva
- **Tipo** — Infrastructure / Backend / Frontend / QA / Docs
- **Depende de** — Quais tasks devem estar concluídas antes
- **Arquivos a criar/modificar** — Caminhos REAIS do projeto com `@` para acesso direto, intervalos de linhas para modificações, `"novo arquivo"` para criações
- **Critérios de conclusão** — Checklist verificável (`[ ]` formato)
- **Testes associados** — IDs do TEST-PLAN vinculados

## Mapeamento de Arquivos

Após gerar o esqueleto, explore a codebase e substitua placeholders por caminhos reais:
- `@caminho/arquivo` — acesso direto na FASE 6
- `L42-L87` — intervalo de linhas para modificações
- `"novo arquivo"` — criações

**Por que importa:** com `@arquivo` mapeado, a FASE 6 não re-explora a codebase — cada task sabe exatamente onde atuar.

## Adaptação

- Agrupe tasks logicamente (Setup → Backend → Frontend → QA), mas número de grupos e tasks varia por feature
- Micro-feature: 2-3 tasks podem bastar
- Feature complexa: 15+ tasks com dependências explícitas entre grupos
- O resumo final (tabela grupo x tasks x estimativa) ajuda a visualizar escopo total

## Anti-padrões

- Tasks com mais de 1 responsabilidade — quebre em tasks menores
- Critérios de conclusão vagos: "implementar a feature" — não é verificável
- Placeholders genéricos (`@src/[caminho]`) em vez de caminhos reais mapeados
- Esquecer de vincular testes do TEST-PLAN a cada task

## Saída

Gere `.claude/specs/[feature-name]/TASKS.md` e pergunte:
> *"TASKS geradas e arquivos mapeados. Verifique se os caminhos fazem sentido. Posso iniciar a implementação?"*
