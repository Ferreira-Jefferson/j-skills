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
- `@caminho/arquivo` — acesso direto na sessão de implementação
- `L42-L87` — intervalo de linhas para modificações
- `"novo arquivo"` — criações

**Por que importa:** com `@arquivo` mapeado, a sessão de implementação (que consumirá o START.md gerado na FASE 7) não precisa re-explorar a codebase — cada task sabe exatamente onde atuar.

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

## Mapa de Paralelismo (obrigatório ao final do TASKS.md)

Após listar todas as tasks, gere um **mapa de waves de execução** derivado das dependências:

```
WAVE 1 — Paralelo (sem dependências):
  TASK-001, TASK-002, TASK-003

WAVE 2 — Aguarda conclusão de WAVE 1:
  TASK-004 (depende de TASK-001)
  TASK-005 (depende de TASK-002, TASK-003)

WAVE 3 — Aguarda conclusão de WAVE 2:
  TASK-006 (depende de TASK-004, TASK-005)
```

**Regras do mapa:**
- Uma task entra em WAVE N se todas as suas dependências estão em waves anteriores
- Tasks sem dependências sempre ficam em WAVE 1
- Tasks que dependem de tasks de waves diferentes ficam na wave mais alta necessária
- O mapa é o input do orquestrador para decidir quais agentes spawnar em paralelo

**Regra crítica — sem colisão de arquivos por wave:**

Tasks da **mesma wave** NÃO PODEM modificar o mesmo arquivo. Cada wave roda em paralelo (worktrees independentes); duas tasks tocando o mesmo arquivo geram conflito de merge garantido.

Como verificar:
1. Listar os arquivos de cada task (campo "Arquivos a criar/modificar")
2. Para cada wave, conferir interseção entre conjuntos de arquivos das tasks dela
3. Se houver colisão: separar as tasks em waves diferentes (a que depender da outra fica na wave seguinte) OU quebrar a task em pedaços menores que tocam arquivos disjuntos

Documentar ao final do mapa: "Verificação de colisão de arquivos: ✅ nenhuma" ou listar e justificar cada decisão de separação.

## Saída e dispatch ao reviewer

Gere `.claude/specs/[feature-name]/TASKS.md` (com mapa de paralelismo ao final) e submeta ao **spec-reviewer** com o prompt obrigatório:

> *"Um desenvolvedor produziu o documento TASKS.md (FASE 5) para a feature [feature-name]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: cada task é atômica (1 commit)? Critérios de conclusão são verificáveis? Arquivos têm caminhos reais (sem placeholders)? Dependências não têm ciclo? Mapa de waves de paralelismo está correto? Aprovar ou pedir correções."*

- **APROVADO** → avançar automaticamente para FASE 6
- **REJEITADO** → corrigir os issues bloqueantes e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer

**Importante:** esta skill não implementa as tasks. A FASE 6 revisa a spec completa; a FASE 7 gera o START.md como handoff para uma sessão separada de implementação.
