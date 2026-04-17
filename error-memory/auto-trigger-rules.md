# Regras de Ativação Automática

Este documento define QUANDO e COMO o skill error-memory deve ser ativado
automaticamente pelo Claude, sem necessidade de comando explícito do usuário.

## Gatilho Primário: Regra das 2 Falhas

```
SE (mesma operação falhou 2 vezes consecutivas)
  → ATIVAR error-memory Workflow 1: LOOKUP
  → Buscar keywords do erro no INDEX.md
  → Se encontrou: aplicar solução
  → Se não encontrou: continuar resolvendo
```

### O que conta como "mesma operação"?

- Mesmo comando executado 2x com o mesmo tipo de erro
- Mesmo tipo de abordagem tentada 2x (ex: instalar pacote de 2 formas, ambas falharam)
- Mesmo arquivo editado 2x tentando corrigir o mesmo bug

### O que NÃO conta?

- Dois erros diferentes em operações diferentes
- Uma falha seguida de sucesso parcial
- Erros esperados (ex: teste que deve falhar)

## Gatilhos Secundários

### Antes de operações de risco
```
SE (operação é deploy, migration, push, ou schema change)
  → CONSULTAR error-memory para keywords: [operação] + [ambiente]
  → Se há erros registrados para essa combinação: mostrar ao usuário
```

### Ao encontrar erro conhecido
```
SE (mensagem de erro contém keywords de 3+ entradas no INDEX.md)
  → SUGERIR: "Encontrei N erros similares na base. Consultar?"
```

## Fluxo de Salvamento Automático

```
SE (problema resolvido APÓS 2+ tentativas)
E  (solução NÃO estava no error-memory)
ENTÃO:
  1. Classificar o erro (categoria)
  2. Extrair keywords da mensagem de erro
  3. Documentar sintoma, causa raiz, solução
  4. Salvar no arquivo de categoria
  5. Atualizar INDEX.md
  6. Informar usuário: "Erro salvo na base: ERR-NNN [descrição]"
```

## Integração com KNOWN_ISSUES.md

O CLAUDE.md do projeto já menciona consultar `.claude/KNOWN_ISSUES.md` após 2 falhas.
O error-memory complementa isso:

1. **KNOWN_ISSUES.md** → problemas estruturais do projeto (documentado por humanos)
2. **error-memory** → problemas encontrados durante execução (documentado automaticamente)

**Ordem de consulta:**
1. Primeiro: error-memory (mais rápido, mais específico)
2. Segundo: KNOWN_ISSUES.md (mais abrangente, contexto do projeto)
3. Se não achou em nenhum: resolver e salvar no error-memory

## Anti-Patterns (NÃO fazer)

1. **NÃO salvar erros triviais** (typo, arquivo não encontrado por path errado)
2. **NÃO salvar erros de lógica de negócio** (bug no código do usuário)
3. **NÃO consultar para erros únicos** (primeira falha → tente de novo normalmente)
4. **NÃO ignorar a base quando ela tem a solução** (economia de tokens é o objetivo)
5. **NÃO salvar soluções incompletas** (se não testou, não salve)
