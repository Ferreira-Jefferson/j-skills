# Template de Entrada de Erro

Use no Workflow 2 (SAVE). ID vem de `python <skill-dir>/scripts/integrity.py --next-id`.

```markdown
## [ERR-NNN] Título curto: sintoma → causa

| Campo | Valor |
|-------|-------|
| **Keywords** | 8-12 termos técnicos e específicos (código de erro, ferramenta, operação, trecho da mensagem) |
| **Status** | ATIVA (verificada em AAAA-MM-DD) |
| **Categoria** | windows |
| **Ambiente** | SO, shell, versões de runtime e CLI envolvidas (ex.: Windows 11, Git Bash, Node v24, cli v2.72) |
| **Severidade** | low / medium / high |
| **Primeira vez** | AAAA-MM-DD |
| **Última vez** | AAAA-MM-DD |
| **Vezes atingido** | 1 |
| **Tentativas até solução** | 3 |

### Sintoma
Mensagem de erro literal, dentro de bloco de código.

### Causa raiz
Por que acontece — não só o que fazer.

### Solução
Comando exato, copiável. Segredos como variável (`$API_TOKEN`), nunca o valor.

### Como saber que voltou a quebrar
O sinal que indica que esta solução expirou (versão nova, mensagem diferente, etc.).
```

## Valores de Status

| Status | Significado |
|---|---|
| `ATIVA (verificada em AAAA-MM-DD)` | Funcionou na data indicada |
| `ATIVA — não re-verificada` | Funcionou no passado, ninguém confirmou desde; trate como hipótese |
| `OBSOLETA desde AAAA-MM-DD — <motivo>` | Não aplique; a solução nova fica acima (Workflow 3) |

## Boas práticas

1. **Mensagem de erro literal** — copie, não parafraseie; é por ela que o lookup acha.
2. **Causa raiz explícita** — "porque o CLI não envia o header X", não só "adicionei a flag".
3. **Uma solução ativa por entrada** — as obsoletas ficam abaixo, marcadas, como histórico.
4. **Sem segredo** — `integrity.py` reprova a base se achar token ou chave.
