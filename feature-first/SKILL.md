---
name: feature-first
description: Esta skill deve ser usada quando o usuário quiser "iniciar um novo projeto", "estruturar um projeto para IA", "arquitetura para desenvolvimento com agentes", "evitar over-engineering", "vertical slice", "feature-sliced", "screaming architecture", "modular monolith", "arquitetura que reduza custo de tokens", "organizar código por funcionalidade", "package by feature", ou perguntar como montar um codebase onde agentes de IA trabalhem com menos erros e menos custo. É agnóstica de stack (Python, TS/JS, Go, Rust, Java). Estabelece módulos por feature, kernel compartilhado enxuto, enforcement de fronteiras no build, e convenções IA-friendly (AGENTS.md na raiz, MODULE.md por módulo, co-location radical) que reduzem o contexto necessário por tarefa e impedem quebra cruzada entre features. Aplicável em projetos novos e em migrações de projetos existentes que viraram monolito bagunçado ou clean architecture ritualística.
---

# Feature-First Architecture

Organizar código em **slices verticais por feature**, com um **kernel compartilhado pequeno** para infra genuinamente comum, e **fronteiras verificadas no build**. Otimiza para o padrão de trabalho de agentes de IA: pouco contexto por tarefa, baixo raio de quebra, deleção barata.

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

1. **Cada feature do produto é uma pasta independente** que contém tudo que ela precisa — UI, domínio, handlers, testes, migrations, fixtures.
2. **`shared/` contém só infra não-opinada** (DB, logger, HTTP, auth, fila, contratos) — nunca regra de negócio; código entra lá só após 3 módulos usarem o mesmo (regra do 3).
3. **Módulo nunca importa módulo** — comunicação entre módulos (quando inevitável) passa por contrato/evento em `shared/contracts/`. O build rejeita import cruzado.

## Princípios (com o porquê)

### 1. Co-location radical
Tudo da feature fica na pasta da feature: handlers, UI, domínio, testes, migrations, fixtures, tipos. Nada de `tests/` na raiz espelhando `src/`, nada de `types/` global.
**Por quê:** agente abrindo a task "mudar tela de teatro" precisa de 1 pasta em contexto, não 8 pastas espalhadas. Reduz tokens e impede que um arquivo-espelho seja esquecido.

### 2. Regra do 3 para promover ao `shared/`
Duplicação entre 2 módulos é tolerada. Só na 3ª ocorrência o código candidato é promovido para `shared/`.
**Por quê:** duplicação barata > abstração errada. Agente que abstrai na 2ª amostra fabrica uma *bridge* que vai servir mal aos 3 casos depois. Só com 3 amostras você conhece a forma certa do abstrato.

### 3. `shared/` é infra, não "utils"
`shared/` acomoda: acesso a DB, logger, HTTP client, cliente de LLM, fila, auth, contratos de evento. `shared/` **não** acomoda: regras de negócio, `utils/`, `helpers/`, `common/`, `misc/`.
**Por quê:** pastas com nomes genéricos viram lixeira — em 2 anos seu `utils/` tem 400 funções que ninguém sabe onde usar. Nomes específicos (`shared/http_client/`) forçam decisão consciente.

### 4. Módulo nunca importa módulo
Se `park/` precisa de algo de `theater/`, três opções nessa ordem:
(a) não precisa mesmo — duplicar;
(b) extrair o pedaço genuinamente comum para `shared/`;
(c) comunicar via evento em `shared/contracts/`.
Import cruzado direto é proibido e o build falha.
**Por quê:** import cruzado é como a arquitetura morre. Um import hoje vira 20 em 6 meses e o grafo fica ilegível. IA é especialmente propensa a criar esses imports em nome de "reusar". Enforcement mata isso na raiz.

### 5. Fronteiras verificadas pelo build, não pelo code review
Linter/CI falha em import cruzado e em violação de contrato de `shared/`. Configs concretos em [references/boundary-enforcement.md](references/boundary-enforcement.md).
**Por quê:** disciplina humana não escala — muito menos com IA escrevendo código. Compilador sempre lembra.

### 6. Deleção é o teste da arquitetura
Remover uma feature precisa ser `rm -rf modules/<feature>/` + 1 linha do registry. Se não for, a arquitetura falhou.
**Por quê:** features morrem o tempo todo. Arquitetura que não suporta deleção barata vira cemitério de código zumbi. É a validação operacional de que o acoplamento é de fato baixo.

### 7. Cada módulo tem um MODULE.md
No topo da pasta, arquivo curto (~30-60 linhas) com: propósito, entry points, dependências de `shared/`, tabelas/coleções possuídas, contratos publicados/consumidos.
**Por quê:** agente abrindo o módulo lê 1 arquivo e entende o módulo inteiro sem ler todo o código. Economia de milhares de tokens por task. Template em [assets/module-template/MODULE.md](assets/module-template/MODULE.md).

### 8. Um AGENTS.md na raiz
Arquivo machine-readable no root descrevendo convenções, layout, onde fica o quê, comandos principais, regras de fronteira.
**Por quê:** é o primeiro arquivo que o agente lê; elimina dezenas de greps exploratórios. Template pronto em [assets/AGENTS.md.template](assets/AGENTS.md.template).

### 9. Contratos explícitos > acoplamento implícito
Comunicação entre módulos passa por contratos versionados em `shared/contracts/` — schemas Zod/Pydantic, tipos de evento pub-sub.
**Por quê:** contrato explícito permite trocar um módulo sem mexer nos outros e é testável em isolamento.

### 10. Orçamento de contexto — por módulo E por arquivo
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

### 11. Scaffold é script, não memorização
Criar módulo novo é `scripts/scaffold_module.sh <nome>` — cópia do template + substituição de placeholders.
**Por quê:** evita que o agente recrie o esqueleto do zero a cada feature, com variações sutis que erodem o padrão.

### 12. Nomes que falam
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
├── /shared
│   ├── /db
│   ├── /logger
│   ├── /http_client
│   ├── /llm_client
│   ├── /queue
│   ├── /auth
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
2. Editar `MODULE.md` — propósito, entry points, deps.
3. Implementar. Nada fora da pasta muda, exceto: registrar rota/tela no router raiz (1 linha) e, se publicar evento novo, adicionar o contrato em `shared/contracts/`.
4. Rodar lint de fronteiras — deve passar.
5. Commit escopado no módulo.

## Workflow — migrar projeto clean-architecture existente

1. Listar features reais do produto (telas, fluxos, jobs).
2. Para cada feature, criar `modules/<feature>/` e mover os arquivos de `controllers/`, `services/`, `repositories/`, `domain/` que pertencem a ela.
3. **Duplicar** código que antes era "reusado por acidente". Não abstrair ainda.
4. Promover para `shared/` só infra comprovadamente comum (3+ módulos).
5. Ativar enforcement gradual — começar com warning, depois error.
6. Deletar as pastas da arquitetura antiga quando vazias.

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

## Anti-patterns (top 5)

Catálogo completo em [references/anti-patterns.md](references/anti-patterns.md).

1. **`shared/utils/`** — pasta-lixeira. Banir pelo nome.
2. **Bridge module** — `modules/common/` importando de vários módulos "para orquestrar". Acoplamento disfarçado.
3. **God module** — 1 módulo com 40 arquivos. Quase sempre são 3 módulos.
4. **Camadas dentro do módulo** — reintroduzir `application/`, `domain/`, `infrastructure/` em cada feature anula o benefício. Adiar até dor real.
5. **Import cruzado silenciado** — burlar o linter com `# noqa` ou `eslint-disable`. Se precisou, a fronteira está errada — discuta, não silencie.

## Checklist de "projeto estruturado"

- [ ] `AGENTS.md` existe e explica layout, convenções, comandos
- [ ] `modules/` tem ≥ 1 feature; cada uma com `MODULE.md`
- [ ] `shared/` contém só infra não-opinada; sem `utils/` ou `common/`
- [ ] Linter de fronteiras configurado e falhando no CI em violação
- [ ] Script de scaffold de módulo existe e funciona
- [ ] Teste mental: deletar qualquer feature é `rm -rf` + 1 linha?
- [ ] Teste mental: tarefa num módulo cabe em ~5k tokens?
- [ ] Nenhum arquivo ativo (não-fixture, não-migration, não-gerado) com > 300 linhas?
- [ ] Contratos de evento (se houver) em `shared/contracts/`
- [ ] README.md direciona humanos; AGENTS.md direciona IA

## Referências

- [references/principles.md](references/principles.md) — aprofundamento dos 12 princípios, com embasamento na literatura 2026 (token waste, framework-fatigue, build-time arch enforcement)
- [references/boundary-enforcement.md](references/boundary-enforcement.md) — configs concretos de linter por stack
- [references/ai-optimization.md](references/ai-optimization.md) — padrões de AGENTS.md e MODULE.md, orçamento de contexto, tokens
- [references/anti-patterns.md](references/anti-patterns.md) — catálogo de erros e como corrigir
- [assets/AGENTS.md.template](assets/AGENTS.md.template) — template para a raiz do projeto
- [assets/module-template/](assets/module-template/) — esqueleto de módulo pronto para copiar
- [scripts/scaffold_module.sh](scripts/scaffold_module.sh) — scaffold automatizado

## Filosofia em uma linha

**Otimizar para mudar e deletar, não para reusar hipoteticamente.** Em era de IA + produto em iteração rápida, é quase sempre o trade certo.
