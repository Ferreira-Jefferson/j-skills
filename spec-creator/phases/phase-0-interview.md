# FASE 0 — Discovery & Entrevista

## Etapa 1: Discovery silenciosa

Antes de qualquer pergunta, explore o projeto. Leia o que existir:

- **Instruções do projeto** — `CLAUDE.md`, `.claude/README.md`, ou equivalente
- **Manifest** — `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Gemfile`
- **Estrutura de diretórios** — 1 nível de profundidade (`ls` ou tree)
- **Histórico recente** — `git log --oneline -10`
- **Specs anteriores** — `.claude/specs/` (se existir) — para seguir convenções já estabelecidas

Sintetize internamente: tipo de projeto, stack, padrões arquiteturais, convenções de teste, estratégia de deploy, banco de dados.

## Etapa 2: Entrevista targeted

Com base no que descobriu, pergunte **apenas o que não é derivável do código**:

1. **Objetivo** — Qual problema esta feature resolve? Para quem?
2. **Escopo negativo** — O que está explicitamente fora do escopo?
3. **Restrições** — Prazo, performance, compatibilidade, regulatória?
4. **Integrações** — APIs externas, serviços, sistemas que a feature precisa tocar?
5. **Critério de sucesso** — Como saberemos que está pronta?

Adapte as perguntas: se a discovery já respondeu algo, não repita. Se encontrou padrões relevantes (ex: o projeto usa migrations, tem CI, tem RLS), mencione e pergunte se a feature os envolve.

## Etapa 3: Confirmação

Apresente um resumo consolidando discovery + respostas:

> *"Entendi o seguinte: [contexto do projeto + feature proposta + restrições]. Posso avançar para a FASE 1 — SPEC?"*
