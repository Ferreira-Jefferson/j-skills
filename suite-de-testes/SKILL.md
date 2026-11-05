---
name: suite-de-testes
description: "Metodologia para projetar uma suite de testes rapida e confiavel do zero, ou para diagnosticar e refatorar a suite de um projeto existente que ficou lenta, flaky ou baguncada. Cobre: medir antes de otimizar, separar testes puros de integracao, isolamento de estado por worker (banco por worker, transacao+rollback), centralizacao da infra de teste por escopo (uma config e uma fabrica, nenhum arquivo monta a sua), rodar so o que mudou no loop local com a suite inteira no CI, e calibrar paralelismo. Stack-agnostica (vitest, jest, playwright, pytest, go). Use quando: a bateria de testes esta lenta, cada modulo testa de um jeito, quer montar testes num projeto novo, ou quer refatorar a infra de teste. Gatilhos: testes lentos, suite lenta, bateria de testes, acelerar testes, flaky, paralelizar testes, isolamento de banco em teste, estruturar testes, refatorar testes, testes do zero."
---

# suite-de-testes

Como fazer uma suite de testes ser rapida, confiavel e barata de manter, seja comecando
um projeto do zero, seja consertando uma que degradou. Nao e sobre escrever asserts: e
sobre a ARQUITETURA da suite (isolamento, paralelismo, selecao, centralizacao).

Dois modos, mesma teoria:
- **Brownfield** (projeto existente lento/flaky/bagunçado): comece em "Diagnostico", aplique o "Playbook de refactor".
- **Greenfield** (projeto novo): pule para "Principios de design" e ja monte com eles.

Principio que rege tudo: **meça antes de mexer, isole antes de paralelizar, centralize por escopo, e rode so o que mudou no loop, tudo no CI.**

## Diagnostico (antes de tocar em qualquer config)

Nunca otimize por palpite. Levante os numeros primeiro.

1. **Cronometre a suite inteira** e leia a decomposicao do tempo. No vitest, a saida separa
   `transform / collect / tests / setup / prepare`. Descubra onde o tempo esta:
   - `collect` alto = custo de carregar o grafo de modulos, geralmente por rodar arquivos
     **em serie** (cada arquivo num processo isolado). O gargalo e serializacao, nao os testes.
   - `tests` alto = os testes em si (banco, IO, espera). Ataque seed/seleção/paralelismo.
   - `setup`/`prepare` alto = setupFiles/globalSetup caros por arquivo.
   Em jest use `--logHeapUsage`/`--detectOpenHandles` e o tempo por arquivo; em pytest `--durations=20`.
2. **Conte e classifique** os arquivos por escopo (backend/frontend/e2e) e por natureza:
   puro (sem IO) x integracao (banco/rede/disco). A proporcao diz onde mora o custo.
3. **Ache a serializacao e o porque.** Procure `fileParallelism: false`, `--runInBand`, pool
   `singleFork`, `maxWorkers: 1`. Quase sempre existe porque os testes disputam um recurso
   compartilhado (um banco unico). Isso e o que o isolamento vai destravar.
4. **Ache o custo por arquivo**: seed pesado, bootstrap do app inteiro, KDF/cripto, e esperas
   de relogio de parede (SSE, sleep, HTTP real, `pg_dump`, subir servidor). Liste os outliers.
5. **Veja a selecao atual**: roda tudo sempre, inclusive no loop local? Tem hook que roda so o
   afetado? O CI particiona?

Saida do diagnostico: uma frase por gargalo, com o numero que o comprova, ordenada por ganho.

## Principios de design (o estado-alvo)

1. **Separe puro de integracao.** Teste puro nao toca IO, roda massivamente paralelo em
   milissegundos e nunca fica flaky. Isso exige CODIGO testavel: logica de dominio pura,
   IO nas bordas. Se quase tudo e integracao, o problema e o desenho do codigo, nao do teste.
2. **Paralelismo exige isolamento. "Dois workers nunca compartilham."** Para rodar arquivos em
   paralelo sem colisao, cada worker precisa do seu proprio estado do recurso compartilhado
   (ver "Isolamento de estado"). Sem isolamento, a unica saida honesta e a serie.
3. **Centralize a infra por escopo.** Um escopo (backend, frontend, e2e) tem UMA config base
   (um factory que cada projeto/workspace so chama) e UMA fabrica de fixtures/conexoes. Nenhum
   modulo, tela ou arquivo monta a sua. O especifico de um teste (um role, um limite, uma checagem
   de disponibilidade) e um PARAMETRO da fabrica ou fica dentro daquele teste, nunca uma copia da
   infra. Infra de backend numa pasta do backend, de frontend numa pasta do frontend, integracao
   cross-escopo na raiz.
4. **Rode so o que mudou no loop; tudo no CI.** No dia a dia, rode apenas os testes ligados a
   mudanca atual (pelo grafo de imports do git). A suite inteira e responsabilidade do CI. A
   selecao e feedback rapido, NAO e gate de correcao: nunca confie nela para garantir o todo.
5. **Calibre o numero de workers, nao chute.** Mais workers paralelizam, mas cada um custa
   setup (conexoes, clone de banco, memoria). Acima de certo ponto, rende menos ou piora (em
   maquina de poucos cores, frequente). Default por CPU com teto, com override por env var, e
   meça. O otimo do laptop nao e o do runner de CI de 2 cores.
6. **Fail loud, nunca verde falso.** Suites que "se pulam" quando a infra falta sao uteis, mas
   so se o pulo for visivel. O risco mortal e a suite passar com metade dos testes silenciosamente
   pulados. Ao refatorar, **verifique a CONTAGEM de testes**, nao so o exit code.

## Isolamento de estado (o coracao de paralelizar com banco)

Ranqueado do mais rapido de implementar ao mais robusto. Combine conforme o caso.

- **Cenario por id aleatorio + limpeza em cascata.** Cada teste cria suas entidades com
  `uuid` e limpa o que criou (cascata por raiz, nunca `TRUNCATE` global). E parallel-safe
  entre arquivos se nao houver estado global compartilhado. O mais barato; comece por aqui.
- **Banco por worker (clone de template).** Em `globalSetup`, clone o banco base num por worker
  (`CREATE DATABASE <base>_<escopo>_w<id> TEMPLATE <base>` no Postgres, ou schema por worker, ou
  um container por worker). O worker escolhe o seu pela env do runner (ver tabela abaixo). Clonar
  de template e uma copia de arquivos, barato perto de recriar schema+seed. **Namespace por
  escopo** no nome do banco, senao suites que rodam em sequencia (api depois atendente) uma dropa
  o banco da outra. Isto torna o paralelismo seguro inclusive para locks globais e testes de corrida.
- **Transacao + ROLLBACK por teste.** Abra transacao no `beforeEach`, rollback no `afterEach`.
  Zero residuo, muito rapido. Quebra quando o codigo sob teste gerencia a propria transacao/commit,
  ou testa concorrencia real. Otimo para repos, ruim para testes de corrida.

Variaveis de worker por runner (para escolher o banco/schema do worker):

| Runner | Variavel |
|---|---|
| vitest (pool forks/threads) | `VITEST_POOL_ID` (1..maxForks) |
| jest | `JEST_WORKER_ID` |
| playwright | `testInfo.workerIndex` / `TEST_PARALLEL_INDEX` |
| pytest-xdist | `PYTEST_XDIST_WORKER` |

Regras de ouro do isolamento:
- **Locks globais nao escopam por banco.** Advisory lock do Postgres e cluster-wide: so e seguro
  entre workers se a chave for por entidade (hash de um id aleatorio), nunca uma constante.
- **Teste de corrida fica num arquivo so** (a concorrencia e dentro do teste; dentro de um worker
  os arquivos rodam em serie no tempo, entao nao colidem com vizinhos).
- **Operacoes exclusivas/globais** (`pg_dump`, `SET ROLE` no mesmo banco, dump de schema) ficam em
  serie, num grupo/projeto proprio. Nao paralelize.
- **Seed/catalogo mutavel** compartilhado entre arquivos e fonte de flaky: clone por worker resolve,
  ou semeie por cenario.

## Selecao: rodar so o que mudou

Use o nativo do runner, nao invente:

| Runner | Comando |
|---|---|
| vitest | `vitest run --changed` (ou `--changed origin/main`), `vitest related <arquivos>` |
| jest | `jest -o` (only changed), `jest --changed`, `--findRelatedTests` |
| nx / turbo | `nx affected -t test` |
| pytest | `pytest-testmon` |
| go | `go test ./...` (cache por pacote) |

Monorepo: dirija pelo grafo de dependencias (um pacote mudou, rode ele e quem depende dele).
Regra de classificacao de mudanca: config/lockfile/tsconfig -> roda tudo; so docs/`.md` -> nada;
na duvida, roda demais, nunca de menos. Exponha como `test:changed` e deixe o CI rodar a suite cheia.

## Playbook de refactor (brownfield, do menor risco ao maior)

Cada passo: rode o gate, confira que a CONTAGEM de testes nao caiu (sem pulo silencioso), e
**commite atomico** por passo. Nunca junte varios num commit.

1. **Baseline.** Cronometre e salve o numero. Sem ele, "ficou mais rapido" e achismo.
2. **Selecao (`test:changed`).** Risco zero, puramente aditivo, maior ganho no dia a dia. Faça primeiro.
3. **Config base por escopo.** Extraia a config duplicada para um factory que cada projeto chama.
4. **Isolamento + paralelismo.** Introduza banco por worker (ou rollback), ligue o paralelismo, meça.
5. **Namespace por escopo.** Isole os bancos/recursos entre suites para o gate sequencial nao colidir.
6. **Migre os stragglers.** Os arquivos que montam a propria conexao passam a usar a fabrica; o
   especifico vira parametro. Agora "nenhum arquivo monta a sua".
7. **CI.** Particione (shard/matriz) se a suite cheia ainda pesar; separe unit (rapido) de integracao.

## Greenfield (projeto novo)

Monte com o estado-alvo desde o commit 1: codigo com logica pura testavel; uma pasta de
`test-support` por escopo com o factory de config e a fabrica de fixtures/conexoes; isolamento
por worker ligado desde o inicio; `test:changed` no loop; CI rodando tudo. Escreva o primeiro teste
de integracao ja pela fabrica, para o padrao nascer certo e ninguem copiar infra depois.

## Armadilhas (verifique sempre)

- **Verde falso por pulo em massa.** Compare a contagem de testes antes/depois. Exit 0 nao basta.
- **Colisao de recurso entre suites** rodando em sequencia (mesmo nome de banco/porta/dir). Namespace por escopo.
- **Exaustao de conexoes** sob N workers (cada worker x pools x arquivos). Verifique `max_connections`.
- **`isolate: false`** acelera a coleta (reusa modulos no worker) mas vaza estado global entre arquivos: so com testes limpos.
- **Credencial/env divergente** (um `.env.test` que sombra a senha real) faz tudo pular. Centralize a origem.
- **Selecao como gate.** Ela erra para menos as vezes; o CI e quem garante o todo.
- **Espera de relogio de parede** (sleep, SSE, HTTP real): isole esses poucos e caros; nao deixe crescer.

## Criterio de pronto

A suite cheia roda em paralelo e verde, com a MESMA contagem de testes de antes (ou mais), em
tempo medido e expressivamente menor que o baseline; o loop local roda so o afetado; a infra de
cada escopo tem um dono unico; e o CI roda tudo. Mostre os numeros, nao so afirme.
