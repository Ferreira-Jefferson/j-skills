# FASE 0 — Discovery & Entrevista

## Etapa 1: Discovery silenciosa

Antes de qualquer pergunta, explore o projeto. Leia o que existir:

- **Instruções do projeto** — `CLAUDE.md`, `.claude/README.md`, ou equivalente. **LEITURA OBRIGATÓRIA** — extrair regras vinculantes (formato de commit, hooks pre-commit, regras de migration, error-memory, restrições de deploy, etc.)
- **Manifest** — `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Gemfile`
- **Estrutura de diretórios** — 1 nível de profundidade (`ls` ou tree)
- **Histórico recente** — `git log --oneline -10`
- **Specs anteriores** — `.claude/specs/` (se existir) — para seguir convenções já estabelecidas e identificar maior `FEAT-NNN`

Sintetize internamente: tipo de projeto, stack, padrões arquiteturais, convenções de teste, estratégia de deploy, banco de dados.

### Captura de convenções vinculantes (obrigatório)

Extrair do CLAUDE.md (e arquivos correlatos) tudo que será **regra obrigatória** para os agentes desenvolvedor/orquestrador na implementação. Listar em formato reproduzível para o CONTEXT.md:

- **Formato de commit** — autor, email, mensagem, footer (Co-Authored-By? sim/não)
- **Hooks de pre-commit** — quais existem, o que fazem
- **Skills obrigatórias do projeto** — ex: `error-memory` após 2 falhas
- **Regras de migration / schema** — onde mora, idempotência exigida
- **Operações destrutivas que exigem aprovação** — DELETE, DROP, etc.
- **Branch strategy** — onde mergear, ambiente
- **Variáveis de ambiente sensíveis** — onde estão (.env.test? secret manager?), nunca commitar

Esse bloco será transcrito **literalmente** no START.md como vinculante para os agentes da spec.

## Etapa 2: Entrevista targeted

Com base no que descobriu, pergunte **apenas o que não é derivável do código**:

1. **Objetivo** — Qual problema esta feature resolve? Para quem?
2. **Escopo negativo** — O que está explicitamente fora do escopo?
3. **Restrições** — Prazo, performance, compatibilidade, regulatória?
4. **Integrações** — APIs externas, serviços, sistemas que a feature precisa tocar?
5. **Critério de sucesso** — Como saberemos que está pronta?

Adapte as perguntas: se a discovery já respondeu algo, não repita. Se encontrou padrões relevantes (ex: o projeto usa migrations, tem CI, tem RLS), mencione e pergunte se a feature os envolve.

## Etapa 3: Síntese e dispatch

Após a entrevista, gere `.claude/specs/[feature-name]/CONTEXT.md` consolidando discovery + respostas (contexto do projeto, feature proposta, restrições, escopo negativo).

Submeta o CONTEXT.md ao **spec-reviewer** (`@.claude/skills/spec-creator/agents/spec-reviewer.md`) com o prompt obrigatório:

> *"Um desenvolvedor produziu o documento CONTEXT.md (FASE 0) para a feature [feature-name]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: a discovery foi suficiente? Há ambiguidade que vai contaminar a SPEC? O escopo está claro? Aprovar ou exigir mais informação."*

- **APROVADO** → avançar automaticamente para FASE 1
- **REJEITADO** → revisar a entrevista (perguntar de novo o que ficou ambíguo) e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer
