# Anti-patterns — catálogo e correções

Problemas comuns que aparecem na adoção do padrão, com sintoma, por que é ruim, e como corrigir.

> **Nota de nomes:** `shared/` aqui é só um **nome de exemplo** da camada comum — ela pode se chamar `core/`, `infra/`, `lib/`. O que os anti-patterns abaixo banem são **pastas-capacidade genéricas** (`utils/`, `common/`, `helpers/`, `misc/`) *dentro* da camada comum, e **regra de negócio** nela — nunca o nome da camada em si.

## 1. `shared/utils/` ou `shared/common/` ou `shared/helpers/`

**Sintoma:** pasta com nome genérico acumulando funções soltas de várias features.

**Por que é ruim:**
- Nome genérico é convite a acumular qualquer coisa. Em 6 meses tem 80 funções e ninguém sabe o que está lá.
- IA e humano recriam a mesma função porque não encontram a existente.
- Vira acoplamento invisível: função em `utils` usada por 5 features cria dependência implícita.

**Correção:**
- Banir os nomes `utils`, `common`, `helpers`, `misc` como **pastas-capacidade dentro da camada comum**. (Atenção: isto **não** é sobre o nome da própria camada — ela pode legitimamente se chamar `core/`, `shared/`, `infra/`. O alvo é a sub-pasta genérica que vira lixeira.)
- Substituir por nomes específicos: `date_formatting/`, `currency/`, `string_sanitization/`.
- Se o que está em `utils` é regra de negócio, mover de volta para o módulo que usa.

## 2. Bridge module

**Sintoma:** `modules/common/`, `modules/orchestrator/`, `modules/core/` — um módulo que importa de vários outros módulos "para orquestrar".

**Por que é ruim:**
- É acoplamento disfarçado. A existência do módulo-ponte cria dependência cíclica potencial.
- Frustra o princípio "módulo não importa módulo".
- Testes viram pesadelo (precisa mockar N módulos).

**Correção:**
- Se é orquestração real (ex: processar um pipeline), mover para um **orquestrador explícito** em `shared/orchestration/` que recebe eventos/contratos dos módulos, não referências diretas.
- Se é coordenação cross-feature (ex: "quando X acontece, Y precisa acontecer"), usar pub/sub com contratos em `shared/contracts/`.
- Se é só porque dois módulos compartilham lógica, aplicar regra do 3.

## 3a. God file

**Sintoma:** um arquivo com > 300 linhas de lógica ativa. Casos típicos: `domain.py` crescendo indefinidamente, `service.ts` com 15 métodos não relacionados, `api.go` com todos os handlers do módulo.

**Por que é ruim:**
- Agente editando o arquivo carrega todas as ~800 linhas no contexto para mudar 5 — 99% dos tokens são ruído.
- Diff fica ilegível — PR de 40 linhas perdido num arquivo de 1000.
- Cache de prompt invalida toda hora (qualquer mudança rehash o arquivo inteiro).
- Humano não navega sem minimap.

**Correção:**
- **Partir por conceito**, não por tamanho arbitrário. `domain.py` (800 linhas) → `domain_order.py` + `domain_payment.py` + `domain_refund.py`.
- Se a divisão não cai naturalmente em conceitos, provavelmente são **módulos** diferentes e não apenas arquivos.
- Não trocar 1 arquivo grande por 10 arquivos de 20 linhas cada — isso reintroduz o custo de navegação. Mirar ~150-250 linhas por arquivo.
- **Exceções:** migrations, fixtures, código gerado, config agregada — esses podem passar do limite sem problema.

## 3b. God module

**Sintoma:** um módulo com > 600 linhas totais de código ativo (ou > 20 arquivos), responsável por "várias coisas relacionadas".

**Por que é ruim:**
- Não cabe em contexto de IA (orçamento de tokens estourado).
- Tarefa típica lê muita coisa irrelevante.
- Quase sempre são 2-4 módulos colados em 1.

**Correção:**
- Listar os entry points do módulo. Se há 3+ grupos distintos (ex: "criar pedido", "processar devolução", "gerar fatura"), são 3 módulos.
- Dividir em 2 passos: (a) mover arquivos para novas pastas, (b) configurar o linter para enforçar a nova separação.
- Pode gerar eventos entre os novos módulos se antes chamavam-se diretamente.

## 4. Camadas dentro do módulo

**Sintoma:** cada módulo tem `application/`, `domain/`, `infrastructure/`, `presentation/` — você reintroduziu clean architecture dentro de cada feature.

**Por que é ruim:**
- Anula o benefício principal: o "1 pasta, 1 contexto" vira "1 pasta com 4 subpastas, ainda precisa saltar".
- Adiciona cerimônia (interfaces, DI) sem benefício real na maioria dos módulos.
- IA fica confusa sobre onde colocar código novo (em domain ou application?).

**Correção:**
- Default: módulo plano (`modules/checkout/domain.py`, `handlers.py`, `ui.tsx`).
- Adicionar camadas **só** quando o módulo crescer a ponto de justificar (raro). Sinais: > 1000 linhas, múltiplos entry points, lógica de domínio genuinamente complexa.
- Se adicionar camadas, seja explícito no `MODULE.md` sobre por quê.

## 5. Import cruzado silenciado

**Sintoma:** `# noqa: arch`, `// eslint-disable-next-line boundaries/element-types`, `@SuppressWarnings("arch")` em volta de imports entre módulos.

**Por que é ruim:**
- Anula o enforcement. Uma exceção vira padrão em 3 meses.
- O motivo de ter feito isso provavelmente vale refletir — é sinal de que a fronteira está errada.

**Correção:**
- Nenhum silenciamento sem PR explicando. Reviewer pergunta: "por que não dá para duplicar? por que não cabe em shared/? por que não é evento?"
- Se a exceção for necessária, virar **nova regra** no linter (permitir esse tipo específico) — não um bypass pontual.
- Considerar que a arquitetura pode estar errada para esse caso e refatorar.

## 6. "Models compartilhados"

**Sintoma:** `shared/models/User.py`, `shared/models/Order.py` — entidades de domínio em `shared/`.

**Por que é ruim:**
- Puxa regra de negócio para `shared/`, que deveria ser infra.
- Qualquer mudança no model afeta todos os módulos — cria acoplamento forte.
- Se o model precisa ser diferente em contextos diferentes (frequentemente precisa), você força tudo num formato só.

**Correção:**
- Cada módulo tem seu próprio model local, com o shape que ele precisa. Pode ter campos diferentes do model de outro módulo.
- Se os módulos precisam trocar informação, usar **contrato** em `shared/contracts/` — DTO dedicado, não o model de domínio.
- Aceitar "duplicação" de campos entre models — é saudável (Bounded Context na terminologia de DDD).

## 7. Shared com regra de negócio

**Sintoma:** `shared/business/price_calculator.py`, `shared/rules/discount_engine.py`.

**Por que é ruim:**
- Regra de negócio é do módulo, não da infra.
- `shared/` inchando de lógica vira um God module disfarçado.

**Correção:**
- Se 1 módulo usa, está no módulo errado.
- Se 2+ módulos usam o mesmo cálculo, provavelmente 1 é o "dono" (ex: módulo `pricing`) e os outros consomem via contrato/evento.
- Regra geral: se o arquivo **tem opinião sobre o produto**, mora no módulo. Se é puramente técnico, `shared/`.

## 8. Database compartilhado sem dono claro

**Sintoma:** tabelas usadas por múltiplos módulos com schemas alterados por qualquer um.

**Por que é ruim:**
- Qualquer módulo muda a tabela, quebra os outros.
- Migrations ficam em `migrations/` central, sem saber a quem pertencem.
- Reintroduz o acoplamento que a arquitetura tenta evitar.

**Correção:**
- Cada tabela tem **um módulo dono**, declarado no `MODULE.md`.
- Migrations vivem na pasta do módulo dono.
- Outros módulos que precisam desses dados consomem via: (a) API interna do módulo dono, (b) evento com os dados necessários, (c) view de leitura dedicada.
- "Views" de leitura (read model) podem ficar em `shared/read_models/` se forem genuinamente cross-feature.

## 9. Testes espelho em pasta separada

**Sintoma:** `tests/modules/checkout/test_checkout.py` enquanto o código vive em `modules/checkout/`.

**Por que é ruim:**
- Tarefa em `checkout` agora precisa abrir 2 pastas em contexto.
- Deletar a feature precisa de `rm -rf` em 2 lugares.
- Agente frequentemente esquece de atualizar testes por "estar distante".

**Correção:**
- Testes unitários e de integração **dentro** do módulo: `modules/checkout/tests/`.
- Apenas testes E2E (que cruzam módulos) ficam em `tests/e2e/` na raiz.

## 10. Feature toggles espalhados

**Sintoma:** `if settings.FEATURE_X_ENABLED:` pulverizado por 10 arquivos em 5 módulos.

**Por que é ruim:**
- Remover uma feature desativada não é `rm -rf`.
- Código morto acumula.
- IA tem que manter contexto de feature flag em toda task que toca o módulo.

**Correção:**
- Feature flag no **router raiz** (registrar ou não o módulo), não pulverizada.
- Módulo desativado = não registrado na aplicação, nada muda dentro dele.
- Quando a feature é matada definitivamente: `rm -rf` + remover linha de registry.

## 11. Circular pela porta dos fundos (via `shared/`)

**Sintoma:** `modules/a` e `modules/b` evitam se importar diretamente, mas ambos importam `shared/big_thing` que conhece ambos os módulos.

**Por que é ruim:**
- `shared/big_thing` virou bridge module disfarçado.
- Recria o acoplamento que a regra evita.

**Correção:**
- `shared/` **nunca** importa de `modules/*`. Tem linter para isso.
- Se `big_thing` precisa de dados de módulos, os dados chegam via parâmetro (chamador passa) ou evento — não import.

## 12. README.md na raiz tentando ser AGENTS.md

**Sintoma:** README.md gigante com tutoriais, layout, comandos, contexto histórico, docs de design — tudo num arquivo.

**Por que é ruim:**
- Agente lê tudo a cada task — desperdício.
- Humano novo se perde no que é relevante pra começar.

**Correção:**
- README.md = para humanos; curto, objetivo, descobribilidade ("o que é esse projeto", "como rodar localmente", "como contribuir").
- AGENTS.md = para agentes; machine-readable, layout, comandos, convenções.
- Detalhes vão em `.claude/docs/` ou `docs/`, linkados dos dois anteriores conforme relevância.

## 13. Empréstimo de lógica entre features

**Sintoma:** a feature `b` importa (ou copia-cola "por enquanto") o agente/handler/serviço *interno* da feature `a` porque "fazem a mesma coisa". Ex: `from modules.a.agent_b import run`.

**Por que é ruim:**
- É acoplamento de feature disfarçado de reúso. As duas features passam a evoluir juntas mesmo sendo responsabilidades distintas.
- Quando `a` mudar o `agent_b` para o que *ela* precisa, quebra `b` — e ninguém esperava.
- Frustra o teste da deleção: matar `a` agora quebra `b`.

**Por que NÃO é o mesmo que usar a camada comum:** usar `llm_client`/`logger`/`db` é consumir uma capacidade *sem dono de feature*, projetada para ser compartilhada. O `agent_b` é **lógica da feature `a`** — tem dono, tem opinião sobre o domínio de `a`.

**Correção:**
- Recriar um agente próprio dentro de `b`. Duplicação de lógica de feature é barata e correta.
- Se, com o tempo, 3 features tiverem um agente quase idêntico que é na verdade uma *capacidade transversal* (não regra de negócio), aí sim promova a parte genérica para a camada comum (Regra do 3) — deixando a regra de negócio em cada feature.

## 14. Reescrever capacidade que já existe

**Sintoma:** cada feature reimplementa do zero a chamada ao provedor de LLM, o logger, o acesso a DB — em vez de consumir o especialista que já está na camada comum. Frequentemente porque o agente **não sabia que o especialista existia**.

**Por que é ruim:**
- Duplica infra (não lógica de feature) — N implementações divergentes de retry/timeout/auth, cada uma com bugs próprios.
- O oposto do anti-pattern 13: aqui o erro é *deixar de reusar* o que deveria ser reusado.

**Correção:**
- Antes de codar uma capacidade, **descobrir o ferramental comum**: ler a tabela de especialistas no `AGENTS.md` e olhar a camada comum. Reusar o que existe.
- Manter o `AGENTS.md` com a lista de especialistas disponíveis e como importá-los — é o que torna o reúso descobrível para humanos e IA.
- Capacidade obviamente transversal que ainda não existe (ex: cliente de LLM no projeto novo): criar **uma vez** na camada comum, não em cada feature.

## 15. Furar a interface pública de um módulo

**Sintoma:** `from modulo.interno_privado import _coisa` — importar um arquivo/símbolo que o módulo **não pretende** expor, só porque você precisa de um pedaço dele.

**Não confundir com uso legítimo de submódulo público:** se o módulo *projetou* `provider`/`fallback`/etc. como entradas públicas (reexportadas, documentadas, sem prefixo `_`), usá-las é **correto** — elas são a interface, mesmo sendo arquivos. A violação é passar por cima da interface *pretendida*. Cabe ao agente distinguir um do outro para não gerar acoplamento incorreto.

**Por que é ruim:**
- Acopla a feature à *implementação privada* do módulo. O dono refatora o interno (direito dele — é privado) e sua feature quebra sem aviso.
- Foge do contrato testável que o módulo oferece.

**Correção:**
- Descobrir a interface pública (o que `__init__`/`__all__` exporta, `MODULE.md`, submódulos sem `_`) e usar por ali. Na dúvida, trate como privado e use a fachada.
- Se o público não tem o que precisa: **(a)** é capacidade do módulo → expor/expandir *no módulo*, não-quebrante; **(b)** é da feature → criar no slice consumindo o público.

## Checklist de saúde

Rodar trimestralmente:

- [ ] Nenhuma pasta-capacidade chamada `utils`, `common`, `helpers`, `misc` dentro da camada comum?
- [ ] Nenhuma feature importa lógica *interna* de outra feature (anti-pattern 13)?
- [ ] Capacidades comuns (LLM, log, DB) são reusadas, não reescritas por feature (anti-pattern 14)?
- [ ] `AGENTS.md` lista os especialistas da camada comum e como usá-los?
- [ ] Todo módulo tem `MODULE.md` atualizado (tabelas, contratos, entry points)?
- [ ] Nenhum bypass de linter de fronteira no código atual?
- [ ] Nenhum módulo > 600 linhas que não esteja justificado no `MODULE.md`?
- [ ] Nenhum arquivo ativo (não-fixture, não-migration, não-gerado) > 300 linhas?
- [ ] Testes dentro dos módulos, exceto E2E?
- [ ] Feature flags apenas no registry da aplicação, não pulverizadas?
- [ ] Consigo deletar uma feature aleatória em < 5 min?
