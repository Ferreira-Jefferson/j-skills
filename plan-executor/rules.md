# Plan Executor — Regras Críticas

Aplicam-se a **todas as fases**.

> **Princípio acima de todas:** o processo existe para evitar retrabalho, não para produzir cerimônia. Toda etapa desta skill precisa pagar o próprio custo. Quando não paga, existe caminho declarado para pular — nunca improvisado (regra 5).

## 1. O plano original é a fonte da verdade

A skill executa o que o plano diz. Não amplia escopo ("já que estou aqui"), não corta escopo ("isso dá no mesmo"), não substitui decisões arquiteturais do plano por preferência própria. Divergência entre plano e realidade do código → **escalar**, não improvisar (regra 10).

## 2. Nenhum código antes do plano de ação aprovado

Sequência obrigatória por feature:
`ACTION-PLAN.md` escrito → gate 1 liberou → execução → gate 2 aprovou → commit.

Vale em todos os tiers e também no modo enxuto — o que muda entre eles é **como** o gate 1 é aplicado (individual ou em lote), nunca se ele existe. Feature-agent que edita arquivo antes da liberação do gate 1 tem o trabalho descartado.

## 3. Paralelismo exige disjunção provada, não presumida

Duas features só entram na mesma wave se **todas** estas condições valerem:
- **Disjunção física:** conjuntos de arquivos **escritos** são disjuntos (leitura compartilhada é permitida).
- **Sem produtor→consumidor:** nenhuma consome artefato produzido pela outra (tipo, contrato, endpoint, tabela, componente, env var, migration).
- Não compartilham arquivo de teste, fixture, snapshot ou seed.
- Não disputam arquivo agregador (`index.ts`, `__init__.py`, registro de rotas, i18n, `package.json`/lockfile, config de build).
- **Disjunção semântica:** não alteram o mesmo **comportamento observável** (mesma rota, mesmo fluxo, mesma query, mesma regra de negócio) nem fazem o **mesmo teste existente mudar de resultado** — mesmo que os arquivos sejam diferentes. Duas features que mexem no mesmo comportamento por caminhos distintos colidem na hora de provar, não no merge.

Na dúvida sobre qualquer item → **serializar em waves diferentes**.

## 4. Colisão estrutural é resolvida antes, não durante

Arquivos que **múltiplas** features precisam tocar (agregadores, contratos compartilhados, migrations, config, boilerplate) são executados na **WAVE 0** pelo próprio orquestrador — antes de qualquer feature-agent existir. Alternativa aceita: dar a um único feature-agent a propriedade exclusiva do arquivo e serializar as demais depois dele.

Migrations de banco **nunca** são paralelizadas — numeração/ordem é global.

## 5. Proporcionalidade: o processo escala com o risco (não com o hábito)

Toda feature recebe um **tier** na FASE 1, e o tier define quantos agentes ela consome:

| Tier | Critério (todos os itens) | Gate 1 (plano) | Gate 2 (código) |
|------|---------------------------|----------------|-----------------|
| **T1 — mecânica** | ≤2 arquivos escritos; sem lógica de negócio nova; sem contrato/schema/dependência nova; prova já existe no projeto | **em lote** — 1 `plan-reviewer` revisa até 4 planos T1 da mesma wave numa passada | individual, obrigatório |
| **T2 — padrão** | qualquer feature que não seja T1 nem T3 | individual | individual |
| **T3 — crítica** | toca contrato público, schema/migration, auth/permissão, dado de usuário, dinheiro/crédito, ou remove comportamento existente | individual + RED obrigatório | individual + conferência explícita do RED |

Regras de tier:
- Tier é atribuído na FASE 1 e registrado no `EXEC-MAP.md` com o critério que o justifica. Sem justificativa escrita, o default é **T2**.
- Tier **sobe** livremente durante a run (T1 → T2 → T3) quando a execução revela complexidade. Tier **nunca desce** depois de definido.
- Gate 2 é individual em todo tier. Revisão independente da execução não tem exceção.

### Modo enxuto (lean)

Quando **todas** as features do plano são T1 **e** são ≤4, a FASE 1 declara `MODO: ENXUTO`:
- sem waves, sem worktree — execução sequencial na `[target-branch]`;
- 1 `feature-agent` executa as features em sequência, uma por vez, cada uma com seu `ACTION-PLAN.md` curto;
- 1 `plan-reviewer` revisa todos os planos numa passada (antes de qualquer código);
- 1 `code-reviewer` no final, cobrindo o diff inteiro feature a feature;
- FASE 3 continua obrigatória (suite global + cobertura + relatório).

Modo enxuto é decisão **declarada e justificada** no `EXEC-MAP.md`, não atalho silencioso. Se qualquer feature subir de tier durante a run, o modo enxuto é abandonado e a run volta ao fluxo normal a partir da feature seguinte.

## 6. O que já está pronto não vira feature

Antes de fatiar (FASE 0) e antes de escrever cada `ACTION-PLAN` (feature-agent, etapa 1), verifique o **estado atual do código** contra o item do plano. Planos costumam conter itens já implementados, parcialmente implementados ou obsoletos.

- Item **já implementado e provado** → registrado como `NO-OP` no `EXEC-MAP.md` com a evidência (arquivo:linha ou comando que comprova) — **não** vira feature, **não** consome agente.
- Item **parcialmente implementado** → a feature cobre só o delta, e o `ACTION-PLAN` diz explicitamente o que já existe.
- Item que **conflita** com o código atual (o plano assume algo que mudou) → escalar (regra 10), não reescrever o código para caber no plano.

`NO-OP` aparece no relatório final como item coberto, com a evidência. Nunca é omissão silenciosa.

## 7. Prova de conclusão: executável, e reusada antes de criada

Toda feature declara **uma** prova antes de executar (features que exigem 2+ provas distintas estão mal cortadas — divida). Ordem de preferência obrigatória:

1. **Comando/teste que já existe** no projeto e já cobre o comportamento → use como está. `<comando exato>` exits 0.
2. **Asserção nova em arquivo de teste existente** → teste `<nome>` em `<arquivo já existente>` passa.
3. **Teste novo**, só quando 1 e 2 não são possíveis.
4. **Estado observável** — `<endpoint/função/arquivo>` com `<input>` produz `<output verificável>` — quando o projeto não tem runner de teste para esse caminho.

**Proibido:** criar suite, harness, fixture pesada ou infra de teste nova para provar feature T1; usar mais de um formato "por segurança"; provas narrativas ("funcionar corretamente", "estar implementado", "sem erros no console", "revisar visualmente").

A prova precisa ser **executada** e sua saída literal anexada como evidência. Prova declarada e não rodada = feature não concluída.

## 8. Prova tem que poder falhar

Se a prova passaria mesmo com a feature quebrada ou ausente, ela não é prova. Quem escreve a prova registra, **em uma linha**, o cenário quebrado que ela pega. Sem esse cenário escrito, a prova é inválida.

RED antes de GREEN:
- **T3:** obrigatório (registro da prova falhando antes da implementação).
- **T2:** opcional — só quando o RED for barato (o teste já existe ou é 1 asserção).
- **T1:** não fazer. Custa mais que a mudança.

## 9. Isolamento por worktree quando ele compensa

Regra padrão: wave com ≥2 features que **escrevem** arquivos → worktree por feature.

```bash
git worktree add ../[repo]-[FEAT-ID] -b feat/[plan-slug]-[FEAT-ID]
```

Exceção declarada: se o projeto exige instalação pesada de dependências por worktree (`node_modules`, venv, build cache) e a wave tem ≤2 features T1, é aceito **serializar inline** na `[target-branch]` em vez de criar worktrees — registrando o motivo no `EXEC-MAP.md`. Serializar é barato; setup de ambiente repetido não é.

Worktree criado é worktree removido — cleanup é parte do encerramento da feature (`phase-3-closeout.md`).

## 10. Furo no plano: patch pontual ou escalação — nunca improviso

- **Delta trivial** (nome de arquivo, caminho, ordem de dois passos, comando de teste): o agente corrige o `ACTION-PLAN.md`, registra em "Desvios", e segue.
- **Delta de decisão** (arquitetura, contrato, schema, dependência nova, mudança de escopo): **ESCALAR** ao orquestrador → usuário.

Soft limit: 3 escalações de plano na mesma run → o plano tem problema estrutural; pare e revise o plano antes de continuar.

## 11. Revisor independente, prompt de senior, uma passada por gate

Toda invocação de `plan-reviewer` ou `code-reviewer` DEVE começar com a frase obrigatória definida no arquivo do agente. Revisor é **independente**: contexto limpo, não herda a conversa de quem produziu o artefato, não revisa o que ele mesmo escreveu.

**Orçamento de rodadas (o que impede ping-pong):**
- **Gate 1 é passada única.** O `plan-reviewer` corrige e libera na mesma passada — `CORRIGIDO` **é** liberação para executar, não pedido de nova revisão. Só há segunda passada se o feature-agent apontar erro factual na correção; nesse caso o veredicto é `ESCALAR`, não reabertura do gate.
- **Gate 2 tem 2 tentativas.** 1ª rejeição: feedback com arquivo:linha e correção esperada. 2ª rejeição da mesma feature → **ESCALAR** automático. Não existe 3ª rodada.
- Mesma operação técnica falhando 2× seguidas → acionar `error-memory` antes da 3ª tentativa. 4 falhas na mesma operação → escalar.

## 12. Um agente, uma feature, contexto limpo

Worker recebe: plano original (só as seções da sua feature), `EXEC-MAP.md`, o `ACTION-PLAN.md` da feature, o worktree. **Não recebe** features de outros agentes, histórico do orquestrador nem conversa de outro worker. Se precisar de algo de outra feature, é sinal de decomposição errada → escalar.

(No modo enxuto não há feature-owner: o orquestrador coordena direto — mas cada feature ainda tem seu implementer próprio, agente novo, lendo só o plano dela.)

## 13. Execução não é exploração

A exploração do código acontece na **etapa de plano**, com os arquivos abertos. Na execução, o agente executa o que está escrito.

- Descoberta pontual não prevista (abrir 1–2 arquivos extras para confirmar assinatura) é normal — registra em "Desvios" e segue.
- Precisar abrir >3 arquivos não previstos, ou trocar a abordagem técnica do plano, significa que **o plano estava errado**: registrar e escalar, não tentar variações até algo funcionar.
- Proibido: ciclo de tentativa-e-erro sobre a mesma operação sem hipótese nova a cada tentativa; rodar a prova repetidamente esperando resultado diferente; alterar a prova para ela passar.

## 14. Estado visível a cada evento

Cada conclusão de agente e cada veredicto de revisor dispara atualização do quadro de progresso para o usuário. O usuário nunca fica no escuro sobre qual feature está em qual etapa.

## 15. Nada destrutivo sem aprovação humana

`git branch -D`, `git worktree remove --force`, `git push --force`, `reset --hard`, drop/truncate de tabela, exclusão de arquivo não previsto no plano: sempre escalação, nunca decisão de agente.

## 16. Cada trabalho novo, um agente novo (delegação em cascata)

Contexto não se acumula: **toda etapa de natureza diferente roda em um agente novo, com contexto inicial mínimo**. Ninguém herda conversa de ninguém — nem do orquestrador, nem do agente anterior, nem da própria tentativa anterior.

**Árvore de delegação (3 níveis, profundidade máxima):**

```
nível 0  ORQUESTRADOR (sessão principal)   coordena waves; não lê código, diff nem log
  └ nível 1  feature-owner (1 por feature) coordena UMA feature; não escreve código nem plano
      └ nível 2  workers (1 por etapa)     planner | implementer | fixer | plan-reviewer | code-reviewer
```

- **Nível 2 não delega.** Worker que precisaria de outro worker está com escopo errado → reporta ao owner, que decide (nova etapa ou escalação).
- **Uma etapa, um worker, uma vez.** Re-execução após rejeição é um worker **novo** (`fixer`), que recebe plano + feedback — nunca o mesmo agente defendendo o próprio trabalho.
- **Owner não implementa e não planeja.** Se ele começa a editar código, virou worker e perdeu a função de coordenar.

**Contrato de delegação (todo briefing de spawn, ≤10 linhas):** papel (caminho do arquivo do agente) · objetivo em 1 frase · inputs **por caminho** · saída esperada (formato fixo) · limites. **Proibido no briefing:** histórico de conversa, diff, log de teste, raciocínio do agente anterior, features alheias. Passe caminhos, não conteúdo.

**Fallback quando o runtime não permite spawn aninhado:** o agente que precisaria delegar emite `DELEGAR: <papel> — inputs: <caminhos> — objetivo: <1 frase>` e para. O orquestrador spawna em nome dele e devolve só o veredicto/artefato. A árvore lógica é a mesma; muda quem aperta o botão.

## 17. Planejar tarde o que ainda vai mudar (adiamento explícito)

Plano de ação escrito cedo demais sobre código que outra feature vai reescrever é retrabalho garantido — e é a principal causa de "revisão que aprovou algo que já não valia".

Toda feature é classificada na FASE 1 como:

- **ESTÁVEL** — planejável agora: o código e os contratos que ela toca não serão alterados por nenhuma feature que roda antes dela.
- **ADIADA** — só pode ser planejada **na abertura da sua própria wave**, depois que as features a montante fecharam. Marque ADIADA quando qualquer item valer:
  - consome artefato cuja **forma** ainda pode mudar (assinatura, shape, schema, nome de rota);
  - depende de uma **decisão** que uma feature a montante ainda vai tomar;
  - o alvo dela é descrito em termos de código que a wave anterior vai reescrever;
  - a **prova** dela depende de comportamento que a montante altera.

Regras:
- Feature ADIADA **não** recebe feature-owner nem planner antes da sua wave abrir. Nada de "vou adiantando o plano".
- Todo `ACTION-PLAN.md` declara suas **premissas a montante** (o que assume do que já rodou). Premissa é o gancho da revalidação.
- **Checkpoint entre waves (obrigatório):** ao fechar a wave N, o orquestrador confere os desvios registrados das features concluídas contra as premissas das features das waves seguintes. Premissa quebrada → a feature afetada é re-planejada do zero (novo planner, contexto novo), ou re-mapeada, ou escalada. Nunca executada sobre premissa inválida.
- Na dúvida entre ESTÁVEL e ADIADA → **ADIADA**. Adiar custa uma wave; planejar sobre areia custa a feature inteira.
