---
name: error-memory
description: >-
  OBRIGATÓRIO invocar quando: (a) uma operação falhou 2 vezes seguidas, (b) você acabou de
  resolver um problema que exigiu 2+ tentativas, (c) está prestes a executar operação
  arriscada (deploy, migration, git push, instalação de pacote no Windows). Mantém base
  persistente por projeto em .claude/memory/errors/ com lookup por keywords. Args:
  "lookup <keywords>", "save <categoria> <descrição>", "fail <ERR-NNN> <motivo>", "check".
  Trigger words: "falhou de novo", "segunda tentativa", "não funciona", "retry", "já tentei",
  "error", "erro", "failed", "exception", "traceback", "401", "403", "500", "ENOENT",
  "EACCES", "consultar erros", "buscar solução", "erros conhecidos", "learned errors".
version: 2.0.0
user-invocable: true
---

# Error Memory — Aprendizado Persistente de Erros

Nunca repita o mesmo erro duas vezes. Base de problemas e soluções **por projeto** em
`.claude/memory/errors/`, indexada por keywords. `<skill-dir>` abaixo é a pasta deste
`SKILL.md`; os scripts rodam com `python <skill-dir>/scripts/<nome>.py` a partir da raiz
do projeto (ou com `--root <projeto>`).

## A regra que mais importa

> **Solução documentada que falhou tem que ser marcada OBSOLETA na mesma sessão,
> antes de você tentar outra coisa.**

Sem isso a base apodrece do jeito mais perigoso: a entrada acumula duas soluções, a
antiga aparece primeiro, e o próximo lookup entrega justamente a que já não funciona —
gerando um novo loop de erro. Uma base que mente é pior que base nenhuma.

## Roteamento de args

| Args | Ação |
|---|---|
| `lookup <keywords...>` | Workflow 1 — buscar |
| `save <categoria> <descrição...>` | Workflow 2 — registrar |
| `fail <ERR-NNN> <o que aconteceu>` | Workflow 3 — marcar solução como obsoleta |
| `check` | Rodar `<skill-dir>/scripts/integrity.py` |
| `list <categoria>` / `stats` | Listar / estatísticas |
| (vazio) | Mostrar status da base (ou criá-la, se não existir) |

## Workflow 1 — LOOKUP (obrigatório após 2 falhas e antes de operação arriscada)

1. **Extraia 3-5 keywords**: código de erro (`401`, `ENOENT`), ferramenta (`git`,
   `docker`), operação (`deploy`, `push`), trecho literal da mensagem.
2. **Leia `.claude/memory/errors/INDEX.md`** com a tool Read e procure as keywords.
   Nunca teste a existência do arquivo com caminho relativo no shell — dá falso negativo.
   Não existe? A base ainda não foi criada: siga resolvendo e crie-a no save.
3. **Abra o arquivo de categoria** e localize a entrada pelo ID.
4. **Cheque o campo `Status` ANTES de aplicar:**
   - `ATIVA` → aplique.
   - `OBSOLETA` → **não tente**. Leia o motivo e vá para a solução que a substituiu.
   - `ATIVA — não re-verificada` → pode aplicar, mas trate como hipótese; se falhar, é
     caso de `fail` (Workflow 3), não de tentar de novo.
5. **Confira o fingerprint de ambiente** (versão de CLI, runtime, SO). Solução registrada
   para `cli v2.22` pode não valer em `v2.72` — divergiu, suspeite.
6. **Reporte o desfecho**: funcionou → atualize `Última vez` e `Vezes atingido`.
   Não funcionou → **Workflow 3, imediatamente**.

Não achou nada? Consulte `.claude/KNOWN_ISSUES.md` se o projeto tiver; depois continue
resolvendo e registre no fim (Workflow 2).

## Workflow 2 — SAVE (após resolver algo que levou 2+ tentativas)

**Antes de criar ID novo, procure duplicata.** Busque as keywords no INDEX. Se já existe
entrada para o mesmo problema, **atualize aquela entrada** — nunca crie uma segunda.

1. **Classifique** pela tabela de [categories.md](categories.md).
2. **Pegue o próximo ID** com `python <skill-dir>/scripts/integrity.py --next-id`. Nunca
   estime o ID "de olho" no arquivo — é assim que dois erros acabam com o mesmo ID.
3. **Escreva a entrada** no fim do arquivo de categoria, no formato de
   [error-entry-template.md](error-entry-template.md). Campos obrigatórios: Keywords,
   Status, Ambiente, Sintoma literal, Causa raiz, Solução copiável, "Como saber que voltou
   a quebrar".
4. **Sem segredo na base.** Token, chave, senha ou URL assinada viram o nome da variável
   (`$API_TOKEN`). A base é lida por todo agente e às vezes vai para o git.
5. **Adicione a linha no INDEX**, dentro da tabela — nunca depois de uma seção posterior
   (linha apendada lá embaixo se perde numa reescrita).
6. **Rode `python <skill-dir>/scripts/integrity.py`.** Saiu diferente de zero, conserte
   antes de seguir.

Base ainda não existe? Crie `.claude/memory/errors/INDEX.md` com o cabeçalho de
[categories.md](categories.md#index) e o arquivo de categoria na hora do primeiro save.

## Workflow 3 — FAIL (a solução documentada não funcionou)

Este é o workflow que impede o loop. Execute **na hora**, antes de tentar outra abordagem:

1. Na entrada, mude o campo: `| **Status** | OBSOLETA desde AAAA-MM-DD — <motivo> |`
2. Renomeie a seção `### Solução` para `### Solução obsoleta (AAAA-MM-DD)` e deixe uma
   linha explicando **por que parou de funcionar** (versão nova, endpoint mudou, permissão
   revogada). O histórico fica — o que não pode é parecer válido.
3. Quando achar a solução nova, adicione `### Solução (AAAA-MM-DD)` **acima** da obsoleta
   e volte o Status para `ATIVA (verificada em AAAA-MM-DD)`.
4. Atualize a descrição no INDEX se a keyword de busca mudou.

Uma entrada tem **exatamente uma** solução ativa, sempre acima das obsoletas.

## Integridade

```bash
python <skill-dir>/scripts/integrity.py            # checa a base
python <skill-dir>/scripts/integrity.py --next-id  # próximo ID livre
```

Detecta ID duplicado, linha de índice sem entrada, entrada fora do índice, entrada sem
Status e credencial colada na base. Sai com código 1 se achar problema. Rode **depois de
todo save** e sempre que um lookup devolver algo que parece errado.

## Ativação automática

O hook `PostToolUseFailure` (script `scripts/failure_hook.py`, configurado no
`settings.json` do usuário) conta as falhas de shell por operação e só injeta o lembrete
a partir da **2ª falha da mesma operação** — falha única e comandos que saem 1 por design
(`grep` sem match, `diff`) ficam em silêncio. Detalhes, configuração e o que conta como
"mesma operação": [auto-trigger-rules.md](auto-trigger-rules.md).

## Manutenção

- Arquivo de categoria acima de ~300 linhas → divida por subcategoria (`cli.md` →
  `cli-auth.md`, `cli-deploy.md`) e atualize o INDEX.
- Entrada sem uso há mais de 6 meses → mova para uma seção "Arquivo" no fim do arquivo.
- Solução obsoleta **nunca** é deletada: serve de histórico e evita que alguém a
  redescubra como novidade.

## Regras críticas

1. Após 2 falhas, a consulta é **obrigatória** — mesmo que você ache que sabe a resposta.
2. Solução que falhou vira `OBSOLETA` na mesma sessão. Sem exceção.
3. Um problema = uma entrada. Duplicata é bug, não redundância.
4. Keywords específicas e técnicas; keyword genérica não é encontrada.
5. Registre a **causa raiz**, não só o comando que resolveu.
6. Sempre o fingerprint de ambiente — é o que permite julgar se a solução envelheceu.
7. Só salve solução **verificada**; erro trivial (typo, path errado) e bug de lógica de
   negócio não entram.
8. Nunca grave segredo na base.

## Integração com KNOWN_ISSUES.md

`.claude/KNOWN_ISSUES.md` (quando o projeto tem) é complementar: problemas estruturais do
**projeto** (infra, ferramenta bloqueada), escritos para humanos. `error-memory` é o
**fluxo de trabalho** do Claude. Um problema que é os dois entra nos dois lugares.
