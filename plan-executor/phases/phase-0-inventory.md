# FASE 0 — Leitura, Estado Atual & Inventário

**Objetivo:** entender o plano por completo, descartar o que já está feito, e transformar o resto em unidades de trabalho com arquivos e dependências explícitos.

**Quem executa:** o orquestrador (sessão principal). Única fase em que ele lê o plano inteiro.

## Passos

### 1. Ler o plano na íntegra

Ler `[plan-file]` do começo ao fim, sem pular seções. Se o plano referenciar outros arquivos (`contracts.md`, `DESIGN.md`, ADRs, sub-features), ler também — só os referenciados.

### 2. Extrair o objetivo global

Uma frase: *o que o projeto passa a fazer/ser depois deste plano que não fazia antes.* Se o plano não permite escrever essa frase, ele é vago demais → escalar ao usuário antes de executar nada.

### 3. Reconhecer o terreno

- Stack e gerenciador de pacotes (ler manifest: `package.json`, `pyproject.toml`, `go.mod`, …)
- Comando de teste, lint, build e typecheck reais do projeto — **descobrir, não assumir**
- Convenção de commit em uso (`git log --oneline -20`)
- Hooks ativos (`.husky/`, `pre-commit`, `lefthook.yml`) — impactam o commit da feature
- Custo de criar worktree neste projeto (precisa reinstalar deps? build cache pesado?) — alimenta a regra 9
- Existência de skills locais relevantes (`error-memory`, `feature-first`, etc.)

### 4. Checagem de estado atual (regra 6) — **antes** de fatiar

Para cada item do plano, confirmar no código se ele já está atendido. Uma varredura barata (grep/glob por símbolo, arquivo ou rota citados no plano) evita features inteiras desnecessárias.

Classificar cada item:

| Situação | Destino |
|----------|---------|
| Já implementado **e** verificável | `NO-OP` — registrar item + evidência (`arquivo:linha` ou comando). Não vira feature. |
| Parcialmente implementado | vira feature, mas o escopo é **só o delta** — anotar o que já existe |
| Não implementado | vira feature normal |
| Conflita com o código atual (plano assume algo que mudou) | **escalar** antes da FASE 1 |

Não gastar mais que uma passada de busca por item. Dúvida entre "já existe" e "existe parecido" → tratar como não implementado e deixar o feature-agent decidir na etapa de plano.

### 5. Fatiar o plano em unidades de trabalho (features)

Uma **feature** = a menor entrega coesa com prova de conclusão própria. Cada uma recebe `[FEAT-ID]` (`FEAT-001`, `FEAT-002`, …) e um slug verbo+substantivo (`add-auth-guard`, não `auth`).

Limites estruturais:
- Feature grande demais para 1 agente (toca >8 arquivos ou exigiria >1 prova de conclusão distinta) → dividir.
- Feature que só existe para "preparar terreno" de outras (boilerplate, agregador, contrato) → **não é feature**: vira item de WAVE 0 do orquestrador (regra 4).
- Se o plano já vem fatiado (tasks/sub-features numeradas), respeite o fatiamento dele; só reagrupe quando duas tasks compartilham arquivos escritos.
- **Não crie feature de "verificação"/"validação" solta** — verificação é a prova de conclusão da feature que a produziu.

### 6. Preencher a matriz de arquivos

Para cada feature, listar explicitamente:

| Campo | Conteúdo |
|-------|----------|
| **Escreve** | arquivos criados/editados (caminho a caminho — sem `src/**`) |
| **Lê** | arquivos que precisa ler mas não altera |
| **Produz** | artefatos que outras features podem consumir (tipo, endpoint, tabela, componente, env var) |
| **Consome** | artefatos produzidos por outras features |
| **Prova candidata** | como se provará que está pronta, já na ordem de preferência da regra 7 (reusar antes de criar) |
| **Tier candidato** | T1 / T2 / T3 conforme regra 5 (confirmado na FASE 1) |

Arquivos que aparecem em **Escreve** de duas features são o insumo central da FASE 1 — anote-os separadamente como *pontos de colisão*.

### 7. Registrar lacunas

Listar tudo que o plano não responde e que a execução vai precisar: arquivo inexistente, comando de teste ausente, decisão em aberto, dependência não declarada, env var nova.

- Lacuna **trivial** (descobrível lendo o código) → resolver agora, registrar a resposta.
- Lacuna **de decisão** → escalar ao usuário **antes** da FASE 1.

## Output da fase

Um bloco em memória (não vira arquivo — a FASE 1 o consome direto):

```
INVENTÁRIO — [plan-slug]
Objetivo global: <1 frase>
Stack: <linguagem/framework> | Teste: <comando> | Lint: <comando> | Build: <comando>
Convenção de commit: <formato>
Custo de worktree: <baixo (nada a instalar) | alto (deps por worktree)>
NO-OPs (já implementados): <item → evidência> | ou "nenhum"
Features: N
  FEAT-001 <slug> [T?] — escreve: [a, b] | consome: — | prova: <candidata>
  FEAT-002 <slug> [T?] — escreve: [c]    | consome: FEAT-001:<artefato> | prova: <candidata>
  ...
Pontos de colisão: <arquivos em 2+ features, ou "nenhum">
Lacunas resolvidas: <lista>
Lacunas escaladas: <lista, ou "nenhuma">
```

## Critério de saída

- [ ] Plano lido integralmente (+ referenciados)
- [ ] Objetivo global em 1 frase
- [ ] Comandos reais de teste/lint/build descobertos no projeto
- [ ] Estado atual checado item a item; NO-OPs registrados com evidência
- [ ] Toda feature tem **Escreve** enumerado arquivo a arquivo
- [ ] Toda feature tem prova candidata em formato válido e tier candidato
- [ ] Nenhuma lacuna de decisão aberta

Só então: FASE 1.
