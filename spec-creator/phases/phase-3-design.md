# FASE 3 — DESIGN.md (Arquitetura)

> **Propósito:** Blueprint técnico. Um desenvolvedor deve conseguir implementar a feature lendo apenas este documento + REQUIREMENTS.

## O que deve constar

- **Visão arquitetural** — Diagrama de componentes, padrões adotados (com justificativa)
- **Modelo de dados** — Entidades, relacionamentos, migrações necessárias (seguindo convenções do projeto)
- **API Contract** — Endpoints, request/response, status codes, cenários de erro
- **Frontend** (se aplicável) — Árvore de componentes, state shape, fluxo de dados
- **Segurança** — Avaliação condicional (ver abaixo)
- **Performance** — Cache, paginação, índices
- **Tratamento de erros** — Cenários, comportamento, logging, alertas
- **ADRs** — Uma por decisão arquitetural não-óbvia (use `@.claude/skills/spec-creator/adr-template.md`)

## Seção de Segurança: avaliação condicional

Não force todos os itens. Primeiro responda o perfil de risco da feature:

| Pergunta | Se Sim → avalie |
|----------|-----------------|
| Expõe endpoint HTTP externo? | Controle de acesso (autenticação, autorização, RBAC) |
| Recebe input de usuário? | Validação & sanitização (SQL injection, XSS, command injection) |
| Lida com PII/tokens/dados financeiros? | Dados sensíveis (masking em logs, encryption) |
| Endpoint público com volume? | Rate limiting (limites, CSRF, headers de segurança) |
| Adiciona dependências externas? | Supply chain (audit no CI) |

Itens **aplicáveis** tornam-se obrigatórios no TEST-PLAN (FASE 4).
Itens **não-aplicáveis** → "N/A" com justificativa de 1 linha. Não crie seções vazias.

## Adaptação

- **Backend-only**: pule § Frontend inteiro
- **Módulo interno sem API**: pule § API Contract, foque em interfaces internas
- **Infra/devops**: foque em diagrama de deploy, configuração, rollback
- **Siga as convenções** de migração e schema do projeto (descobertas na FASE 0)

## Anti-padrões

- Forçar seção Frontend para features sem UI
- Marcar todos os riscos OWASP como "Aplicável" por precaução — só gera trabalho inútil
- Modelo de dados sem relacionamentos ou sem migrações

## Saída

Gere `.claude/specs/[feature-name]/DESIGN.md` e pergunte:
> *"DESIGN completo. Revise arquitetura, modelo de dados e API contract — este é o ponto mais crítico. Posso avançar para o TEST PLAN?"*
