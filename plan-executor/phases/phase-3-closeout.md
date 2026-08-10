# FASE 3 — Encerramento

**Objetivo:** provar que o plano foi executado por completo, que o repositório está íntegro e que não sobrou lixo de orquestração.

**Quem executa:** o orquestrador.

## Passos

### 1. Suite global

Rodar na `[target-branch]` a suite **completa** do projeto + lint + typecheck + build (comandos descobertos na FASE 0). Esta é a única vez que a suite global roda — feature-agents rodaram apenas suas próprias provas.

Falha aqui = problema de integração entre features. Corrigir criando uma feature de correção com o ciclo completo da FASE 2 (plano → gate 1 → execução → gate 2 → commit). **Não** corrigir "no braço" fora do ciclo.

### 2. Cobertura do plano original

Item a item do plano `[plan-file]`, marcar onde foi entregue:

```
COBERTURA DO PLANO
  <item/seção do plano>  → FEAT-00N ✅
  <item/seção do plano>  → FEAT-00M ✅
  <item/seção do plano>  → NO-OP (já implementado): <evidência>
  <item/seção do plano>  → NÃO ENTREGUE: <motivo>
```

Qualquer item sem feature correspondente é reportado explicitamente — nunca omitido. `NO-OP` conta como coberto **desde que** a evidência esteja registrada; item marcado NO-OP sem evidência é tratado como não entregue. Se foi escopo cortado por escalação do usuário, registrar a decisão.

### 3. Auditoria de cleanup

```bash
git worktree list                                    # só o repo principal
git branch --list "feat/[plan-slug]-*"               # vazio
git branch -r --list "origin/feat/[plan-slug]-*"     # vazio
git status --porcelain                               # vazio
```

Sobra qualquer item → resolver antes de reportar conclusão. `--force`/`-D` só com aprovação humana (regra 15).

### 4. Atualizar artefatos da run

- `EXEC-MAP.md`: todas as features como `CONCLUÍDA`, com hash do commit
- `[run-dir]features/*.md`: cada `ACTION-PLAN.md` com a seção "Registro de execução" preenchida (evidência da prova + desvios)

### 5. Relatório final ao usuário

```
PLANO EXECUTADO — [plan-slug]

Modo: NORMAL | ENXUTO
Features: N concluídas / N planejadas (T1: a | T2: b | T3: c) — NO-OP: k itens já implementados
Waves: W (paralelismo máximo: P)
Agentes: O feature-owners | workers: P planners, I implementers, X fixers, R plan-reviewers (lotes T1: L), C code-reviewers
Adiamentos: <N features adiadas> | Revalidações entre waves: <N premissas quebradas → decisão>
Commits: <lista de hash + título>
Suite global: PASSING (X/X) | lint ✅ | typecheck ✅ | build ✅
Cobertura do plano: <N/N itens> (<NO-OPs e itens não entregues, se houver>)
Cleanup: worktrees ✅ branches ✅ working tree limpa ✅
Escalações no caminho: <lista ou "nenhuma">
Rejeições de review: <por feature, ou "nenhuma">

Próximos passos sugeridos (não executados): abrir PR para <base>, deploy.
```

### 6. Não executar além do plano

Não abrir PR, não fazer push para branch protegida, não deploy — **sugerir**. Ações de saída são decisão do usuário (regra 15).

## Critério de saída

- [ ] Suite global + lint + typecheck + build verdes na `[target-branch]`
- [ ] Todo item do plano mapeado a uma feature (ou reportado como não entregue, com motivo)
- [ ] Auditoria de cleanup limpa
- [ ] `EXEC-MAP.md` e ACTION-PLANs atualizados
- [ ] Relatório final exibido
