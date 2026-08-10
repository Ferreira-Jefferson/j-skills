# FASE 2 — Ciclo por Feature (wave por wave)

**Objetivo:** entregar cada feature do `EXEC-MAP.md` com dois gates de agente independente, gastando por feature o que o tier dela justifica.

**Quem executa:** o orquestrador abre as waves e spawna **um `feature-owner` por feature**; o owner delega cada etapa a um worker novo (regra 16).

## Árvore de execução (regra 16)

```
orquestrador (nível 0) — só waves, veredictos e quadro de progresso
  └ feature-owner [FEAT-ID] (nível 1) — coordena a feature, não escreve nada
      ├ feature-agent MODO: PLANO      (planner)
      ├ plan-reviewer                   ← gate 1, passada única (lote em T1)
      ├ feature-agent MODO: EXECUÇÃO   (implementer — agente NOVO, lê só o plano liberado)
      ├ code-reviewer                   ← gate 2, individual, máx. 2 tentativas
      └ feature-agent MODO: CORREÇÃO   (fixer — agente NOVO, só as issues bloqueantes)
```

Nível 3 é proibido: worker não spawna worker. Se o runtime não permitir spawn aninhado, o owner emite `DELEGAR:` e o orquestrador spawna em nome dele — a árvore lógica não muda.

## O ciclo (por feature)

```
1. PLANO     planner        → checa estado atual + ACTION-PLAN.md (passos + prova + premissas)
2. GATE 1    plan-reviewer  → revisa, CORRIGE e libera        ← passada única, em lote se T1
3. EXECUÇÃO  implementer    → executa o plano liberado + roda a prova
4. GATE 2    code-reviewer  → revisa a execução               ← individual, máx. 2 tentativas
5. COMMIT    feature-owner  → commit + feature CONCLUÍDA
```

Nenhuma etapa é opcional e nenhuma é reordenável. O que o tier altera é **como** o gate 1 é aplicado (individual ou em lote), se planner e implementer são o mesmo worker (só T1/enxuto) e se há RED obrigatório — nunca a existência dos gates.

## Modo enxuto (quando o `EXEC-MAP.md` declarou)

Execução sequencial na `[target-branch]`, sem worktree e **sem feature-owner** — o orquestrador coordena direto:

1. 1 worker `MODO: PLANO` escreve **todos** os `ACTION-PLAN.md` (um por feature), sem tocar em código;
2. 1 `plan-reviewer` revisa e corrige os planos numa passada (gate 1 em lote);
3. **1 worker `MODO: EXECUÇÃO` por feature**, em sequência — agente novo a cada feature, lendo só o plano dela (é o que impede o contexto de crescer de uma feature para a outra);
4. 1 `code-reviewer` revisa o diff completo, feature a feature (gate 2), no final;
5. rejeição → 1 worker `MODO: CORREÇÃO` novo; 2ª rejeição → escalar.

Modo enxuto só é válido quando todas as features são ESTÁVEIS (regra 17). Uma única ADIADA derruba o modo enxuto — ela precisa do checkpoint de wave.

Se qualquer feature subir de tier no meio, pare o modo enxuto e siga o fluxo normal a partir da feature seguinte.

## WAVE 0 (só uma vez, antes da primeira wave de agentes)

O orquestrador executa a fundação definida na FASE 1: boilerplate, contratos, agregadores, migrations, dependências, env vars. Ao terminar:

1. Rodar build/typecheck do projeto — a fundação não pode entrar quebrada
2. Commit único: `chore([plan-slug]): fundação compartilhada (wave 0)`
3. Exibir o quadro de progresso

Feature-agent **nunca** cria boilerplate compartilhado.

## Execução de uma wave

### 1. Preparar isolamento

Para cada feature da wave em modo worktree:

```bash
git worktree add ../[repo]-[FEAT-ID] -b feat/[plan-slug]-[FEAT-ID]
```

Se o projeto exigir instalação de dependências no worktree, isso é parte do preparo — e é exatamente o que a exceção da regra 9 evita quando a wave é pequena e T1.

### 2. Abrir a wave: liberar o planejamento das features ADIADAS

Antes de spawnar qualquer coisa, faça o **checkpoint de abertura** (regra 17) para cada feature da wave marcada como ADIADA:

- releia a linha dela no `EXEC-MAP.md` e os **desvios** registrados pelas features já concluídas;
- confirme se o motivo do adiamento foi resolvido (o artefato a montante existe na forma esperada?);
- se a realidade divergiu do que a feature assumia, **atualize a linha do `EXEC-MAP.md`** (arquivos, prova, dependências) antes de liberar o planejamento — o planner precisa nascer com a informação certa;
- se a divergência muda a natureza da feature (escopo, contrato, decisão), **escale** em vez de liberar.

Só depois disso a feature vira planejável.

### 3. Spawnar os feature-owners em paralelo

Um `feature-owner` por feature, respeitando `[max-parallel]`. **Briefing mínimo (≤ 8 linhas)** — as regras vivem em `[run-dir]agents/feature-owner.md`, não no briefing:

```
Você é o feature-owner definido em [run-dir]agents/feature-owner.md — leia-o primeiro.
Feature: [FEAT-ID] <slug> (tier T?)
Plano original: [plan-file] (seções: <quais>)
Mapa: [run-dir]EXEC-MAP.md
ACTION-PLAN: [run-dir]features/[FEAT-ID]-<slug>.md
Worktree: ../[repo]-[FEAT-ID] (branch feat/[plan-slug]-[FEAT-ID])
Premissas a montante já confirmadas: <lista curta ou "nenhuma">
```

**Não** repetir regras de plano/prova/review no briefing. **Não** passar features de outros agentes, diff, log ou raciocínio de ninguém — só caminhos (regra 16). Ordem do prompt: parte comum primeiro, específico por último (aproveita prompt cache entre spawns próximos).

> Se o runtime não permitir spawn aninhado, os owners emitirão `DELEGAR:` — o orquestrador spawna o worker pedido e devolve **só** o veredicto/artefato ao owner. Nunca repasse o conteúdo produzido, só o caminho e o resultado.

### 4. Gate 1 — revisão do plano de ação (passada única)

- **T2/T3:** quando o planner sinaliza `PLANO PRONTO`, o `feature-owner` spawna **imediatamente** um `plan-reviewer` para aquela feature (event-driven — não espera os outros planos).
- **T1:** a revisão em lote é coordenada pelo **orquestrador**, que acumula os planos T1 prontos da wave (até 4) e spawna **um** `plan-reviewer` para o lote — os owners repassam `PLANO PRONTO` e aguardam. Se só houver 1 plano T1 e a wave já não tiver outros pendentes, revisa esse sozinho; não espere ociosamente.

Inputs do reviewer: `ACTION-PLAN.md` (ou os do lote), seções relevantes do plano original, linha(s) da(s) feature(s) no `EXEC-MAP.md`. Prompt obrigatório de senior (definido em `plan-reviewer.md`).

Veredictos:
- **APROVADO** → o owner spawna o implementer
- **CORRIGIDO** → o reviewer já ajustou o `ACTION-PLAN.md` **e liberou**; o owner spawna o implementer, que lê o plano corrigido do disco. **Não há nova revisão.**
- **ESCALAR** → owner reporta, orquestrador pausa a feature e consulta o usuário

O gate 1 não reabre. Se o implementer apontar erro factual na correção, o caminho é `ESCALAR`, não uma segunda rodada.

### 5. Execução

O owner spawna um **implementer novo** (`feature-agent` em `MODO: EXECUÇÃO`), que começa com contexto limpo e lê **só** o `ACTION-PLAN.md` liberado — não herda a exploração do planner. Ele executa passo a passo, roda a prova e captura a saída literal. Execução não é exploração (regra 13): descoberta ampla ou troca de abordagem = plano errado → registrar e escalar, não tentar variações.

### 6. Gate 2 — code review (sempre individual)

Quando o implementer sinaliza `EXECUÇÃO CONCLUÍDA`, o owner spawna um `code-reviewer` (contexto limpo). Inputs **por caminho**: `ACTION-PLAN.md` liberado, comando do diff da branch, evidência da prova, lista de commits.

- **APROVADO** → segue para o commit final / merge
- **REJEITADO** → o owner spawna um **fixer novo** (`MODO: CORREÇÃO`) com o plano + as issues bloqueantes (tentativa 1/2). O implementer rejeitado não volta — agente novo, contexto novo, sem defender o próprio trabalho. **2ª rejeição da mesma feature → ESCALAR automático.**
- **ESCALAR** → pausa e consulta o usuário

### 7. Commit e conclusão da feature

Após APROVADO:

```bash
# dentro do worktree da feature
git pull --rebase origin [target-branch]
<comando-de-teste-do-projeto>        # quebrou? volta ao feature-agent, não mergeia

# no repo principal
git checkout [target-branch]
git merge --no-ff feat/[plan-slug]-[FEAT-ID] -m "feat([plan-slug]): [FEAT-ID] <slug>"

# cleanup obrigatório
git worktree remove ../[repo]-[FEAT-ID]
git branch -d feat/[plan-slug]-[FEAT-ID]

# verificar
git worktree list | grep -q "[FEAT-ID]" && echo "ERRO: worktree órfão" && exit 1
git branch --list "feat/[plan-slug]-[FEAT-ID]" | grep -q . && echo "ERRO: branch órfã" && exit 1
```

Modo inline/enxuto: o worker já commitou em `[target-branch]`; não há merge nem cleanup.

Depois: marcar a feature como `CONCLUÍDA` no `EXEC-MAP.md` e exibir o quadro.

### 8. Fechar a wave: checkpoint de revalidação (obrigatório)

A wave N+1 só inicia quando **todas** as features da wave N estão CONCLUÍDAS (merged + cleanup verificado). Feature rejeitada, escalada ou pendente **bloqueia** o avanço.

Antes de abrir a wave seguinte, o orquestrador roda o **checkpoint da regra 17** — barato, feito só com brief reports (nunca com diff):

1. Junte os **desvios** reportados pelos owners da wave que fechou (`Desvios relevantes para features seguintes`).
2. Compare cada desvio com as **premissas a montante** declaradas nas features das waves seguintes.
3. Para cada premissa quebrada, escolha:
   - **re-planejar** — a feature volta a `pendente`; o plano dela (se já existia) é **descartado**, não remendado, e um planner novo será spawnado na abertura da wave dela;
   - **re-mapear** — a mudança altera arquivos/dependências: refaça o teste de disjunção dessa feature (pode mudar de wave);
   - **escalar** — a mudança altera escopo, contrato ou decisão do plano original.
4. Registre o resultado no `EXEC-MAP.md` (seção "Revalidação entre waves") e mostre no quadro de progresso.

Sem desvios reportados, o checkpoint é uma linha: `revalidação: nenhuma premissa afetada`. Ele nunca é pulado — é o que impede a wave N+1 de executar em cima de um mundo que mudou.

## Quadro de progresso (exibir após CADA evento de agente)

```
PROGRESSO — [plan-slug] (evento: FEAT-003 plan-reviewer liberou)

WAVE 0 ✅ fundação commitada

WAVE 1 🔄 em andamento
  ✅ FEAT-001 add-auth-guard      [T1] concluída (commit a1b2c3d)
  🔍 FEAT-002 add-session-store   [T2] execução concluída — em code review
  ▶️ FEAT-003 add-login-form      [T2] plano liberado — executando
  📝 FEAT-004 add-logout-route    [T1] escrevendo plano de ação

WAVE 2 ⏳ pendente
  🕓 FEAT-005 wire-auth-e2e       [T3] ADIADA — plano só abre quando FEAT-001/002 fecharem

NO-OP: <item do plano já implementado> (evidência: <arquivo:linha>)
Revalidação da última wave: <nenhuma premissa afetada | FEAT-005 re-planejar: <premissa quebrada>>
Próxima ação: aguardando code-reviewer de FEAT-002.
```

**Legenda:** 📝 escrevendo plano | 🧐 plano em revisão | ▶️ executando | 🔍 em code review | ✅ concluída | ❌ rejeitada (N/2) | 🚨 escalada | ⏳ pendente | 🕓 adiada (planejamento bloqueado por premissa a montante)

## Regras invioláveis da fase

- **Nunca** deixa um implementer começar antes do gate 1 liberar
- **Nunca** reusa um worker entre etapas — cada etapa é agente novo, contexto mínimo (regra 16)
- **Nunca** planeja feature ADIADA antes da wave dela abrir (regra 17)
- **Nunca** abre a wave N+1 sem o checkpoint de revalidação
- **Nunca** commita feature sem gate 2 aprovado e prova executada com evidência
- **Nunca** o orquestrador implementa feature (só a WAVE 0)
- **Nunca** o mesmo agente escreve e revisa o mesmo artefato
- **Nunca** reabre o gate 1 para nova rodada (correção já é liberação; divergência é escalação)
- **Nunca** passa de 2 tentativas no gate 2
- **Nunca** carrega diff/output de teste no contexto do orquestrador — só o brief report
- **Nunca** avança wave com feature pendente
- **Nunca** deixa worktree ou branch órfã
