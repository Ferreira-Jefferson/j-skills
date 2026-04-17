# Template de Entrada de Erro

Use este template ao salvar um novo erro no Workflow 2: SAVE.

---

```markdown
## [ERR-NNN] Descrição curta do problema

| Campo | Valor |
|-------|-------|
| **Keywords** | keyword1, keyword2, keyword3 (3-5 termos técnicos para busca) |
| **Categoria** | supabase / git / deploy / typescript / database / runtime / network / windows / tooling / other |
| **Severidade** | critical / high / medium / low |
| **Primeira vez** | YYYY-MM-DD |
| **Última vez** | YYYY-MM-DD |
| **Vezes atingido** | N |
| **Tentativas até solução** | N |

### Sintoma
O que aconteceu? Qual foi a mensagem de erro?
```
Inclua a mensagem de erro exata ou o trecho mais relevante.
```

### Causa raiz
Por que aconteceu? Qual era o problema subjacente?

### Solução
Passo a passo exato para resolver:
1. Primeiro faça X
2. Depois execute Y
3. Verifique com Z

```bash
# Comando exato que resolve (se aplicável)
comando --com --flags-exatas
```

### Contexto adicional
- Ambiente: Windows 11 / WSL / Deno / Node vX.Y
- Versões relevantes
- Pré-condições necessárias
- Links úteis

---
```

## Regras para preencher

1. **Keywords**: Termos que alguém buscaria ao encontrar o mesmo erro.
   - BOM: `401, supabase, functions, deploy, jwt`
   - RUIM: `erro, problema, não funciona`

2. **Descrição curta**: Uma frase que identifique o problema unicamente.
   - BOM: `Edge Function deploy retorna 401 sem --no-verify-jwt`
   - RUIM: `Erro no deploy`

3. **Sintoma**: Copie a mensagem de erro exata. Isso permite matching futuro.

4. **Causa raiz**: Explique o PORQUÊ, não apenas o QUÊ.

5. **Solução**: Deve ser acionável. Alguém seguindo os passos deve resolver sem pensar.

6. **Severidade**:
   - `critical`: Bloqueia todo o trabalho, sem workaround
   - `high`: Bloqueia a tarefa atual, mas tem workaround parcial
   - `medium`: Causa atraso mas não bloqueia
   - `low`: Inconveniente menor
