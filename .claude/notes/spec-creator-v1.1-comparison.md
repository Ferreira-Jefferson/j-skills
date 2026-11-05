# spec-creator — Baseline (v1.0.1) vs New (v1.1) — Relatório de Comparação

**Data:** 2026-05-05
**Caso de teste:** Calculadora CLI Python com 2 modos (Basic + Scientific)
**Pasta de teste:** `c:/tmp/spec-test/`

---

## 1. Resultado executivo (TL;DR)

| Eixo | Baseline (v1.0.1) | Novo (v1.1) | Veredito |
|------|--------------------|--------------|----------|
| **Spec — total de arquivos** | 6 | 4 | ✅ −33% |
| **Spec — linhas totais** | 523 | 468 | ✅ −10.5% |
| **Spec — contexto que o agente impl carrega** | 523 linhas (lê tudo) | ~199 linhas (OVERVIEW + 1 sub-feature) | ✅ **−62%** |
| **Implementação — arquitetura** | Monolito `calculator.py` 165 linhas | Modular: 1 entry + 2 modes/* + tests separados | ✅ Melhor decomposição |
| **Implementação — testes** | 31 | 36 | ✅ +5 testes |
| **Implementação — cobertura** | 97% | 98% (e 100% nos modos) | ✅ Marginal |
| **Implementação — tokens (sub-agentes)** | 37,214 | 88,258 (3 agentes) | ❌ **+137%** |
| **Implementação — wall time** | 131s | 306s (SF-001 → SF-002+SF-003 paralelo) | ❌ +134% |
| **Implementação — qualidade integrada** | 31/31 ✅ | 36/36 ✅ | Empate em verde |

**Conclusão honesta:** para uma feature pequena (3 sub-features triviais), o novo modelo gasta ~2.4× mais tokens e ~2.3× mais wall time. Os ganhos de qualidade são marginais (+5 testes, +1pp cobertura, arquitetura modular). **A v1.1 só compensa em features grandes** onde o agente monolítico explodiria em tokens carregando contexto irrelevante, e onde sub-features paralelas reduzem wall time real.

---

## 2. Métricas de spec

### 2.1 Tamanho dos artefatos da spec

| Arquivo | Baseline | Novo |
|---------|---------:|-----:|
| SPEC.md | 61 / 424 | (deletado) |
| REQUIREMENTS.md | 48 / 311 | (deletado) |
| DESIGN.md | 85 / 492 | (deletado) |
| TEST-PLAN.md | 82 / 417 | (deletado) |
| TASKS.md | 159 / 635 | (deletado) |
| START.md / OVERVIEW.md | 88 / 395 | 64 / 408 |
| navigation.md | — | 134 / 785 |
| basic-mode.md | — | 129 / 720 |
| scientific-mode.md | — | 141 / 783 |
| **Total** | **523 / 2,674** | **468 / 2,696** |
| **Arquivos** | **6** | **4** |

> Linhas totais cresceram só 1% em palavras mesmo com a redução de 33% em arquivos — a duplicação de contexto-base entre sub-features é compensada pela ausência de referências cruzadas e seções vazias dos templates.

### 2.2 Contexto carregado pelo agente de implementação

Este é o **número que importa** — quanto a IA precisa carregar para começar a trabalhar.

| Modelo | Por agente | Total acumulado |
|--------|-----------:|----------------:|
| Baseline (1 agente) | 523 linhas (todos os 6 docs) | 523 |
| Novo (1 sub-agente) | OVERVIEW (64) + 1 sub-feature (~135) = **~199 linhas** | — |
| Novo (3 sub-agentes somados) | — | 597 (= 64×3 + 135×3) |

**Por agente:** redução de **62%** (523 → 199 linhas).
**Acumulado:** novo modelo lê 14% MAIS no agregado, porque OVERVIEW é re-lido por cada sub-agente. Esse "custo" é compensado pelo contexto limpo de cada um.

---

## 3. Métricas de implementação

### 3.1 Arquivos produzidos

**Baseline:**
```
calculator.py             165 linhas / 418 palavras
tests/test_calculator.py  240 linhas / 567 palavras
tests/__init__.py           0
requirements-dev.txt        2
─────────────────────────────────────────
TOTAL                     407 linhas
```

**Novo:**
```
calculator.py              55 linhas / 158 palavras (SF-001)
modes/__init__.py           0
modes/basic.py             60 linhas / 176 palavras (SF-002)
modes/scientific.py        71 linhas / 227 palavras (SF-003)
tests/__init__.py           0
tests/test_navigation.py  112 linhas / 285 palavras (SF-001)
tests/test_basic.py       142 linhas / 405 palavras (SF-002)
tests/test_scientific.py  138 linhas / 445 palavras (SF-003)
requirements-dev.txt        2
─────────────────────────────────────────
TOTAL                     580 linhas
```

A v1.1 produz mais linhas no agregado (407 → 580, +43%) porque os testes ficam mais granulares (3 arquivos em vez de 1) e a separação modular adiciona alguma boilerplate (imports, headers). O código fonte em si só cresceu 13% (165 → 186 linhas).

### 3.2 Qualidade

| | Baseline | Novo |
|--|---------:|-----:|
| Tests | 31 | 36 |
| Pass | 31/31 | 36/36 |
| Coverage global | 97% | 98% |
| Coverage por módulo | calculator.py: 97% | calculator.py: 90% / basic: 100% / scientific: 100% |
| TDD discipline | Implícita | Explícita (RED→GREEN documentado pelos sub-agentes) |
| Decomposição | Single file | Modular (1 entry + 2 modes/) |

> Curiosamente, `calculator.py` da v1.1 tem cobertura **menor** (90% vs 97%) porque é fino (55 linhas) e tem branches `if __name__ == "__main__"` e `KeyboardInterrupt` difíceis de testar via pytest. Os módulos `basic.py` e `scientific.py` compensam com 100% cada.

---

## 4. Custo de tokens

### 4.1 Tokens medidos (apenas sub-agentes, sem o orquestrador)

| Agente | Tokens | Tool uses | Duration |
|--------|-------:|----------:|---------:|
| **Baseline (1 agente)** | **37,214** | 14 | 131s |
| Novo SF-001 (navigation) | 30,111 | 13 | 138s |
| Novo SF-002 (basic-mode) | 29,455 | 13 | 168s |
| Novo SF-003 (scientific-mode) | 28,692 | 11 | 161s |
| **Novo (3 sub-agentes somados)** | **88,258** | 37 | 467s seq / 306s real (paralelo) |

### 4.2 Decomposição estimada input/output (~70/30 típico para coding agents)

| | Input (~70%) | Output (~30%) |
|--|------------:|--------------:|
| Baseline | 26,050 | 11,164 |
| Novo (sum) | 61,781 | 26,477 |

### 4.3 Custo estimado com pricing 2026 (para os sub-agentes implementadores)

**Pricing referência (USD por milhão de tokens):**
- Claude Opus 4.7: $15/M input, $75/M output
- Claude Sonnet 4.6: $3/M input, $15/M output

| | Tokens (in/out) | Opus 4.7 | Sonnet 4.6 |
|--|----------------:|---------:|-----------:|
| **Baseline (1 agente)** | 26.0K / 11.2K | **$1.227** | **$0.246** |
| **Novo (3 sub-agentes)** | 61.8K / 26.5K | **$2.912** | **$0.582** |
| Diferença absoluta | +35.8K / +15.3K | +$1.685 | +$0.336 |
| Diferença relativa | — | **+137%** | **+137%** |

> Custo aqui exclui o trabalho do orquestrador principal (você/eu lendo specs, despachando agentes). Esse trabalho existe em ambos os modelos, mas no v1.1 é levemente menor porque o orquestrador lê apenas OVERVIEW.md (64 linhas) em vez de START.md (88 linhas).

### 4.4 Wall time

| | Wall time real |
|--|---------------:|
| Baseline | 131s (1 agente sequencial) |
| Novo | 306s (SF-001: 138s + max(SF-002:168s, SF-003:161s) paralelo) |

A v1.1 demora 2.3× mais em wall time **mesmo com paralelismo**, porque WAVE 1 (SF-001) precisa terminar antes da WAVE 2 (SF-002+SF-003). Em features maiores com waves mais largas, o paralelismo amortiza melhor.

---

## 5. Por que o novo modelo gastou mais para uma feature pequena?

1. **Custo fixo de leitura por sub-agente:** cada um dos 3 sub-agentes precisou ler `OVERVIEW.md` + sua sub-feature. OVERVIEW é re-lido 3 vezes (~64 linhas × 3 = 192 linhas redundantes).

2. **Cada sub-agente também lê o briefing extenso do orquestrador.** No baseline, 1 briefing; aqui, 3 briefings (~150 palavras cada).

3. **Cada sub-agente roda pytest e coleta saída** — operação que custa tokens em I/O. Multiplicado por 3.

4. **Calculadora é um exemplo trivial** onde o agente monolítico não sofre com poluição de contexto. Em features reais (10-20 sub-features, várias áreas de domínio), o agente monolítico embaralha contextos e degrada qualidade.

---

## 6. Onde o novo modelo se paga (projeção)

A v1.1 **provavelmente** se paga quando:

| Sinal | v1.0.1 começa a quebrar | v1.1 mantém qualidade |
|-------|--------------------------|------------------------|
| Spec total > 1500 linhas | Agente único carrega tudo, qualidade cai | Sub-agente lê só sua fatia (~300 linhas) |
| Feature toca > 5 áreas (auth, billing, UI, jobs, etc.) | Contextos misturam, decisões inconsistentes | Cada sub-feature é seu próprio domínio limpo |
| ≥ 4 sub-features sem dependência cruzada | Sequenciamento desnecessário | Paralelismo real reduz wall time |
| Tasks > 15 | Agente perde foco entre tasks distantes | Dentro de uma sub-feature, tasks ainda compartilham contexto |

**Heurística:** se a feature consumiria > 100k tokens em um único agente monolítico (porque precisa carregar muito contexto cross-domain), a v1.1 ganha. Abaixo disso, a v1.0.1 é mais barata para casos triviais.

---

## 7. O que aprendi com o teste (próximas melhorias para v1.1)

### 7.1 Críticas observadas

1. **Duplicação de OVERVIEW** — três sub-agentes leem OVERVIEW.md inteiro. Idealmente o orquestrador passaria um briefing ainda mais enxuto, e o sub-agente carregaria OVERVIEW só sob demanda (lazy).

2. **Sub-agentes precisam saber do contrato compartilhado.** Funcionou aqui porque OVERVIEW documenta o contrato `OperationModule`, mas se houver dezenas de contratos, OVERVIEW vira monolito de novo. Próxima iteração: extrair `contracts.md` separado, lido sob demanda.

3. **`__init__.py` racing.** SF-002 e SF-003 ambos podem criar `modes/__init__.py`. Em worktrees reais isso é OK (cada um tem seu git), mas o orquestrador precisa decidir merge ordem clara para arquivos compartilhados de boilerplate.

4. **Sub-feature monolítica é tentadora.** Ao escrever `navigation.md`, dei muita info junta (helpers + main_menu + entry). Um agente menos disciplinado poderia ter feito 1 task gigante. A v1.1 deveria ter um teste explícito de "tasks atômicas" no spec-reviewer.

### 7.2 Pontos fortes confirmados

1. **TDD funcionou de verdade.** Os 3 sub-agentes seguiram RED→GREEN explicitamente porque a sub-feature traz os testes como fonte de verdade. SF-002 inclusive **adicionou um teste extra** durante o refactor para cobrir um branch faltando — comportamento de senior dev real.

2. **Isolação de contexto pagou em qualidade.** SF-002 e SF-003 escreveram código consistente (mesmas mensagens de erro, mesma estrutura) sem combinarem. Isso saiu do contrato + OVERVIEW comuns.

3. **Cada sub-agente acabou em < 30k tokens.** O baseline gastou 37k em UM contexto; cada sub-agente novo cabe em ~30k. Quando a feature for grande, o agente monolítico passa de 100k facilmente.

4. **Detecção de "ownership conflicts".** Os briefings explícitos ("you may NOT touch X, Y, Z") preveniram colisões reais — nenhum dos 3 sub-agentes invadiu áreas alheias.

---

## 8. Recomendações

### 8.1 Quando usar v1.1
- Features com ≥ 3 sub-features genuinamente disjuntas
- Spec total estimada > 1000 linhas
- Múltiplas áreas de domínio (frontend + backend + jobs + infra)
- Equipe quer paralelizar implementação real (worktrees concorrentes)

### 8.2 Quando usar v1.0.1 ainda
- Micro-features (≤ 200 linhas de código previsto)
- 1-2 sub-features triviais
- Solo dev sem necessidade de paralelismo
- Prototipagem rápida

### 8.3 Próximos ajustes recomendados na skill
1. Adicionar regra na `rules.md`: "Para features com < 3 sub-features potenciais, gerar formato baseline (single START.md). Para ≥ 3, sintetizar em sub-features."
2. `OVERVIEW.md` deve ter limite mais agressivo (~80 linhas) para não inchar com cross-cutting context.
3. Extrair `contracts.md` separado quando há ≥ 2 contratos compartilhados entre sub-features.
4. `spec-reviewer` deve validar explicitamente que cada sub-feature passa o "teste de leitura isolada" (consegue implementar lendo APENAS aquele arquivo + OVERVIEW).

---

## 9. Apêndice — comandos para reproduzir

```bash
# Rodar suite do baseline
cd c:/tmp/spec-test/baseline/impl
python -m pytest --cov=calculator -v

# Rodar suite da v1.1
cd c:/tmp/spec-test/new/impl
python -m pytest --cov=. -v

# Smoke manual (digite 1, +, 2, 3, b, 0)
python c:/tmp/spec-test/new/impl/calculator.py
```

---

## 10. Resumo numérico final

```
                  BASELINE      NEW (v1.1)    Δ
─────────────────────────────────────────────────────
Spec files         6             4            -33%
Spec lines         523           468          -10.5%
Per-agent ctx      523 linhas    199 linhas   -62%   ✅
Impl files         4             9            +125%  ↑ (modular)
Impl lines         407           580          +43%
Tests              31            36           +16%   ✅
Coverage           97%           98%          +1pp   ✅
Tokens (impl)      37,214        88,258       +137%  ❌
Tool uses          14            37           +164%  ❌
Wall time          131s          306s         +134%  ❌
Cost Opus 4.7      $1.227        $2.912       +137%  ❌
Cost Sonnet 4.6    $0.246        $0.582       +137%  ❌
```

**Veredicto:** v1.1 é mais cara para features pequenas (~2.4× tokens), mas entrega arquitetura melhor e contexto isolado por agente. Use seletivamente — o ganho real está em features médias-grandes onde o agente monolítico v1.0.1 começa a se afogar em contexto cross-cutting.
