# Princípios — aprofundamento

Este arquivo expande cada princípio do SKILL.md com exemplos, trade-offs e embasamento na literatura 2026 sobre desenvolvimento assistido por IA.

## Contexto teórico

A Clean Architecture clássica (Uncle Bob, 2012) foi desenhada para **facilitar a compreensão humana** de sistemas grandes: camadas concêntricas, dependências apontando para o domínio, ports/adapters para substituir infra. O custo implícito — muitos arquivos, muita indireção, muita cerimônia — era aceitável porque humanos liam código uma vez e modificavam várias vezes.

O padrão 2026 é diferente: **agentes de IA leem o código a cada tarefa**. Cada leitura custa tokens, cada indireção é um salto mental que o agente pode errar, e cada arquivo extra é mais uma coisa que pode ser esquecida. Estudos recentes mostram:

- Tracking de 42 runs em FastAPI: 70% dos tokens desperdiçados em leituras de arquivos irrelevantes.
- Codebases fragmentados forçam agentes a reler e reexplorar — custo efetivo por tarefa sobe mesmo com preço por token caindo.
- 45% dos devs que testaram LangChain nunca colocaram em produção; 23% removeram depois — abstração excessiva mata debuggabilidade.
- LLMs quebram regras arquiteturais em uma geração (ex: adicionar `@Service`, lançar exception, importar Spring numa classe de domínio) — a solução que emergiu é **enforcement no build**, não na revisão.

Feature-First Architecture é a resposta: **otimizar para o padrão de trabalho do agente** — pouco contexto por tarefa, fronteiras automaticamente verificadas, deleção barata.

## 1. Co-location radical

**Regra:** tudo que pertence a uma feature mora na pasta da feature.

**Bom:**
```
modules/checkout/
├── MODULE.md
├── domain.py
├── handlers.py
├── ui.tsx
├── fixtures/
│   └── sample_cart.json
├── migrations/
│   └── 001_checkout_tables.sql
└── tests/
    └── test_checkout.py
```

**Ruim (layered/clean classical):**
```
src/
├── controllers/checkout_controller.py
├── services/checkout_service.py
├── repositories/checkout_repository.py
├── domain/checkout.py
tests/
└── checkout/...
migrations/
└── 001_checkout.sql
```

No ruim, uma tarefa em checkout precisa: grep "checkout" em 4 pastas, ler 6 arquivos, guardar mentalmente os imports entre eles. No bom, `ls modules/checkout/` entrega tudo.

**Trade-off:** "mas e se `checkout_service` for usado pelo admin panel?" — Esse é o ponto do princípio 4: se dois módulos precisam da mesma coisa, ou é infra (vai pro `shared/`) ou é evento (vai pro `shared/contracts/`). O que **não** pode ser é chamada direta.

> **Nota de nomes:** ao longo deste arquivo, `shared/` e `modules/` são **nomes de exemplo** da camada comum e das features. A camada comum pode se chamar `core/`, `infra/`, `lib/` — o que importa é o papel, nunca o nome. Em projeto existente, descubra e respeite a convenção que já está lá.

## 2. Reúso primeiro; Regra do 3 só para o novo e incerto

São **dois movimentos distintos** que costumam ser confundidos:

**(a) Consumir o que já existe — imediato, sem espera.** Se a capacidade já mora na camada comum (DB, logger, cliente de LLM, HTTP), a feature nº1 a **usa no dia 1**. Não existe "regra do 3" para *consumo*. Reescrever do zero algo que já existe é um erro de arquitetura — antes de codar uma capacidade, descubra se o projeto já a tem.

**(b) Promover algo novo — aí sim, Regra do 3.** Código *novo* só é extraído para a camada comum quando 3+ módulos usarem algo muito parecido.

**Por que 3 e não 2:** com 2 amostras, você está chutando a forma do abstrato. Com 3, você vê o que é comum *de verdade* e o que era coincidência. É a mesma intuição por trás de DRY ser "don't repeat yourself" e não "don't ever duplicate" — DRY original aplicava-se a **conhecimento**, não a similaridade sintática.

**Exemplo de promoção:**
- Módulo `user_registration` tem uma função `hash_password()`.
- Módulo `admin_password_reset` também precisa de `hash_password()`. → **duplique**.
- Módulo `api_key_rotation` também precisa de `hash_password()`. → **agora** promova para `<comum>/auth/hashing.py`.

**Exceção à Regra do 3 — o óbvio.** Capacidade obviamente transversal (DB, log, HTTP, auth) não precisa de 3 provas: já nasce na camada comum, porque toda feature vai precisar. A Regra do 3 existe para o *especulativo* — aquilo que talvez seja comum, mas você ainda não sabe (ver Princípio 3).

**Armadilha comum:** agente (e humano ansioso) vê a 2ª ocorrência de algo especulativo e quer refatorar imediatamente. Resistir. A duplicação é barata; a abstração errada é cara.

## 3. A camada comum é especialista nomeado — não "utils", não regra de negócio

**O critério NÃO é "é infra?".** É: *"é uma capacidade **nomeada, de propósito único, não-específica de nenhuma feature**, que mais de uma feature precisa?"*. Infra passa, mas especialistas transversais **não-infra** também passam.

**Teste:** se o arquivo/pasta na camada comum **tem opinião sobre o domínio do produto**, está no lugar errado. Se é uma capacidade técnica ou transversal nomeada, está certo.

**Entra na camada comum:**
- `db/` — conexão, migrations runner, transação *(infra)*
- `logger/` — factory de logger estruturado *(infra)*
- `http_client/` — wrapper de retries, timeouts, tracing *(infra)*
- `llm_client/` — cliente de chamada a provedores de LLM *(infra)*
- `queue/` — publish, subscribe, ack *(infra)*
- `auth/` — verificação de token, hashing de senha *(infra)*
- `calc/`, `date_formatting/`, `geo/` — **especialistas transversais que não são infra**, mas são genuinamente comuns
- `contracts/` — schemas de evento entre módulos

**Não entra:**
- `utils/`, `common/`, `helpers/`, `misc/` — nome diz nada; lixeira garantida
- `business_logic/` — regra de negócio mora no módulo
- `models/` — modelos de domínio são do módulo; se 2 módulos precisam do mesmo modelo, provavelmente deveriam ser 1 módulo

**Racionalizar a promoção — óbvio vs. especulativo.** A grande dificuldade é decidir *quando* algo vira comum:
- **Obviamente comum:** DB, log, HTTP, auth. Você sabe de antemão que toda feature vai precisar. → vai para a camada comum **desde a 1ª feature**, sem esperar.
- **Especulativamente comum:** um módulo de cálculo, por exemplo. A 1ª feature que o escreve **não tem como saber** que outras features vão precisar dele. → fica **dentro da feature** até a 2ª/3ª aparecer; aí a Regra do 3 o promove. Promover na 1ª é adivinhação.

**Por que o nome importa tanto:** pasta com nome genérico é convite a acumular tudo. Pasta com nome específico ("http_client", "geo") força a pergunta "isso é de http? de geo?". Se não é, vai pra outro lugar — ou fica no módulo. (O **nome da camada** em si — `shared/`, `core/`, `infra/` — é convenção do projeto e não está em questão aqui; o que se bane são pastas-*capacidade* genéricas *dentro* dela.)

## 4. Módulo nunca importa módulo — mas usar a camada comum é encorajado

**Distinção que precede tudo: *usar* ≠ *acoplar*.**
- **Usar/chamar a camada comum** (o cliente de LLM, o logger, o DB) é **correto e desejável** — é a razão de ela existir. Esta regra **não** proíbe isso, e o medo de "acoplar" jamais deve virar desculpa para reimplementar infra dentro da feature.
- **Acoplar a outra feature** — importar código *interno* de outra feature — é o que está **proibido**, verificado no build.

**O caso que mais confunde IA — "agente emprestado".** A feature `a` tem um agente/handler `B`. A feature `b` precisa de algo que *parece* o mesmo. A tentação é importar o `B` de `a`. **Errado.** Recrie um `B` próprio dentro de `b`. Mesmo que hoje sejam idênticos, são responsabilidades de features diferentes que vão divergir — o empréstimo cria um acoplamento que trava as duas. Isso **não** é o mesmo que reusar `llm_client`: o `llm_client` é uma capacidade comum sem dono de feature; o agente `B` é lógica de `a`.

**A regra é absoluta.** Não "prefira não importar", não "use com moderação" — import entre features é **proibido**, verificado no build.

**O que fazer quando parecer que precisa:**

**Opção A — duplicar.** Quase sempre a resposta certa para *lógica de feature*. A função `format_currency_brl()` pode existir em dois módulos sem drama, e o agente `B` é recriado em cada feature que precisa dele.

**Opção B — extrair para a camada comum.** Quando for capacidade genuinamente transversal (Regra do 3, ou já se for óbvia como infra). Ex: `<comum>/formatting/currency`.

**Opção C — comunicar via contrato/evento.** Quando a necessidade é orquestração, não reuso de código.
```
# Módulo checkout publica evento:
event = OrderPlaced(order_id=..., amount=...)
queue.publish("order.placed", event.model_dump())

# Módulo notifications consome:
@subscribe("order.placed")
def send_order_email(event_dict):
    event = OrderPlaced.model_validate(event_dict)
    ...
```

O contrato `OrderPlaced` mora em `shared/contracts/`. Nem `checkout` conhece `notifications`, nem vice-versa. Adicionar `analytics` amanhã que também consome `order.placed` é `mkdir modules/analytics/` + subscribe. Zero mudança nos outros.

## 5. Consuma o módulo pela API pública; estenda-o ou crie no slice quando faltar

**Um módulo é uma capacidade, não um saco de arquivos.** Ele tem uma **superfície pública**, e você consome *essa superfície*. Vale para módulos de feature **e** para especialistas da camada comum (`db`, `llm`, `geography`…).

**Cuidado: "superfície pública" ≠ "só o `__init__`".** O que é público é o que o módulo *decide expor*, e isso varia por módulo:
- **Módulo fechado** — um `__init__`/índice reexporta tudo. A fachada é a única porta; use só ela.
- **Módulo com várias entradas públicas** — ele expõe submódulos/arquivos *projetados* para uso direto. Ex: dentro de `core.llm`, um `provider` que fala com os provedores e um `fallback` que cuida do fallback podem ser entradas públicas legítimas. Importar `core.llm/provider` aqui **não** é violação — esse arquivo *é* a interface. No fim das contas o módulo é a pasta; o que conta é o que ela pretende expor.

**O proibido é passar por cima da interface pretendida** — puxar um *interno privado* só porque você precisa de um pedaço dele. Isso, sim, é `from modulo.coisa_interna_privada import _x`.

**Cabe ao agente descobrir a interface pública** e distinguir os dois casos — para não gerar acoplamento incorreto. Pistas: o que `__init__`/`__all__` exporta, convenções de nome (`_privado`), o `MODULE.md` do módulo, a estrutura de submódulos, docstrings. Na dúvida, trate como privado e use a fachada.

**Quando você puxa um interno privado, é um sintoma.** Significa:
- **Seu uso está errado** — a capacidade já existe na superfície pública; você só não a encontrou. Procure de novo.
- **O módulo está errado** — a capacidade deveria ser pública e não é. A correção é *no módulo* (expor / promover a submódulo público), não importar o privado.

**Quando o especialista não fornece o que a feature precisa — decisão (a)/(b):**

**(a) A capacidade pertence ao módulo.** Expanda a **API pública** do módulo, de forma **não-quebrante** (adicionar símbolo/parâmetro opcional, nunca mudar assinatura existente).
> *Exemplo:* roteamento de custo de LLM por produto é responsabilidade do cliente de LLM. Adicionar um "grupo geography" ao `core.llm` é expansão legítima do módulo; a feature só chama o público `call_llm_with_fallback`.

**(b) A capacidade é específica da feature.** Implemente **dentro do slice**, consumindo a API pública do módulo. Não crie um arquivo novo *dentro do módulo comum* para servir uma única feature.
> *Exemplo:* um `enrich_units_batch` que só faz fan-out (semáforo + gather) sobre o público `enrich_units`, e que só uma feature precisa, **não** vira `core/geography/batch.py` — ele vive no slice e chama o público.

**Teste rápido (a) vs (b):** *"isto usa o interior do módulo, ou só orquestra o público dele?"*
- Usa o interior / é capacidade genuína do domínio do módulo → **(a)**, expande o módulo.
- Só orquestra o público (fan-out, batch, retry-wrapper) e/ou só esta feature precisa → **(b)**, vive no slice.

**Por que isso importa:** o contrato público é a fronteira **estável e testável**. Importar um arquivo interno acopla a feature à *implementação* do módulo — o autor do módulo refatora o interno (legítimo, porque é privado) e quebra a sua feature sem aviso. E enfiar código de uma feature dentro do módulo comum infla o módulo e mistura donos: quem mantém aquilo?

## 6. Enforcement no build

**Princípio:** regras arquiteturais viram **erros de compilação/CI**, não comentários de code review.

Humano esquece. Code review é amostra. IA não tem autoridade para recusar. Compilador/linter é inflexível e escala.

Configs em [boundary-enforcement.md](boundary-enforcement.md). O essencial:

- Import de `modules/<a>/` a partir de `modules/<b>/` → erro
- Import de regras de negócio a partir de `shared/` → erro
- Import de implementação interna de outro módulo (quebrar encapsulamento) → erro

**Política de escape hatch:** permitir `# noqa: arch` é o mesmo que não ter regra. Se um caso exige exceção, a discussão vai para PR; a exceção vira nova regra ou refatoração.

## 7. Deleção como teste

**Pergunta diagnóstica:** "quanto tempo leva para remover a feature X?"

| Tempo | Saúde |
|---|---|
| `rm -rf` + 1 linha de registry (5 min) | Excelente |
| Remoção + 2-3 arquivos em `shared/` (30 min) | OK |
| Grep em todo lugar + remover imports em 10 módulos (horas) | Arquitetura falhou |

Features morrem: produtos pivotam, experimentos param, reguladores exigem remoção. Código zumbi (feature desativada mas ainda importada) é problema clássico de arquiteturas acopladas.

**Exercício recomendado:** uma vez por mês, escolha uma feature e pergunte "se matássemos isso hoje, o que quebraria?". Se a resposta é complicada, você sabe onde refatorar.

## 8. MODULE.md por módulo

**Formato mínimo** (template completo em `assets/module-template/MODULE.md`):

```markdown
# checkout

## Propósito
Processa carrinho → pedido → pagamento.

## Entry points
- `handlers.py::create_checkout_session()` — endpoint POST /checkout
- `handlers.py::handle_payment_webhook()` — webhook do Stripe

## Dependências de shared/
- `shared/db` — tabelas: `orders`, `payments`
- `shared/queue` — publica `order.placed`
- `shared/http_client` — chamada à Stripe

## Contratos publicados
- `OrderPlaced` (em `shared/contracts/order.py`)

## Contratos consumidos
(nenhum)

## Tabelas próprias
- `orders`, `payments`, `checkout_sessions`

## Não-objetivos
- Não envia emails — `notifications` reage a `OrderPlaced`.
- Não calcula frete — `shipping_calc` faz via RPC (contrato `ShippingQuote`).
```

**Por que funciona tão bem com IA:** agente carrega `MODULE.md` (50 linhas ≈ 500 tokens) e já sabe: o que o módulo faz, por onde entrar, o que pode e não pode tocar. Sem `MODULE.md`, agente precisa abrir 5-10 arquivos e deduzir — 10x mais tokens, mais chance de erro.

## 9. AGENTS.md na raiz

É para o projeto o que `MODULE.md` é para o módulo. Template em `assets/AGENTS.md.template`.

Seções essenciais:
1. **Layout** — árvore comentada de `modules/` e `shared/`
2. **Convenções** — idioma do código, estilo, TDD sim/não, commits
3. **Comandos** — como testar, como rodar, como scaffold
4. **Regras de fronteira** — módulo não importa módulo, regra do 3, etc.
5. **Onde achar o quê** — "bugs: GitHub Issues; docs de domínio: Notion X; design: Figma Y"

Diferença em relação ao README.md: README é para humanos descobrirem o projeto. AGENTS.md é para o agente operar no projeto. Podem se sobrepor em parte, mas AGENTS.md é *mais preciso e mais machine-friendly* (listas estruturadas, comandos literais, sem prosa decorativa).

## 10. Contratos explícitos

**Schema sobre tipos soltos.** Use Zod (TS), Pydantic (Py), proto (Go/polyglot). O contrato é um arquivo versionado.

```python
# shared/contracts/order.py
from pydantic import BaseModel
from datetime import datetime

class OrderPlaced(BaseModel):
    version: int = 1
    order_id: str
    user_id: str
    amount_cents: int
    currency: str
    placed_at: datetime
```

Ao evoluir, aumentar `version` e manter retrocompatibilidade (ou publicar `OrderPlacedV2` em paralelo até migração). Contratos são fronteira pública; quebras são ruidosas — como deveriam.

## 11. Orçamento de contexto

Heurística: tarefa típica num módulo deve caber em ~5k tokens de código de contexto (≈ 400 linhas efetivas). Se seu módulo tem mais que isso, ou:

- o módulo está fazendo 2+ coisas e deveria ser partido, ou
- o código tem gordura e pede refactor interno (não necessariamente estrutural).

**Como medir:** `wc -l modules/<x>/*.{py,ts,go}` ou, mais fiel, tokens reais. Manter esse número baixo é uma prática saudável que reflete diretamente em custo e acurácia de IA — e em humanos também.

## 12. Scaffold como script

**Por quê:** agente (e humano) deixado criar o esqueleto "à mão" vai variar sutilmente — falta um `tests/`, outro usa `test/`, outro esquece o `MODULE.md`. A variação erode o padrão.

**Script:** copia template, substitui placeholders (`__MODULE_NAME__`, `__YEAR__`), cria estrutura. Em [../scripts/scaffold_module.sh](../scripts/scaffold_module.sh).

## 13. Nomes que falam

**Regra:** nome do módulo = verbo_substantivo concreto, no idioma do projeto.

**Bom:**
- `publish_meta_ads`
- `generate_persona`
- `calculate_shipping`
- `send_transactional_email`

**Ruim:**
- `publisher` (publica o quê?)
- `service` (literalmente qualquer coisa)
- `manager` (idem)
- `common` (proibido)

**Por quê:** quando agente lista `ls modules/`, os nomes dizem o que o produto faz. Quando agente procura "onde eu publico para o Meta?", ele não precisa grep — vai direto em `publish_meta_ads/`.

## Fontes consultadas

- Morph — *The Real Cost of AI Coding in 2026*
- Fastio — *AI Agent Token Cost Optimization Complete Guide 2026*
- SmartScope — *AGENTS.md Optimization Guide 2026*
- Anthropic — *Building Effective Agents*
- Redis — *AI Agent Architecture 2026*
- Wakita — *An LLM Broke My Architecture in One Generation*
- Jimmy Bogard — *Vertical Slice Architecture*
- Robert C. Martin — *Screaming Architecture*
- Kamil Grzybek — *Modular Monolith in Practice*
- Addy Osmani — *My LLM coding workflow going into 2026*
