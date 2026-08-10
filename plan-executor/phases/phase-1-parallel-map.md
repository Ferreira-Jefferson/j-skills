# FASE 1 — Tiers & Mapa de Paralelismo (`EXEC-MAP.md`)

**Objetivo:** transformar o inventário da FASE 0 em waves de execução com custo de processo calibrado, provando que o que roda junto não colide.

**Quem executa:** o orquestrador.

**Saída:** `[run-dir]EXEC-MAP.md` (template: `@.claude/skills/plan-executor/templates/exec-map.template.md`).

## Passos

### 1. Fechar o tier de cada feature (regra 5)

| Tier | Critério (todos os itens) |
|------|---------------------------|
| **T1** | ≤2 arquivos escritos; sem lógica de negócio nova; sem contrato/schema/dependência nova; prova já existe no projeto |
| **T3** | toca contrato público, schema/migration, auth/permissão, dado de usuário, dinheiro/crédito, ou remove comportamento existente |
| **T2** | todo o resto (default quando não há justificativa escrita) |

Escreva no `EXEC-MAP.md` o tier **e a frase que o justifica**. Tier não justificado = T2.

### 2. Decidir o modo da run

- **`MODO: ENXUTO`** — ≤4 features, todas T1: sem waves, sem worktree, execução sequencial na `[target-branch]` com 1 feature-agent, 1 revisão de planos em lote e 1 code review final. Justificar no `EXEC-MAP.md` e pular os passos 3–6 desta fase (não há paralelismo a mapear); manter os passos 7 e 8.
- **`MODO: NORMAL`** — todo o resto. Segue abaixo.

### 3. Grafo de dependências

Ligar `Consome` → `Produz` do inventário. Cada aresta é uma dependência real (`FEAT-003` depende de `FEAT-001`).

Ciclo detectado (A depende de B que depende de A) → **as duas features estão mal cortadas**: fundir em uma só, ou extrair o artefato compartilhado para a WAVE 0.

### 4. Teste de disjunção (por par de features candidatas à mesma wave)

| Checagem | Falhou? |
|----------|---------|
| `Escreve(A) ∩ Escreve(B) = ∅` | serializar ou extrair o arquivo para WAVE 0 |
| Nenhuma consome artefato da outra | serializar (a consumidora vai depois) |
| Sem teste/fixture/snapshot/seed em comum | serializar ou dividir o arquivo de teste |
| Sem agregador em comum (`index.*`, rotas, i18n, lockfile, config) | extrair para WAVE 0 |
| **Não mexem no mesmo comportamento observável** (rota, fluxo, query, regra de negócio) nem fazem o **mesmo teste existente mudar de resultado** | serializar — colisão semântica não aparece no merge, aparece na prova |

Qualquer dúvida → serializar. Silêncio do plano não é permissão.

### 4b. Classificar estabilidade: planejar agora ou adiar (regra 17)

Disjunção resolve *quem roda junto*. Estabilidade resolve *quando dá para planejar*. Para cada feature:

| Classificação | Critério | Consequência |
|---------------|----------|--------------|
| **ESTÁVEL** | o código, os contratos e o comportamento que ela toca **não** serão alterados por nenhuma feature que roda antes | planejável já na abertura da run |
| **ADIADA** | consome artefato cuja forma ainda pode mudar · depende de decisão que uma feature a montante vai tomar · o alvo é código que a wave anterior vai reescrever · a prova depende de comportamento que a montante altera | **nenhum agente é spawnado para ela** antes da wave dela abrir |

Registre a classificação e o **motivo** no `EXEC-MAP.md`, na coluna `Planejamento` (`imediato` / `adiado — abre na wave N: <motivo>`).

Na dúvida → **ADIADA**. E note a assimetria: uma feature pode estar sozinha na sua wave (sem colisão nenhuma) e ainda assim ser ADIADA, porque o problema não é conflito de arquivo — é premissa que ainda vai mudar.

### 5. Montar a WAVE 0 (fundação)

Executada pelo **próprio orquestrador**, antes de spawnar qualquer agente. Entram nela:
- Boilerplate/pastas/arquivos vazios que várias features precisam
- Contratos, tipos e interfaces compartilhados
- Migrations (sempre serializadas, nunca em agente paralelo)
- Registros agregadores (rotas, exports, i18n) já com as entradas de todas as features
- Instalação de dependências novas e env vars declaradas no plano

Se a WAVE 0 ficar grande (>10 arquivos ou lógica de negócio dentro), ela deixou de ser fundação: promova a parte com lógica a uma feature normal na WAVE 1.

### 6. Alocar features em waves e definir isolamento

```
WAVE 0 [orquestrador]  fundação compartilhada
WAVE 1 [paralelo]      features sem dependências
WAVE 2 [aguarda W1]    features que consomem artefatos da WAVE 1
WAVE N ...
```

- Máximo `[max-parallel]` features por wave (default 4). Excedente vai para a wave seguinte, respeitando dependências.
- Uma wave só termina quando **100%** das features dela estão CONCLUÍDAS (commit feito, review aprovado, worktree limpo).
- Feature sem dependência que ficou de fora por limite de paralelismo é sinalizada como "por capacidade", não como dependente.

Isolamento (regra 9):
- Wave com ≥2 features que escrevem → worktree por feature: `../[repo]-[FEAT-ID]`, branch `feat/[plan-slug]-[FEAT-ID]`
- Wave com 1 feature → inline em `[target-branch]`
- **Exceção declarada:** custo de worktree alto (FASE 0) + wave de ≤2 features T1 → serializar inline, registrando o motivo
- Registrar no `EXEC-MAP.md` qual modo cada feature usa (o feature-agent lê de lá)

### 7. Fechar as provas de conclusão

Promover cada "prova candidata" a prova formal:
- **uma** prova por feature, na ordem de preferência da regra 7 (comando/teste existente → asserção em teste existente → teste novo → estado observável);
- escrever, em uma linha, o **cenário quebrado que a prova pega** (regra 8). Sem esse cenário, a prova é reescrita agora — não na execução;
- marcar RED obrigatório apenas nas features T3.

Se a prova exigir criar infra de teste nova para uma feature T1, ou o tier está errado (sobe para T2), ou a prova está errada (use um comando existente).

### 8. Escrever e exibir o `EXEC-MAP.md`

Escrever o arquivo e **mostrar ao usuário** antes de iniciar a FASE 2:
- Modo da run (NORMAL/ENXUTO) e por quê
- Quantidade de features por tier, de waves e de agentes previstos
- Features **ADIADAS** e o motivo (o que precisa acontecer antes de elas poderem ser planejadas)
- NO-OPs (itens do plano já implementados) com evidência
- O que a WAVE 0 vai fazer
- Features serializadas e o **motivo** (dependência × colisão de arquivo × capacidade)

Não pedir aprovação — é informação. Mas se o mapa expôs uma lacuna de decisão, aí sim escalar.

## Critério de saída

- [ ] Tier atribuído e justificado por feature
- [ ] Modo da run decidido e registrado
- [ ] Grafo de dependências sem ciclos
- [ ] Teste de disjunção (físico **e** semântico) aplicado a todos os pares de cada wave
- [ ] Estabilidade classificada por feature (ESTÁVEL / ADIADA + motivo)
- [ ] Todo ponto de colisão resolvido (WAVE 0 ou serialização)
- [ ] Migrations serializadas
- [ ] Toda feature com prova única, válida e com cenário de falha escrito
- [ ] Modo de isolamento e branch definidos por feature
- [ ] `EXEC-MAP.md` escrito e exibido ao usuário

Só então: FASE 2.
