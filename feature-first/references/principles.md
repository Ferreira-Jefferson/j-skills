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

## 2. Regra do 3

**Regra:** código só é extraído para `shared/` quando 3+ módulos usarem algo muito parecido.

**Por que 3 e não 2:** com 2 amostras, você está chutando a forma do abstrato. Com 3, você vê o que é comum *de verdade* e o que era coincidência. É a mesma intuição por trás de DRY ser "don't repeat yourself" e não "don't ever duplicate" — DRY original aplicava-se a **conhecimento**, não a similaridade sintática.

**Exemplo de aplicação:**
- Módulo `user_registration` tem uma função `hash_password()`.
- Módulo `admin_password_reset` também precisa de `hash_password()`. → **duplique**.
- Módulo `api_key_rotation` também precisa de `hash_password()`. → **agora** promova para `shared/auth/hashing.py`.

**Armadilha comum:** agente (e humano ansioso) vê a 2ª ocorrência e quer refatorar imediatamente. Resistir. A duplicação é barata; a abstração errada é cara.

## 3. `shared/` é infra, não "utils"

**Teste:** se o arquivo/pasta em `shared/` **tem opinião sobre o domínio do produto**, está no lugar errado.

**Entra em `shared/`:**
- `shared/db/` — conexão, migrations runner, transação
- `shared/logger/` — factory de logger estruturado
- `shared/http_client/` — wrapper de retries, timeouts, tracing
- `shared/llm_client/` — cliente de chamada a provedores de LLM
- `shared/queue/` — publish, subscribe, ack
- `shared/auth/` — verificação de token, hashing de senha
- `shared/contracts/` — schemas de evento entre módulos

**Não entra em `shared/`:**
- `shared/utils/` — nome diz nada
- `shared/common/` — idem
- `shared/helpers/` — idem
- `shared/business_logic/` — regra de negócio mora no módulo
- `shared/models/` — modelos de domínio são do módulo; se 2 módulos precisam do mesmo modelo, provavelmente deveriam ser 1 módulo

**Por que o nome importa tanto:** pasta com nome genérico é convite a acumular tudo. Pasta com nome específico ("http_client") força a pergunta "isso é de http?". Se não é, vai pra outro lugar — ou fica no módulo.

## 4. Módulo nunca importa módulo

**A regra é absoluta.** Não "prefira não importar", não "use com moderação" — **proibido**, verificado no build.

**O que fazer quando parecer que precisa:**

**Opção A — duplicar.** Quase sempre a resposta certa na 2ª ocorrência. A função `format_currency_brl()` pode existir em dois módulos sem drama.

**Opção B — extrair para `shared/`.** Quando for infra genuína (regra do 3). `shared/formatting/currency.py`.

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

## 5. Enforcement no build

**Princípio:** regras arquiteturais viram **erros de compilação/CI**, não comentários de code review.

Humano esquece. Code review é amostra. IA não tem autoridade para recusar. Compilador/linter é inflexível e escala.

Configs em [boundary-enforcement.md](boundary-enforcement.md). O essencial:

- Import de `modules/<a>/` a partir de `modules/<b>/` → erro
- Import de regras de negócio a partir de `shared/` → erro
- Import de implementação interna de outro módulo (quebrar encapsulamento) → erro

**Política de escape hatch:** permitir `# noqa: arch` é o mesmo que não ter regra. Se um caso exige exceção, a discussão vai para PR; a exceção vira nova regra ou refatoração.

## 6. Deleção como teste

**Pergunta diagnóstica:** "quanto tempo leva para remover a feature X?"

| Tempo | Saúde |
|---|---|
| `rm -rf` + 1 linha de registry (5 min) | Excelente |
| Remoção + 2-3 arquivos em `shared/` (30 min) | OK |
| Grep em todo lugar + remover imports em 10 módulos (horas) | Arquitetura falhou |

Features morrem: produtos pivotam, experimentos param, reguladores exigem remoção. Código zumbi (feature desativada mas ainda importada) é problema clássico de arquiteturas acopladas.

**Exercício recomendado:** uma vez por mês, escolha uma feature e pergunte "se matássemos isso hoje, o que quebraria?". Se a resposta é complicada, você sabe onde refatorar.

## 7. MODULE.md por módulo

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

## 8. AGENTS.md na raiz

É para o projeto o que `MODULE.md` é para o módulo. Template em `assets/AGENTS.md.template`.

Seções essenciais:
1. **Layout** — árvore comentada de `modules/` e `shared/`
2. **Convenções** — idioma do código, estilo, TDD sim/não, commits
3. **Comandos** — como testar, como rodar, como scaffold
4. **Regras de fronteira** — módulo não importa módulo, regra do 3, etc.
5. **Onde achar o quê** — "bugs: GitHub Issues; docs de domínio: Notion X; design: Figma Y"

Diferença em relação ao README.md: README é para humanos descobrirem o projeto. AGENTS.md é para o agente operar no projeto. Podem se sobrepor em parte, mas AGENTS.md é *mais preciso e mais machine-friendly* (listas estruturadas, comandos literais, sem prosa decorativa).

## 9. Contratos explícitos

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

## 10. Orçamento de contexto

Heurística: tarefa típica num módulo deve caber em ~5k tokens de código de contexto (≈ 400 linhas efetivas). Se seu módulo tem mais que isso, ou:

- o módulo está fazendo 2+ coisas e deveria ser partido, ou
- o código tem gordura e pede refactor interno (não necessariamente estrutural).

**Como medir:** `wc -l modules/<x>/*.{py,ts,go}` ou, mais fiel, tokens reais. Manter esse número baixo é uma prática saudável que reflete diretamente em custo e acurácia de IA — e em humanos também.

## 11. Scaffold como script

**Por quê:** agente (e humano) deixado criar o esqueleto "à mão" vai variar sutilmente — falta um `tests/`, outro usa `test/`, outro esquece o `MODULE.md`. A variação erode o padrão.

**Script:** copia template, substitui placeholders (`__MODULE_NAME__`, `__YEAR__`), cria estrutura. Em [../scripts/scaffold_module.sh](../scripts/scaffold_module.sh).

## 12. Nomes que falam

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
