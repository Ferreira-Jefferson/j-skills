# EXEC-MAP — `[plan-slug]`

**Plano original:** `[plan-file]`
**Branch alvo:** `[target-branch]` | **Paralelismo máximo:** `[max-parallel]`
**Objetivo global:** <1 frase — o que o projeto passa a fazer depois deste plano>

**Comandos do projeto:** teste `<cmd>` | lint `<cmd>` | typecheck `<cmd>` | build `<cmd>`
**Convenção de commit:** `<formato>`
**Custo de worktree neste projeto:** baixo / alto (`<o que precisa instalar>`)

**MODO DA RUN:** NORMAL | ENXUTO — <justificativa: ex. "4 features, todas T1, sem paralelismo a mapear">

## Itens já implementados (NO-OP)

> Verificados na FASE 0 (regra 6). Não viram feature; contam como cobertos no relatório final.

| Item do plano | Evidência | 
|---------------|-----------|
| <item> | `<arquivo:linha>` / `<comando> → saída` |

## Features

| ID | Slug | Tier | Wave | Planejamento | Escreve | Consome | Prova de conclusão | Isolamento | Status |
|----|------|------|------|--------------|---------|---------|--------------------|------------|--------|
| FEAT-001 | <slug> | T1 | 1 | imediato (ESTÁVEL) | `a.ts`, `b.ts` | — | `<comando existente>` | worktree | pendente |
| FEAT-002 | <slug> | T2 | 1 | imediato (ESTÁVEL) | `c.ts` | — | `<comando/teste>` | worktree | pendente |
| FEAT-003 | <slug> | T3 | 2 | **adiado** — abre na wave 2: `<motivo>` | `d.ts` | FEAT-001:`<artefato>` | `<comando/teste>` + RED | worktree | pendente |

**Justificativa de tier** (obrigatória — sem ela o tier é T2):

| ID | Tier | Por quê |
|----|------|---------|
| FEAT-001 | T1 | 2 arquivos, sem lógica nova, prova já existe (`<comando>`) |
| FEAT-003 | T3 | altera schema `<tabela>` |

**Status possíveis:** pendente → planejando → plano em revisão → executando → em code review → CONCLUÍDA (`<hash>`) | rejeitada (N/2) | escalada | NO-OP

## Waves

```
WAVE 0 [orquestrador]  fundação compartilhada
WAVE 1 [paralelo: 2]   FEAT-001, FEAT-002
WAVE 2 [aguarda W1]    FEAT-003
```

### WAVE 0 — fundação (executada pelo orquestrador)

- [ ] <arquivo/pasta/boilerplate>
- [ ] <contrato/tipo compartilhado>
- [ ] <migration>
- [ ] <registro agregador: rotas / exports / i18n>
- [ ] <dependência nova / env var>
- [ ] build + typecheck verdes
- [ ] commit `chore([plan-slug]): fundação compartilhada (wave 0)`

## Serializações e o porquê

| Features | Motivo da serialização |
|----------|------------------------|
| FEAT-003 depois de FEAT-001 | consome `<artefato>` |
| FEAT-00X depois de FEAT-00Y | escrevem `<arquivo>` em comum (dono: FEAT-00Y) |
| FEAT-00Z na wave 2 | limite de `[max-parallel]` (não é dependência) |
| FEAT-00A e FEAT-00B inline em sequência | custo de worktree alto + ambas T1 (regra 9) |

## Pontos de colisão resolvidos

| Arquivo / comportamento | Features envolvidas | Tipo | Resolução |
|-------------------------|---------------------|------|-----------|
| `src/index.ts` | FEAT-001, FEAT-002 | física | WAVE 0 (entradas de ambas já registradas) |
| `migrations/` | FEAT-002, FEAT-003 | física | WAVE 0, ordem única |
| rota `POST /x` (arquivos diferentes) | FEAT-004, FEAT-005 | **semântica** | serializadas — ambas mudam o mesmo comportamento/prova |

## Features adiadas (planejamento just-in-time — regra 17)

| ID | Motivo do adiamento | Destrava quando | Premissa a confirmar na abertura |
|----|---------------------|-----------------|----------------------------------|
| FEAT-003 | consome `<artefato>` cuja assinatura FEAT-001 ainda pode mudar | FEAT-001 CONCLUÍDA | `<assinatura/shape esperado>` |

## Revalidação entre waves

> Preenchido no checkpoint de fechamento de cada wave (FASE 2, passo 8).

| Wave fechada | Desvio reportado | Feature afetada | Decisão |
|--------------|------------------|-----------------|---------|
| 1 | <desvio> | FEAT-003 | re-planejar / re-mapear / escalar / nenhuma premissa afetada |

## Lacunas do plano

| Lacuna | Tratamento |
|--------|------------|
| <o que o plano não responde> | resolvida lendo `<arquivo>`: <resposta> |
| <decisão em aberto> | escalada ao usuário → decisão: <...> |

## Cobertura do plano original

> Preenchido no encerramento (FASE 3).

| Item/seção do plano | Feature | Status |
|---------------------|---------|--------|
| <item> | FEAT-001 | ✅ |
