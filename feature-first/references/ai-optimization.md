# AI Optimization — por que essa arquitetura reduz custo e erro de IA

Agentes de código operam em ciclos de:
1. Ler contexto (custa tokens)
2. Decidir ação (pode errar)
3. Escrever código (pode quebrar algo em outro arquivo)
4. Validar (roda testes / lint)

Cada ciclo custa dinheiro real e cada leitura extra é oportunidade para erro. Feature-First reduz os 4 estágios. Este arquivo detalha *como* e *o que configurar* para amplificar o efeito.

## Mapa: problema → solução

| Problema do agente | Solução arquitetural |
|---|---|
| Lê arquivos demais tentando entender o sistema | AGENTS.md na raiz + MODULE.md por módulo |
| Salta entre controllers/services/repositories | Co-location — tudo numa pasta |
| Quebra coisa em módulo adjacente | Import cruzado banido no build |
| Abstrai cedo demais "pra reusar" | Regra do 3 + duplicação permitida |
| Inventa novo nome a cada ocorrência | Scaffold por script |
| Reexplora a cada tarefa nova | Nomes que falam + manifest por módulo |
| Se perde em indireção (port/adapter) | Código linear dentro do módulo |

## AGENTS.md — o arquivo mais importante

Template em [../assets/AGENTS.md.template](../assets/AGENTS.md.template). Este é o arquivo que o agente lê **antes de qualquer outro**.

### Princípios de escrita

- **Machine-readable**: listas, tabelas, comandos literais em bloco de código. Prosa só quando indispensável.
- **Comandos copy-paste**: `make test`, `npm run lint:arch`, `./scripts/scaffold_module.sh <nome>`.
- **Caminhos absolutos ou relativos à raiz**: nunca "o arquivo lá do outro lado".
- **Sem gordura de marketing**: projeto grita o que faz em 1 parágrafo, depois desce para layout.

### Seções essenciais

1. **Propósito do projeto** (2-4 linhas)
2. **Stack** (linguagens, frameworks, dependências críticas)
3. **Layout** (árvore comentada com ponteiros — "regra de negócio em `modules/`, infra em `shared/`")
4. **Convenções** (idioma do código, estilo, TDD, commits convencionais)
5. **Comandos** (setup, test, lint, dev, build)
6. **Regras de fronteira** (módulo não importa módulo, regra do 3, etc. — 5-8 linhas)
7. **Onde achar o quê** (tickets, docs externas, design, dashboards)
8. **Links para docs de aprofundamento** (CLAUDE.md, ADRs, `.claude/docs/`)

### O que **não** colocar em AGENTS.md

- Decisões de design detalhadas → ADRs separados
- Tutoriais de "como instalar X" → README.md (para humanos)
- Conteúdo que muda toda semana → vira stale; deixar em fontes canônicas e linkar

## MODULE.md — o entry point cognitivo do módulo

Template em [../assets/module-template/MODULE.md](../assets/module-template/MODULE.md).

### Por que funciona

Sem `MODULE.md`, agente abrindo um módulo desconhecido faz ~5-10 leituras de arquivos para montar um modelo mental. Cada leitura custa ~1-3k tokens. Com `MODULE.md`, 1 leitura de ~500 tokens entrega o modelo.

### O que precisa ter

- **Propósito** (1-2 linhas) — o que este módulo faz
- **Entry points** — endpoints, funções públicas, rotas de UI
- **Dependências de `shared/`** — quais subpastas, pra quê
- **Tabelas/coleções próprias** — o módulo é "dono" do quê no banco
- **Contratos publicados/consumidos** — eventos em `shared/contracts/`
- **Não-objetivos** — o que parece função desse módulo mas é de outro

### Mantê-lo vivo

- Sincronizar com o código em PRs que alteram fronteira. Pode ser parte do PR template.
- Revisar trimestralmente (ou em cada refactor grande) — desatualizado engana pior que ausente.

## Co-location — por que 1 pasta > 8 pastas

**Caso prático:** task "adicionar campo `discount_code` ao checkout".

| Arquitetura | Arquivos tocados | Tokens de contexto |
|---|---|---|
| Layered clássica | `controllers/checkout.py`, `services/checkout_service.py`, `dto/checkout_dto.py`, `repositories/order_repository.py`, `domain/order.py`, `migrations/xxx_add_discount.sql`, `tests/controllers/...`, `tests/services/...` (8 arquivos em 6 pastas) | ~8-12k |
| Feature-first | `modules/checkout/domain.py`, `handlers.py`, `migrations/00x_discount.sql`, `tests/test_checkout.py` (4 arquivos em 1 pasta) | ~3-5k |

**E a chance de esquecer algo?** Na layered, agente facilmente esquece do DTO ou do repo. Na feature-first, `ls modules/checkout/` mostra tudo.

## Orçamento de contexto — dois níveis

Aplicar **ambos**. Um módulo pequeno com um arquivo de 900 linhas é ruim. Um módulo de 800 linhas em 10 arquivos de 80 também é ruim. Os limites atacam problemas diferentes.

### Por módulo (grosso)

**Heurística:** tarefa típica "mudar algo aqui" deve caber em ~5k tokens de código. Se passa disso, é sinal de:
- módulo fazendo 2+ coisas (dividir em módulos)
- código inchado internamente (refatorar sem mexer em estrutura)

Faixas:
| Linhas do módulo | Status |
|---|---|
| < 300 | saudável |
| 300-500 | OK, monitorar |
| 500-600 | warning — justificar no `MODULE.md` ou planejar split |
| > 600 | hard limit — avaliar se são 2+ módulos e partir |

### Por arquivo (fino)

**Limites:**
| Linhas por arquivo | Status |
|---|---|
| < 150 | ótimo |
| 150-200 | saudável |
| 200-300 | warning — é 1 responsabilidade mesmo? |
| > 300 | hard limit — partir por conceito |

**Por que o limite de arquivo importa independente do módulo:**

1. **Contexto carregado no agente.** Quando a IA abre um arquivo para editar, ela carrega o arquivo **inteiro**. Mudar 5 linhas num arquivo de 800 custa 800 linhas de tokens. Em 3 arquivos de ~250, custa ~250 (o agente abre só o relevante).

2. **Diff ilegível.** PR alterando 40 linhas num arquivo de 1000 pede scrolling infinito. Em 3 arquivos de ~300, cada PR toca 1-2 arquivos e o diff é óbvio.

3. **Cache invalidation.** Sistemas de prompt-cache invalidam pelo hash do arquivo. Arquivo grande que muda por 10 razões diferentes invalida cache o tempo todo. Arquivos pequenos mudam por 1-2 razões — cache aquece.

4. **Cognitive load humano.** Regra prática: se você precisa do índice do IDE / minimap para navegar o arquivo, é grande demais.

### Exceções legítimas

Arquivos que podem ultrapassar o limite sem virar anti-pattern:

- **Migrations SQL** — têm o tamanho que precisam; são append-only e pouco editados.
- **Fixtures / seeds de dados** — dados, não lógica.
- **Código gerado** — proto, OpenAPI, tRPC router, schema migrators.
- **Configs agregadas** — ex: tabela de roteamento central de 400 linhas é melhor que 40 arquivos de 10 linhas.

Regra: se o arquivo **tem lógica que alguém escreve e edita**, o limite se aplica. Se é dado/gerado/append-only, não.

### Como medir

```bash
# arquivos ativos acima de 300 linhas (fora de migrations, fixtures, gerados)
find modules/ shared/ \
    -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.go" \) \
    -not -path "*/migrations/*" \
    -not -path "*/fixtures/*" \
    -not -path "*/generated/*" \
    -exec wc -l {} \; | awk '$1 > 300'
```

Rodar como parte do `check` do projeto. Ultrapassar o limite não precisa ser build-breaking (muitas exceções legítimas), mas deve gerar warning ruidoso.

### Como partir sem ficar pior

Dividir por **responsabilidade**, não por tamanho:

**Bom:**
- `domain.py` (800 linhas) → `domain_order.py` + `domain_payment.py` + `domain_refund.py` (cada um ~250)

**Ruim:**
- `domain.py` (800 linhas) → `domain_part1.py` + `domain_part2.py` (arbitrário, mesma classe partida ao meio)

Se a divisão não cai naturalmente em conceitos, o problema é mais profundo — provavelmente são módulos diferentes.

## Scripts de scaffold — evitar o "quase igual"

**Problema:** agente criando módulos "à mão" vai variar — um usa `tests/`, outro `test/`, um esquece `MODULE.md`, outro inverte ordem de imports. Após 10 features, o padrão está erodido.

**Solução:** `./scripts/scaffold_module.sh <nome>` copia o template e substitui placeholders. Uma fonte de verdade.

Script exemplo em [../scripts/scaffold_module.sh](../scripts/scaffold_module.sh).

## Nomes que falam

Agente procurando "onde publico pro Meta?" com nomes ruins faz grep por "meta", "facebook", "ads" em todo lugar. Com nome bom (`modules/publish_meta_ads/`), navega direto.

**Regra prática:** leia o output de `ls modules/` de cima para baixo. Se alguém sem contexto do produto consegue adivinhar o que o app faz, nomes estão bons.

## Anti-indireção

Dentro do módulo, prefira chamada direta a port/adapter. Exemplo em Python:

**Ruim (port/adapter dentro do módulo):**
```python
# modules/checkout/domain/order_repository.py (interface)
class OrderRepository(Protocol):
    def save(self, order: Order) -> None: ...

# modules/checkout/infrastructure/sql_order_repository.py
class SqlOrderRepository:
    def save(self, order: Order) -> None:
        db.execute(...)

# modules/checkout/application/create_order.py
class CreateOrderUseCase:
    def __init__(self, repo: OrderRepository): ...
```

3 arquivos, 3 camadas, 1 injeção — para salvar um pedido.

**Bom (direto):**
```python
# modules/checkout/domain.py
def create_order(user_id, items) -> Order:
    order = Order(...)
    db.save(order)  # shared/db
    return order
```

Trocar DB é um refactor real, raro, e fácil num codebase bem-organizado. Abstrair antecipadamente é ritual.

**Quando camadas voltam a fazer sentido:** quando o módulo é genuinamente complexo (ex: motor de billing, engine de regras fiscais). Aí o custo das camadas paga o benefício. Ainda assim, as camadas ficam **dentro** do módulo, não espalhadas no projeto.

## Checklist de otimização para IA

- [ ] `AGENTS.md` na raiz, preenchido
- [ ] `MODULE.md` em cada módulo, atualizado
- [ ] Nomes de módulos são verbos/substantivos concretos
- [ ] `ls modules/` dá ideia clara do que o produto faz
- [ ] Scaffold é script, não memória
- [ ] Cada módulo cabe em ~5k tokens de contexto
- [ ] Regra de fronteira verificada no CI, não só no review
