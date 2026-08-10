# Plan Executor — Gotchas

Erros frequentes ao executar planos com agentes em paralelo. Leia antes de iniciar a run; adicione entradas novas sempre que a skill tropeçar.

## G-001: Spawnar agentes antes de mapear o paralelismo
**Sintoma:** recebe "implemente o plano X.md" e já dispara 4 agentes "porque as tasks parecem independentes".
**Fix:** FASES 0 e 1 são obrigatórias. Paralelismo sem teste de disjunção termina em arquivo sobrescrito e merge conflict — o custo de reparar é muito maior que o de mapear.

## G-002: Presumir disjunção por pasta
**Sintoma:** "FEAT-001 é backend, FEAT-002 é frontend, logo não colidem" — e as duas editam `src/types/api.ts`.
**Fix:** disjunção é por **arquivo escrito**, enumerado caminho a caminho. `src/**` não é declaração de arquivos.

## G-003: Esquecer o arquivo agregador
**Sintoma:** duas features "isoladas" precisam registrar seu export em `index.ts` / sua rota no router / sua chave no i18n → conflito na hora do merge.
**Fix:** todo agregador vai para a WAVE 0, já com as entradas de todas as features (regra 4).

## G-004: Paralelizar migrations
**Sintoma:** dois agentes criam migration com o mesmo número/timestamp ou ordem incompatível.
**Fix:** migration nunca é paralela. Vai para a WAVE 0, em ordem única.

## G-005: Feature-agent começar a codar antes do gate 1
**Sintoma:** o agente escreve o plano e "já vai adiantando" a implementação enquanto espera o revisor.
**Fix:** `PLANO PRONTO` é ponto de parada. Trabalho feito antes do gate 1 é descartado — e o retrabalho é maior que a espera.

## G-006: Prova de conclusão que não prova nada
**Sintoma:** "prova: os testes passam", "prova: a página carrega", "prova: sem erros no console".
**Fix:** um dos 4 formatos da regra 7 (na ordem de preferência), mais o cenário de falha escrito da regra 8. O plan-reviewer reescreve provas frouxas — mas o feature-agent não deveria produzi-las.

## G-007: Prova que passaria com a feature quebrada
**Sintoma:** teste mocka justamente o que a feature implementa; ou asserta `status 200` sem checar o shape novo.
**Fix:** para cada prova, nomeie o cenário quebrado que ela pega. Se não conseguir nomear, a prova é inválida.

## G-008: Prova trocada durante a execução
**Sintoma:** a prova aprovada era um teste E2E; o agente entrega um unit test "equivalente" porque o E2E deu trabalho.
**Fix:** mudança de prova volta ao `plan-reviewer`. O `code-reviewer` rejeita prova trocada sem nova aprovação.

## G-009: O mesmo agente revisa o próprio trabalho
**Sintoma:** o feature-agent "revisa" seu plano, ou o orquestrador aprova a execução sem spawnar o code-reviewer.
**Fix:** os dois gates são de **agentes independentes, com contexto limpo**. Auto-revisão só confirma o próprio viés.

## G-010: Tratar correção do plan-reviewer como sugestão
**Sintoma:** o revisor corrige o plano; o agente executa a versão que ele mesmo tinha escrito.
**Fix:** em `CORRIGIDO`, o agente **re-lê o arquivo do disco** e executa a versão corrigida. Discordância factual → escalar, não ignorar.

## G-011: Improvisar em cima de furo do plano
**Sintoma:** o plano não diz como tratar caso X; o agente decide sozinho e segue "para não travar".
**Fix:** delta trivial se corrige e registra; delta de decisão **escala** (regra 10). Improviso silencioso é a principal fonte de retrabalho.

## G-012: Orquestrador carregar diff e output de teste
**Sintoma:** o contexto do orquestrador enche de diffs e logs; a coordenação começa a errar wave e status.
**Fix:** orquestrador consome apenas brief reports. Diff, log e código ficam no worktree e nos agentes.

## G-013: Avançar de wave com feature pendente
**Sintoma:** "FEAT-002 ainda está em review, mas vou começar a WAVE 2 para ganhar tempo".
**Fix:** wave só fecha com 100% CONCLUÍDA (merge + cleanup verificados). Feature da wave seguinte pode consumir artefato que ainda vai mudar.

## G-014: Worktree/branch órfã
**Sintoma:** `git worktree list` mostra pastas de features já concluídas; `feat/[plan-slug]-*` sobrando.
**Fix:** cleanup é parte do encerramento da feature, verificado por comando. `--force`/`-D` só com aprovação humana.

## G-015: Feature-agent rodar a suite global
**Sintoma:** cascata de erros de features que ainda não existem; centenas de linhas de log irrelevante.
**Fix:** agente roda só a prova e os testes da própria feature. Suite global é FASE 3, uma vez.

## G-016: Orquestrador implementar feature
**Sintoma:** "essa é pequena, faço eu mesmo" — sem plano de ação, sem gate, sem prova.
**Fix:** o orquestrador só executa a WAVE 0. Toda feature passa pelo ciclo, inclusive as pequenas — o que muda nelas é o **custo** (T1: plano curto, revisão em lote, sem RED), não a existência dos gates.

## G-017: Silêncio durante a execução
**Sintoma:** o usuário fica minutos sem saber quantas features estão rodando ou travadas.
**Fix:** quadro de progresso a cada evento de agente (regra 14), mostrando todas as waves.

## G-018: Executar item do plano que ninguém pegou
**Sintoma:** no encerramento, uma seção do plano original não corresponde a nenhuma feature — e ninguém percebeu.
**Fix:** a tabela de cobertura da FASE 3 é obrigatória, item por item. Item não entregue é **reportado**, nunca omitido.

## G-019: Processo mais caro que a mudança
**Sintoma:** feature de trocar uma constante consome 3 agentes, worktree, RED/GREEN e teste novo. O usuário vê "muita etapa para pouca entrega".
**Fix:** tier (regra 5). T1 revisa plano em lote, não faz RED, reusa prova existente. Plano inteiro T1 → modo enxuto. O que nunca cai: plano antes de código, code review independente, prova executada.

## G-020: Implementar o que já estava implementado
**Sintoma:** o plano é de semanas atrás; metade dos itens já existe no código, mas viraram features e consumiram agentes.
**Fix:** checagem de estado atual na FASE 0 e na etapa 1 do feature-agent (regra 6). Item já atendido vira `NO-OP` com evidência, não feature.

## G-021: Criar teste novo onde já havia prova
**Sintoma:** o agente escreve um arquivo de teste (às vezes um harness inteiro) para provar algo que `npm test -- x.spec.ts` já cobria.
**Fix:** hierarquia de prova (regra 7) — reusar antes de criar. O plan-reviewer troca a prova por uma existente antes da execução.

## G-022: Ping-pong de revisão
**Sintoma:** plano vai e volta 3 vezes entre agente e revisor; feature rejeitada 3 vezes com feedback vago. Muito token, pouca decisão.
**Fix:** gate 1 é passada única (`CORRIGIDO` já libera); gate 2 tem 2 tentativas, com issues em arquivo:linha. Divergência não se resolve em rodada extra — escala.

## G-023: Tentativa-e-erro no lugar de escalação
**Sintoma:** a prova falha, o agente muda um detalhe e roda de novo, 5 vezes, sem hipótese nova; ou troca a abordagem do plano no meio para "destravar".
**Fix:** regra 13. Cada tentativa exige hipótese nova; 2 falhas → `error-memory`; 4 → escalar. Trocar abordagem = plano errado = escalar.

## G-024: Worktree que custa mais que serializar
**Sintoma:** cada worktree precisa de `npm install`/venv; a wave de 2 features T1 gasta mais tempo em setup do que em código.
**Fix:** exceção da regra 9 — wave de ≤2 features T1 em projeto com setup pesado roda inline serializada, com o motivo registrado no `EXEC-MAP.md`.

## G-025: Contexto que cresce de etapa em etapa
**Sintoma:** o mesmo agente planeja, executa, apanha do review e corrige — no fim ele carrega exploração de código, diff, log de teste e duas rodadas de feedback. A qualidade cai justamente quando o problema é mais difícil.
**Fix:** regra 16. Cada etapa é um agente novo: planner ≠ implementer ≠ fixer. O que precisa sobreviver entre etapas está no `ACTION-PLAN.md` em disco, não na cabeça do agente.

## G-026: Briefing que carrega conteúdo em vez de caminho
**Sintoma:** o spawn cola o plano inteiro, o diff ou "o que o agente anterior concluiu" dentro do prompt — e o contexto "limpo" já nasce sujo e enviesado.
**Fix:** contrato de delegação (regra 16): papel · objetivo em 1 frase · **inputs por caminho** · saída esperada · limites. ≤10 linhas. O agente lê o que precisa.

## G-027: Planejar cedo demais o que vai mudar
**Sintoma:** todos os `ACTION-PLAN.md` são escritos no início da run; quando a wave 2 abre, metade descreve funções que a wave 1 renomeou. O plan-reviewer aprovou algo que já não vale.
**Fix:** regra 17. Feature ADIADA não recebe agente antes da wave dela abrir. Plano desatualizado é **descartado e refeito**, nunca remendado.

## G-028: Wave nova em cima de mundo mudado
**Sintoma:** a wave 1 entregou com desvios (assinatura diferente, coluna com outro nome); a wave 2 executa assumindo o combinado antigo e quebra no meio.
**Fix:** checkpoint de fechamento de wave — desvios reportados × premissas declaradas. Premissa quebrada → re-planejar, re-mapear ou escalar antes de abrir a wave seguinte.

## G-029: Compartilhar `node_modules` entre worktrees via junction/symlink
**Sintoma:** pra evitar `npm install` duplicado por worktree, o orquestrador cria uma junction do Windows (`New-Item -ItemType Junction`) de `node_modules` de cada worktree apontando pro `node_modules` real do repo principal. Mais tarde, `git worktree remove` (ou o `rm -rf` por trás dele em ambiente MSYS/Git Bash) segue a junction como se fosse um diretório normal e apaga recursivamente o **conteúdo real** do `node_modules` do repo principal — não só o da worktree. O repo principal fica sem `tsc`/`eslint`/`vitest` até um `npm install` de resgate.
**Fix:** nunca aponte uma junction/symlink de worktree pra um diretório do repo principal (ou de outra worktree) quando o plano de encerramento inclui `git worktree remove` naquele caminho. Alternativas seguras: (a) deixar cada worktree rodar seu próprio `npm install` (mais lento, zero risco); (b) usar o cache do npm (`npm install --prefer-offline`) pra acelerar sem symlink; (c) se usar junction mesmo assim, desfazer o link com um `rmdir` direto no ponto de junção (sem recursão) *antes* de chamar `git worktree remove`, nunca depois. Depois do incidente, sempre reexecutar a suíte completa (`typecheck`+`lint`+`test`) no repo principal logo após qualquer cleanup de worktree, antes de declarar a wave concluída — é o que expõe o estrago a tempo de corrigir. Ver também a exceção da regra 9: às vezes a resposta certa é serializar em vez de otimizar o setup.

## G-030: Colisão semântica em arquivos diferentes
**Sintoma:** duas features "disjuntas por arquivo" alteram a mesma rota/regra; o merge passa liso e as provas de ambas começam a falhar de forma intermitente.
**Fix:** 5ª condição da regra 3 — mesmo comportamento observável ou mesmo teste existente mudando de resultado = serializar, mesmo sem arquivo em comum.
