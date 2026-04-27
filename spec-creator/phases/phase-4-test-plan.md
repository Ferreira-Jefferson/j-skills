# FASE 4 — TEST-PLAN.md

> **Propósito:** Mapa de cobertura. Prova que cada AC é testável e define como será testado. Vinculado 1:1 com REQUIREMENTS.

## O que deve constar

- **Estratégia** — Pirâmide de testes (60% unit / 30% integration / 10% E2E), ferramentas do projeto
- **Casos de Teste** — Agrupados por tipo:
  - **Unitários (UT)**: função/método isolado — entrada, saída esperada, AC coberto
  - **Integração (IT)**: contratos de API, interação com banco/serviços externos
  - **E2E**: fluxos críticos end-to-end (se houver UI)
  - **Segurança (SEC)**: APENAS para itens marcados como aplicáveis no DESIGN § Segurança
- **Cobertura de ACs** — Tabela AC → tipo de teste → caso de teste → status
- **Critérios de Done** — Meta de cobertura, zero testes falhando

## Testes de Segurança: regra de ouro

Gere APENAS casos SEC para riscos marcados como **Aplicável** no DESIGN.
Não invente testes para riscos declarados N/A — isso gera implementações artificiais.

Categorias de referência (use somente as relevantes):
- **SEC-A (Acesso)**: 401 sem token, 403 sem permissão, IDOR
- **SEC-B (Input)**: SQL injection, XSS
- **SEC-C (Dados)**: PII em logs, tokens expostos
- **SEC-D (Rate Limit)**: 429 + Retry-After

## Adaptação

- Use as ferramentas de teste do projeto (descobertas na FASE 0) — não assuma Jest/Playwright
- Feature sem UI: pule E2E ou substitua por smoke tests de API
- Pipeline/cron: foque em integração com dados reais
- Micro-feature: 3-5 testes podem ser suficientes. A pirâmide é guia, não dogma.

## Anti-padrões

- Criar testes SEC para riscos que o DESIGN declarou N/A
- Listar testes sem vincular a ACs — gera cobertura fantasma
- Copiar a pirâmide 60/30/10 literalmente sem adaptar à feature

## Saída e dispatch ao reviewer

Gere `.claude/specs/[feature-name]/TEST-PLAN.md` e submeta ao **spec-reviewer** com o prompt obrigatório:

> *"Um desenvolvedor produziu o documento TEST-PLAN.md (FASE 4) para a feature [feature-name]. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: cada AC do REQUIREMENTS tem ao menos 1 teste? A pirâmide foi adaptada à feature (não copiada literalmente)? Testes SEC só foram criados para riscos marcados como Aplicável no DESIGN? Aprovar ou pedir correções."*

- **APROVADO** → avançar automaticamente para FASE 5
- **REJEITADO** → corrigir os issues bloqueantes e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer
