---
name: feature-first
description: Esta skill deve ser usada quando o usuário quiser "iniciar um novo projeto", "estruturar um projeto para IA", "arquitetura para desenvolvimento com agentes", "evitar over-engineering", "vertical slice", "feature-sliced", "screaming architecture", "modular monolith", "arquitetura que reduza custo de tokens", "organizar código por funcionalidade", "package by feature", ou perguntar como montar um codebase onde agentes de IA trabalhem com menos erros e menos custo. É agnóstica de stack (Python, TS/JS, Go, Rust, Java). Estabelece módulos por feature, kernel compartilhado enxuto, enforcement de fronteiras no build, e convenções IA-friendly (AGENTS.md na raiz, MODULE.md por módulo, co-location radical) que reduzem o contexto necessário por tarefa e impedem quebra cruzada entre features. Aplicável em projetos novos e em migrações de projetos existentes que viraram monolito bagunçado ou clean architecture ritualística.
---

# Feature-First Architecture

Organizar código em **slices verticais por feature**, com uma **camada comum enxuta** para capacidades genuinamente compartilhadas — infra (DB, log, HTTP) **e** especialistas transversais (cálculo, datas, geo) — e **fronteiras verificadas no build**. Otimiza para o padrão de trabalho de agentes de IA: pouco contexto por tarefa, baixo raio de quebra, deleção barata.

> **Sobre nomes de pasta — esta skill NÃO impõe nomes.** A "camada comum" se chama `shared/` em um projeto, `core/` em outro, `infra/` ou `lib/` em outro. Em projeto novo você escolhe um nome; em projeto existente você **descobre e respeita** a convenção que já está lá — nunca cria uma pasta nova concorrente. Ao longo deste documento, `shared/` e `modules/` são apenas **nomes de exemplo**: leia-os como "a camada comum" e "as features". A regra é sempre sobre o *papel* da pasta, nunca sobre o nome.

Herda da literatura: *Vertical Slice Architecture* (Jimmy Bogard), *Screaming Architecture* (Robert C. Martin), *Feature-Sliced Design* (FSD), *Modular Monolith* (Kamil Grzybek), *Package by Feature*. A síntese aqui é orientada ao padrão 2026 de desenvolvimento assistido por IA.

## Quando usar

- Iniciando projeto novo (caso principal)
- Refatorando projeto que virou "monolito bagunçado" ou "clean architecture ritualística"
- Projeto onde IA (Claude Code, Cursor, agentes) escreverá boa parte do código
- Usuário em dúvida entre Clean Architecture clássica / DDD pesado / feature-slice

## Quando NÃO usar

- Biblioteca pura — não tem "features", tem "API pública"
- Sistemas com compartilhamento de domínio genuinamente forte entre features (raro — primeiro investigar se é real ou preguiça de decidir fronteira)
- Equipes 10+ sem disciplina mínima e sem enforcement automatizado

## Ideia central em 3 frases

1. **Cada feature do produto é uma pasta independente** que contém tudo que é *próprio dela* — UI, domínio, handlers, testes, migrations, fixtures. **Lógica de feature nunca é emprestada de outra feature.**
2. **A camada comum guarda capacidades compartilhadas e não-opinadas** — infra (DB, log, HTTP, fila, auth) e especialistas transversais (cálculo, datas, geo) — **nunca** regra de negócio de feature.
3. **Reusar o especialista que já existe, não reescrever.** Antes de implementar uma capacidade, descubra o que o projeto já tem de comum e use. Reescrever uma capacidade existente é tão errado quanto duplicar *lógica de feature* é certo.
4. **Módulo nunca importa módulo.** Importar da camada comum é correto e encorajado; importar de *outra feature* é proibido e o build rejeita. Coordenação entre features passa por contrato/evento.

## Princípios (com o porquê)

### 1. Co-location radical
Tudo da feature fica na pasta da feature: handlers, UI, domínio, testes, migrations, fixtures, tipos. Nada de `tests/` na raiz espelhando `src/`, nada de `types/` global.
**Por quê:** agente abrindo a task "mudar tela de teatro" precisa de 1 pasta em contexto, não 8 pastas espalhadas. Reduz tokens e impede que um arquivo-espelho seja esquecido.

### 2. Reúso primeiro; Regra do 3 só para o que é novo e incerto
Dois movimentos **distintos** — não confunda:
- **Consumir o que já existe:** se a capacidade já está na camada comum (DB, log, cliente de LLM…), a feature nº1 usa **no dia 1**. Não há espera nem "regra do 3" — reúso de especialista existente é sempre imediato.
- **Promover algo novo:** quando *você* cria uma capacidade que talvez sirva a outras features, **não promova na 2ª amostra**. Duplicação entre 2 features é tolerada; só na **3ª ocorrência** o candidato sobe para a camada comum.

**Por quê:** duplicação barata > abstração errada. Com 2 amostras você chuta a forma do abstrato; só com 3 você conhece a forma certa. Mas isso vale **apenas para o incerto** — capacidade obviamente comum (ver Princípio 3) não precisa de 3 provas, e o que já existe **nunca** se reescreve.

### 3. A camada comum é especialista nomeado — não "utils", não regra de negócio
O critério para algo morar na camada comum **não é "é infra?"**. É: *"é uma capacidade **nomeada, de propósito único, não-específica de nenhuma feature**, que mais de uma feature precisa?"*. Passam: DB, logger, HTTP client, cliente de LLM, fila, auth (infra) **e** especialistas transversais que *não* são infra — um módulo de cálculo, de formatação de datas, de geo. **Não** passam: regra de negócio de feature, e pastas-lixeira de nome genérico (`utils/`, `common/`, `helpers/`, `misc/`).

**Racionalize a promoção — óbvio vs. especulativo:**
- **Obviamente comum** (DB, log, HTTP, auth): vai para a camada comum **desde já** — toda feature vai precisar, não há o que esperar.
- **Especulativamente comum** (aquele módulo de cálculo): a 1ª feature **não tem como saber** que será transversal. Fica **dentro da feature** até a 2ª/3ª precisar — aí a Regra do 3 promove.

**Por quê:** nomes genéricos viram lixeira (em 2 anos `utils/` tem 400 funções órfãs); nome específico (`http_client/`, `geo/`) força decisão consciente. E separar óbvio de especulativo evita os dois erros opostos: reescrever infra que já existe, e promover cedo demais algo que ainda nem se sabe se é comum.

### 4. Módulo nunca importa módulo — mas *usar a camada comum é encorajado*
Distinga **usar** de **acoplar**:
- **Usar/chamar a camada comum** (o cliente de LLM, o logger, o DB) é **correto e desejável** — é exatamente para isso que ela existe. O medo de acoplar **não** pode virar desculpa para reescrever infra.
- **Acoplar a outra feature** — importar código *interno* de outra feature — é **proibido**, verificado no build.

Caso clássico do que **não** fazer: a feature `a` tem um "agente B"; a feature `b` precisa de algo parecido. **Não** importe o agente da feature `a` por similaridade superficial — **recrie dentro de `b`**. Duas features que parecem iguais hoje evoluem em ritmos diferentes amanhã; o empréstimo prende uma à outra.

Se `park/` parece precisar de algo de `theater/`, três opções nessa ordem:
(a) não precisa mesmo — duplicar dentro de `park/`;
(b) é capacidade genuinamente transversal — extrair para a camada comum (Regra do 3, ou já se for óbvia);
(c) é coordenação, não reúso de código — comunicar via evento/contrato.
Import direto entre features é proibido e o build falha.
**Por quê:** import cruzado é como a arquitetura morre. Um import hoje vira 20 em 6 meses e o grafo fica ilegível. IA é especialmente propensa a criar esses imports em nome de "reusar". Enforcement mata isso na raiz.

### 5. Consuma o módulo pela API pública; estenda-o ou crie no slice quando faltar
Um módulo — de feature **ou** da camada comum — é **uma capacidade com uma superfície pública**, e você consome *essa superfície*. O que conta como "público" é o que o **módulo decide expor**, e isso varia:
- **Módulo fechado:** um `__init__`/índice reexporta tudo; consuma só a fachada.
- **Módulo com várias entradas públicas:** ele expõe submódulos/arquivos *destinados* a uso direto (ex: `core.llm/provider`, `core.llm/fallback`). Usar esses arquivos é **correto** — eles *são* a interface pública, mesmo sendo arquivos. No fim, o módulo é a pasta; o que importa é o que ela pretende expor.

O proibido é **passar por cima da interface pretendida** e puxar um *interno privado* só porque você precisa de um pedaço. **Cabe ao agente descobrir qual é a interface pública** (o que `__init__`/`__all__` exporta, convenções de nome `_privado`, o `MODULE.md`, a estrutura de submódulos) e usar por ali — nunca assumir.

Puxar um interno **privado** é um **sintoma**: ou seu uso está errado (a capacidade já existe na superfície pública — procure de novo), ou o módulo está errado (deveria expor isso e não expõe → corrija *no módulo*).

Quando o especialista **não fornece** o que a feature precisa, dois caminhos:
- **(a) A capacidade pertence ao módulo** → expanda a **API pública** de forma **não-quebrante** (adicionar, nunca alterar assinatura existente). Ex: roteamento de custo por produto é responsabilidade do cliente de LLM → adicionar *nele*.
- **(b) A capacidade é específica da feature** → implemente **no próprio slice**, consumindo a API pública do módulo. Não enfie código de feature dentro do módulo comum.

**Teste (a) vs (b):** "isto usa o *interior* do módulo, ou só **orquestra** o público dele?" Se só orquestra o público (ex: um fan-out/batch sobre uma função pública) e só esta feature precisa → é (b), vive no slice.
**Por quê:** o contrato público é a fronteira estável e testável. Puxar arquivo interno acopla a feature à *implementação* do módulo — qualquer refactor interno quebra a feature silenciosamente.

### 6. Fronteiras verificadas pelo build, não pelo code review
Linter/CI falha em import cruzado e em violação de contrato de `shared/`. Configs concretos em [references/boundary-enforcement.md](references/boundary-enforcement.md).
**Por quê:** disciplina humana não escala — muito menos com IA escrevendo código. Compilador sempre lembra.

### 7. Deleção é o teste da arquitetura
Remover uma feature precisa ser `rm -rf modules/<feature>/` + 1 linha do registry. Se não for, a arquitetura falhou.
**Por quê:** features morrem o tempo todo. Arquitetura que não suporta deleção barata vira cemitério de código zumbi. É a validação operacional de que o acoplamento é de fato baixo.

### 8. Cada módulo tem um MODULE.md
No topo da pasta, arquivo curto (~30-60 linhas) com: propósito, entry points, dependências de `shared/`, tabelas/coleções possuídas, contratos publicados/consumidos.
**Por quê:** agente abrindo o módulo lê 1 arquivo e entende o módulo inteiro sem ler todo o código. Economia de milhares de tokens por task. Template em [assets/module-template/MODULE.md](assets/module-template/MODULE.md).

### 9. Um AGENTS.md na raiz
Arquivo machine-readable no root descrevendo convenções, layout, onde fica o quê, comandos principais, regras de fronteira.
**Por quê:** é o primeiro arquivo que o agente lê; elimina dezenas de greps exploratórios. Template pronto em [assets/AGENTS.md.template](assets/AGENTS.md.template).

### 10. Contratos explícitos > acoplamento implícito
Comunicação entre módulos passa por contratos versionados em `shared/contracts/` — schemas Zod/Pydantic, tipos de evento pub-sub.
**Por quê:** contrato explícito permite trocar um módulo sem mexer nos outros e é testável em isolamento.

### 11. Orçamento de contexto — por módulo E por arquivo
Dois limites, aplicados em conjunto:

- **Por módulo:** **warning em 500 linhas, hard limit em ~600 linhas / ~5k tokens** de código ativo. Passou do hard, provavelmente são 2 módulos colados — divida.
- **Por arquivo:** **warning em 200 linhas, hard limit em ~300 linhas.** Um arquivo que ultrapassa quase sempre está fazendo 2 coisas — separe por responsabilidade (não por tamanho arbitrário).

**Exceções legítimas ao limite por arquivo:**
- Migrations (SQL, schema) — ficam do tamanho que precisam
- Fixtures e seeds de dados
- Código gerado (proto, OpenAPI, schemas)
- Arquivos de configuração (ex: roteamento agregado)

**Por quê:**
- Arquivo de 800 linhas obriga o agente (e humano) a carregar 800 linhas de contexto para mudar 5. Os 795 restantes são poluição cognitiva.
- Diff fica ilegível — code review perde eficácia.
- Teste do single-responsibility: "posso descrever o que este arquivo faz em uma frase sem conjunção?" Se não, parta.
- Ferramentas de IA cacheiam pior arquivos que mudam com frequência por razões não-relacionadas (cada mudança invalida cache do arquivo inteiro).

**Estratégia ao passar do limite:** partir por responsabilidade/conceito (`domain.py` vira `domain_order.py` + `domain_payment.py`), não por "metade do arquivo". E, se as partes moram claramente em features diferentes, podem virar módulos diferentes.

### 12. Scaffold é script, não memorização
Criar módulo novo é `scripts/scaffold_module.sh <nome>` — cópia do template + substituição de placeholders.
**Por quê:** evita que o agente recrie o esqueleto do zero a cada feature, com variações sutis que erodem o padrão.

### 13. Nomes que falam
`modules/publish_meta_ads/` em vez de `modules/publisher/`. Verbo + substantivo concreto.
**Por quê:** nome do módulo serve de índice mental e semântico. Bom nome = agente acha sem precisar greppar.

## Layout padrão

```
/
├── AGENTS.md                        ← spec machine-readable para IA
├── README.md                        ← para humanos
├── /modules
│   ├── /briefing                    ← uma feature
│   │   ├── MODULE.md                ← manifest do módulo
│   │   ├── domain.{py,ts,go}
│   │   ├── handlers.{py,ts,go}
│   │   ├── ui.{tsx,vue,html}        ← se aplicável
│   │   ├── migrations/              ← tabelas do módulo
│   │   ├── fixtures/
│   │   └── tests/
│   ├── /persona_gen
│   └── /copy_gen
├── /shared                          ← CAMADA COMUM (nome é exemplo: pode ser core/, infra/, lib/…)
│   ├── /db                          ← infra
│   ├── /logger                      ← infra
│   ├── /http_client                 ← infra
│   ├── /llm_client                  ← infra
│   ├── /queue                       ← infra
│   ├── /auth                        ← infra
│   ├── /calc                        ← especialista transversal NÃO-infra (ex.)
│   └── /contracts                   ← schemas de evento entre módulos
├── /tests
│   └── /e2e                         ← testes que cruzam módulos (raros)
├── /config
│   └── /lint                        ← import-linter.ini, eslint-boundaries.json
└── /scripts
    └── scaffold_module.sh
```

Preferir pasta plana dentro do módulo. Reintroduzir camadas (`application/`, `domain/`, `infrastructure/`) dentro do módulo só quando dor real aparecer — frequentemente significa que o módulo virou 2.

## Workflow — iniciar projeto novo

1. Criar `modules/` e `shared/` com o mínimo (`db/`, `logger/`).
2. Copiar `AGENTS.md` para a raiz a partir de [assets/AGENTS.md.template](assets/AGENTS.md.template) e preencher o cabeçalho.
3. Configurar enforcement de fronteiras — escolher stack em [references/boundary-enforcement.md](references/boundary-enforcement.md) e aplicar.
4. Criar a primeira feature com `scripts/scaffold_module.sh <nome>` (ou copiar [assets/module-template/](assets/module-template/)).
5. Commit inicial. A partir daqui: 1 feature = 1 pasta = 1 commit.

## Workflow — adicionar feature num projeto que já usa esta arquitetura

1. `./scripts/scaffold_module.sh <nova_feature>`
2. **Levantar o ferramental comum antes de codar** (este é o sentido preferido): leia o índice de especialistas da camada comum no `AGENTS.md` e veja o que já existe. *Depois* liste o que a feature precisa e cruze — reuse os especialistas existentes; só escreva o que é *próprio* da feature. Se notar uma capacidade obviamente transversal que ainda não existe (ex: DB), crie-a já na camada comum.
3. Editar `MODULE.md` — propósito, entry points, deps (incl. quais especialistas comuns consome).
4. Implementar. Nada fora da pasta muda, exceto: registrar rota/tela no router raiz (1 linha) e, se publicar evento novo, adicionar o contrato em `shared/contracts/`.
5. Rodar lint de fronteiras — deve passar.
6. Commit escopado no módulo.

## Workflow — migrar projeto clean-architecture existente

1. Listar features reais do produto (telas, fluxos, jobs).
2. **Identificar a camada comum que já existe** (pode se chamar `core/`, `lib/`, `infra/`…). Infra e especialistas transversais entram *nela*; não crie uma `shared/` nova concorrente.
3. Para cada feature, criar `modules/<feature>/` e mover os arquivos de `controllers/`, `services/`, `repositories/`, `domain/` que pertencem a ela.
4. **Duplicar** *lógica de feature* que antes era "reusada por acidente" entre features — não abstrair ainda. **Mas** capacidade genuinamente transversal que já existe na camada comum continua sendo *reusada*, não duplicada.
5. Promover para a camada comum só capacidade comprovadamente comum (3+ módulos), ou a que for obviamente infra.
6. Ativar enforcement gradual — começar com warning, depois error.
7. Deletar as pastas da arquitetura antiga quando vazias.

Ver [references/anti-patterns.md](references/anti-patterns.md) para armadilhas comuns na migração.

## Otimizações específicas para IA

Detalhe em [references/ai-optimization.md](references/ai-optimization.md). Sumário:

- **AGENTS.md na raiz** — primeiro arquivo que o agente lê; descreve layout + comandos + convenções
- **MODULE.md por módulo** — entry point cognitivo; agente lê 50 linhas em vez de o módulo inteiro
- **Co-location** — tarefa = 1 pasta = menos tokens, menos chance de quebra
- **Nomes que falam** — módulo auto-documentado dispensa grep
- **Scripts de scaffold** — garantem que agente não invente o esqueleto
- **Orçamento de contexto** — módulo > 5k tokens = sinal de split

## Enforcement de fronteiras

Configs prontos por stack em [references/boundary-enforcement.md](references/boundary-enforcement.md):

- **Python** — `import-linter` com contratos por pasta
- **TypeScript/JS** — ESLint `eslint-plugin-boundaries` ou `no-restricted-imports`
- **Go** — `go-cleanarch` ou check custom no CI
- **Rust** — `pub(crate)` + árvore de módulos resolve quase sozinho
- **Java** — ArchUnit

## Anti-patterns (principais)

Catálogo completo em [references/anti-patterns.md](references/anti-patterns.md).

1. **Empréstimo de lógica entre features** — feature `b` importa/reusa o "agente" interno da feature `a` porque "fazem a mesma coisa". Recrie dentro de `b`. (Isto é *acoplar*, não *usar* — ver Princípio 4.)
2. **Reescrever capacidade que já existe** — reimplementar do zero o cliente de LLM / logger / DB em cada feature em vez de consumir o especialista da camada comum. O oposto do anti-pattern acima: aqui o erro é *não* reusar.
3. **Puxar arquivo interno de um módulo** — importar `modulo/algum_arquivo` em vez de consumir a API pública. Se você quer só um arquivo, ou seu uso está errado, ou o módulo está errado — nunca importe o interno. Falta algo? expanda o módulo (não-quebrante) ou crie no slice.
4. **Pasta-lixeira** (`utils/`, `common/`, `helpers/`, `misc/`) na camada comum. Banir pelo nome — só especialistas nomeados.
5. **Bridge module** — `modules/common/` importando de vários módulos "para orquestrar". Acoplamento disfarçado.
6. **God module** — 1 módulo com 40 arquivos. Quase sempre são 3 módulos.
7. **Camadas dentro do módulo** — reintroduzir `application/`, `domain/`, `infrastructure/` em cada feature anula o benefício. Adiar até dor real.
8. **Import cruzado silenciado** — burlar o linter com `# noqa` ou `eslint-disable`. Se precisou, a fronteira está errada — discuta, não silencie.

## Checklist de "projeto estruturado"

- [ ] `AGENTS.md` existe e explica layout, convenções, comandos
- [ ] `AGENTS.md` lista os **especialistas disponíveis na camada comum** (o "ferramental" que features devem reusar)
- [ ] `modules/` tem ≥ 1 feature; cada uma com `MODULE.md`
- [ ] A camada comum só tem **especialistas nomeados** (infra + transversais); sem `utils/`/`common/` e sem regra de negócio de feature
- [ ] Capacidades comuns são **reusadas**, não reescritas a cada feature
- [ ] Nenhuma feature importa lógica *interna* de outra feature (nada de "agente emprestado")
- [ ] Módulos/especialistas são consumidos pela **API pública**, nunca por um arquivo interno solto
- [ ] Capacidade que faltava virou **expansão não-quebrante do módulo** (se é dele) ou **código no slice** (se é da feature) — nunca um arquivo de feature dentro do módulo comum
- [ ] Linter de fronteiras configurado e falhando no CI em violação
- [ ] Script de scaffold de módulo existe e funciona
- [ ] Teste mental: deletar qualquer feature é `rm -rf` + 1 linha?
- [ ] Teste mental: tarefa num módulo cabe em ~5k tokens?
- [ ] Nenhum arquivo ativo (não-fixture, não-migration, não-gerado) com > 300 linhas?
- [ ] Contratos de evento (se houver) em `shared/contracts/`
- [ ] README.md direciona humanos; AGENTS.md direciona IA

## Referências

- [references/principles.md](references/principles.md) — aprofundamento dos 13 princípios, com embasamento na literatura 2026 (token waste, framework-fatigue, build-time arch enforcement)
- [references/boundary-enforcement.md](references/boundary-enforcement.md) — configs concretos de linter por stack
- [references/ai-optimization.md](references/ai-optimization.md) — padrões de AGENTS.md e MODULE.md, orçamento de contexto, tokens
- [references/anti-patterns.md](references/anti-patterns.md) — catálogo de erros e como corrigir
- [assets/AGENTS.md.template](assets/AGENTS.md.template) — template para a raiz do projeto
- [assets/module-template/](assets/module-template/) — esqueleto de módulo pronto para copiar
- [scripts/scaffold_module.sh](scripts/scaffold_module.sh) — scaffold automatizado

## Filosofia em uma linha

**Otimizar para mudar e deletar, não para reusar hipoteticamente.** Em era de IA + produto em iteração rápida, é quase sempre o trade certo.
