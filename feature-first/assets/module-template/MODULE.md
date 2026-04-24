# __MODULE_NAME__

## Propósito
<!--
1-2 linhas. Qual é a responsabilidade deste módulo?
Exemplo: "Processa carrinho → pedido → pagamento para usuários finais."
-->
__ONE_OR_TWO_SENTENCE_PURPOSE__

## Entry points
<!--
Liste os pontos por onde o mundo exterior entra neste módulo:
- Endpoints HTTP
- Handlers de fila / job schedulers
- Rotas de UI
- Funções públicas chamadas por main.py / registry
-->
- `handlers.py::__FN_NAME__` — __BRIEF_DESCRIPTION__

## Dependências de `shared/`
<!--
Liste o que este módulo importa de shared/. Isso ajuda a entender a "superfície técnica" do módulo.
Exemplo:
- shared/db — tabelas orders, payments
- shared/queue — publica order.placed
- shared/http_client — chamada à Stripe
-->
- `shared/__SUBPACKAGE__` — __PURPOSE__

## Tabelas / coleções próprias
<!--
Este módulo é dono de quais tabelas? Migrations dessas tabelas vivem em migrations/ abaixo.
-->
- `__TABLE_NAME__` — __DESCRIPTION__

## Contratos publicados
<!--
Eventos/mensagens que este módulo publica em shared/contracts/. Outros módulos podem consumir.
-->
- `__EventName__` (em `shared/contracts/__file__.py`) — disparado quando __TRIGGER__

## Contratos consumidos
<!--
Eventos que este módulo observa. Se nenhum, escrever "(nenhum)".
-->
- `__EventName__` — reage para __ACTION__

## Não-objetivos
<!--
O que parece responsabilidade deste módulo mas NÃO é. Previne crescimento indevido.
Exemplo:
- Não envia emails — notifications reage a order.placed
- Não calcula frete — shipping_calc expõe contrato ShippingQuote
-->
- __NON_GOAL__

## Notas de implementação
<!--
Opcional. Decisões não óbvias, constraints, workarounds conhecidos. Curtas.
-->

## Tamanho
<!--
Orçamento-alvo: < ~5k tokens / ~600 linhas de código ativo. Se exceder, avaliar split.
Atualizar periodicamente ou em refatorações grandes.
-->
Linhas de código (aprox): __N__
