# FASE 7 — START.md (Handoff para Implementação)

Gere automaticamente (sem pedir aprovação) `.claude/specs/[feature-name]/START.md`.

Este é o **ponto de entrada único** para a sessão de implementação que vai consumir esta spec. A skill `spec-creator` termina aqui — a implementação acontece em sessão separada usando o START.md como guia.

## O que START.md deve conter

1. **Identidade** — Feature ID, nome, status (`spec-ready`), pasta da spec, datas (criação)
2. **Resumo** — 2 frases: o que faz e por que existe
3. **Agentes da spec** — Tabela apontando para os 3 agentes materializados em `.claude/specs/[feature-name]/agents/`:
   - `orchestrator.md` — coordena
   - `code-reviewer.md` — revisa cada task
   - `developer.md` — implementa cada task
4. **Documentos de Referência** — Tabela com todos os docs e ordem de leitura (SPEC → REQUIREMENTS → DESIGN → TEST-PLAN → TASKS → REVIEW-FINAL)
5. **Stack e Ambiente** — Tecnologias, variáveis de ambiente, comandos de setup (baseados no que foi observado na FASE 0)
6. **Convenções do Projeto (vinculantes)** — Bloco transcrito **literalmente** do CONTEXT.md (FASE 0): formato de commit, hooks, error-memory, regras de migration, operações destrutivas, etc. Os agentes da spec **não podem** desviar destas regras.
7. **Worktree e Branch** — Comando exato para criar worktree e branch dedicada desta feature; branch do orquestrador para merge final
8. **Plano de Execução do Orquestrador** — Waves de paralelismo derivadas do TASKS.md (com verificação de colisão de arquivos)
9. **Plano de Implementação** — Lista de todas as tasks com status `pendente`. Indica TASK-001 como próxima a iniciar
10. **Definition of Done** — Bloco transcrito do REQUIREMENTS.md; o orquestrador valida no fim
11. **Protocolo de Execução** — Como o orquestrador opera (refere `agents/orchestrator.md` da spec)
12. **Contexto de Negócio** — Branch do orquestrador (merge target), ambiente alvo, solicitante, objetivo

## Protocolo de execução (a ser seguido na sessão de implementação)

### Papel do Orquestrador

O orquestrador é um **agente formal** definido em `@.claude/skills/spec-creator/agents/orchestrator.md`. Ele é o agente principal da sessão de implementação — **não implementa tasks**, apenas coordena, gateia e regula os agentes que as implementam.

**Responsabilidades resumidas** (definição completa no arquivo do agente):

1. Ler o TASKS.md e construir o plano de waves de paralelismo
2. Spawnar agentes desenvolvedores em paralelo (1 por task, cada um em seu worktree)
3. Após cada task, **acionar o code-reviewer** (`@.claude/skills/spec-creator/agents/code-reviewer.md`) com o prompt obrigatório de revisão sênior
4. Decidir com base no veredicto do reviewer:
   - APROVADO → merge na branch do orquestrador
   - REJEITADO → re-acionar agente da task com feedback (até 3×)
   - ESCALAR → consultar humano
5. Avançar para WAVE N+1 apenas quando 100% das tasks da WAVE N estão merged + aprovadas
6. Ao final, rodar a suite completa e atualizar o `START.md`

**Regras invioláveis** (o agente formal lista todas; aqui as essenciais):
- Nunca avança wave com task pendente ou rejeitada
- Nunca faz merge sem teste passando + reviewer aprovando
- Nunca pula a fase de code-review

### Git Worktree — Ambiente de trabalho isolado

Cada agente de implementação opera em seu próprio **git worktree**, permitindo trabalho paralelo sem conflitos de estado:

```bash
# Criar worktree para esta feature (antes da TASK-001)
git worktree add ../[repo]-[feature-name] -b feature/feat-NNN-kebab-name

# Trabalhar dentro do worktree
cd ../[repo]-[feature-name]
```

- Cada agente tem seu diretório próprio — sem stash, sem troca de branch
- Múltiplos agentes podem rodar em paralelo, cada um em seu worktree e branch dedicada
- O worktree compartilha o `.git` do repositório principal — commits aparecem para todos

### Merge na branch principal do orquestrador

Ao concluir todas as tasks e **passar em todos os testes**:

```bash
# De dentro do worktree da feature
git push origin feature/feat-NNN-kebab-name

# Voltar ao repositório principal e fazer merge
cd ../[repo-principal]
git merge --no-ff feature/feat-NNN-kebab-name -m "feat(NNN): merge feature X"

# Limpar o worktree após o merge
git worktree remove ../[repo]-[feature-name]
git branch -d feature/feat-NNN-kebab-name
```

**Regra:** nenhum agente faz merge sem que **todos os testes passem**. Se algum teste falhar, corrija na branch da feature antes de mergear.

### Fluxo completo do agente

O agente que consumir o START.md deve:
- Ler todos os docs de referência na ordem antes de agir
- Criar o worktree e a branch dedicada (`feature/feat-NNN-kebab-name`, `fix/fix-NNN-...`, etc.) antes da TASK-001
- Seguir TDD: teste falhando → código mínimo → teste passando → refatora → commit
- Executar **uma task por vez**, aguardando aprovação entre elas
- Perguntar SOMENTE se: docs se contradizem, decisão técnica não coberta, ambiente ambíguo, ou risco de perda de dados
- Atualizar a seção "Plano de Implementação" marcando tasks concluídas a cada sessão
- Ao finalizar: rodar suite de testes completa → merge na branch do orquestrador → remover worktree

## Princípio de geração

Gere o START.md baseado no que FOI OBSERVADO no projeto e nas fases anteriores desta spec.
Não copie templates genéricos — o documento deve refletir a realidade da feature e do projeto.

Todas as tasks começam como **pendentes** (nenhuma concluída), pois esta skill não implementa.

## Após gerar

> *"Spec completa e pronta para implementação. Artefatos em `.claude/specs/[feature-name]/`. Para implementar em uma nova sessão, envie: 'use `.claude/specs/[feature-name]/START.md`' — o agente seguirá o plano task por task."*
