# [FEAT-ID] — <slug da feature>

> Plano de ação escrito pelo feature-agent, revisado (e corrigido quando necessário) pelo plan-reviewer.
> Status: `rascunho` → `em revisão` → `aprovado` → `executado` → `concluído`

**Status:** rascunho
**Run:** `[plan-slug]` | **Plano original:** `[plan-file]` (seções: <quais>)
**Tier:** T1 / T2 / T3 | **Wave:** N | **Isolamento:** worktree `../[repo]-[FEAT-ID]` / inline
**Branch:** `feat/[plan-slug]-[FEAT-ID]`

## 1. Problema / objetivo

<1-2 frases, com suas palavras: o que essa feature resolve e por quê. Não copie o plano original.>

**Estado atual (regra 6):** <o que já existe no código para este item — `arquivo:linha` — e qual é o **delta** que esta feature entrega. Se nada existe, escreva "nada implementado".>

## 2. Arquivos

**Escreve** (cria/edita):
- `caminho/arquivo-1.ext` — <o que muda nele>
- `caminho/arquivo-2.ext` — <o que muda nele>

**Só lê:**
- `caminho/arquivo-3.ext` — <por que precisa ler>

**Consome de outras features:** <artefato + FEAT-ID, ou "nada">
**Produz para outras features:** <artefato, ou "nada">

## 2b. Premissas a montante (regra 17)

> O que este plano assume sobre o que já rodou. Uma linha por premissa, verificável — é por elas que o
> checkpoint de wave decide se este plano ainda vale ou precisa ser descartado e refeito.

| # | Premissa | Como verificar | Origem |
|---|----------|----------------|--------|
| 1 | `<função/rota/coluna>` tem `<assinatura/shape>` | `<comando ou arquivo:linha>` | FEAT-00N / código existente |

## 3. Passos

| # | Ação | Arquivo(s) | Como sei que funcionou |
|---|------|-----------|------------------------|
| 1 | <ação concreta> | `<arquivo>` | <verificação do passo> |
| 2 | <ação concreta> | `<arquivo>` | <verificação do passo> |
| 3 | ... | | |

> Cada passo é uma ação com efeito verificável, não um tema. Ordem executável: passo N só depende de 1..N-1.

## 4. Prova de conclusão (uma só)

**Origem:** ⬜ comando/teste que já existe ⬜ asserção nova em teste existente ⬜ teste novo (justifique por que 1 e 2 não servem) ⬜ estado observável

```
<comando exato, nome do teste + arquivo, ou input→output esperado>
```

**O que essa prova garante:** <ligação explícita com o objetivo da seção 1>

**Teste de falsificação (obrigatório, 1 linha):** se <cenário de feature quebrada>, a prova falha porque <motivo>.

**RED antes de GREEN:** <obrigatório em T3; em T2 só se barato; em T1: "não se aplica">

## 5. Riscos e gatilhos de escalação

- <risco> → mitigação: <...>
- Escalarei se: <condição concreta>

## 6. Correções do plan-reviewer

> Preenchido pelo plan-reviewer. Vazio até a revisão.

| # | O que estava errado | Correção aplicada | Motivo |
|---|---------------------|-------------------|--------|
| | | | |

## 7. Registro de execução

> Preenchido pelo feature-agent após executar.

**Passos executados:** N/N
**Commits:**
- `<hash>` <título>

**Evidência da prova de conclusão:**
```
<saída literal do comando/teste>
```

**Desvios (triviais, com plano atualizado):**
- <passo N: o que mudou e por quê>

**Desvios relevantes para features seguintes:** <o que mudou de forma/nome/comportamento e pode quebrar premissa de quem vem depois — ou "nenhum". Alimenta o checkpoint de revalidação da wave.>

**Arquivos realmente tocados:** <lista — divergiu do item 2? justificar>

## 8. Definition of Done

- [ ] Todos os passos da seção 3 executados
- [ ] Prova de conclusão executada com evidência colada na seção 7
- [ ] Nenhum arquivo fora da seção 2 tocado (ou desvio justificado)
- [ ] Testes da feature verdes; nada skipado
- [ ] Sem `TODO`/código comentado/log de debug
- [ ] Commits atômicos na convenção do projeto
- [ ] `code-reviewer` aprovou
