# FASE 6 — Review Final da Spec

> **Propósito:** Revisar **toda a spec** (SPEC + REQUIREMENTS + DESIGN + TEST-PLAN + TASKS) para confirmar que está completa, consistente e pronta para ser entregue a uma sessão de implementação. **Nenhum código é escrito nesta fase.**

Esta skill apenas **define** a spec. A fase de review verifica se a definição está sólida — não revisa implementação, pois implementação ainda não existe.

## O que revisar

Gere `.claude/specs/[feature-name]/REVIEW-FINAL.md` com as seguintes seções:

### 1. Consistência entre documentos
- Todo RF do REQUIREMENTS aparece no DESIGN (como componente/endpoint/fluxo)?
- Todo RF tem pelo menos 1 teste no TEST-PLAN?
- Todo RF tem pelo menos 1 task no TASKS vinculada?
- Todo RNF tem métrica concreta + teste de validação?
- Todo risco identificado no SPEC tem mitigação no DESIGN?
- Decisões arquiteturais não-óbvias têm ADR correspondente?

### 2. Cobertura de requisitos (matriz)
Tabela `RF/RNF × DESIGN × TEST-PLAN × TASKS`. Uma linha por requisito. Marque ✅ onde coberto, ❌ onde falta.

### 3. Qualidade das tasks (FASE 5)
- Toda task tem critério de conclusão **verificável** (nada vago como "implementar feature")?
- Arquivos mapeados com caminhos **reais** (sem placeholders genéricos `@src/[caminho]`)?
- Dependências entre tasks explícitas e sem ciclos?
- Testes do TEST-PLAN vinculados a cada task?
- Tasks atômicas (1 responsabilidade = 1 commit)?

### 4. Gaps e pendências
Liste o que ficou indefinido ou ambíguo:
- Decisões técnicas não cobertas (ex: qual biblioteca de hash, formato de token)
- Integrações externas sem contrato claro
- Fluxos de erro não mapeados
- Validações de entrada sem especificação

Cada gap vira uma **ação de correção** (voltar para a fase X e complementar) ou um **ADR** se for decisão consciente de adiamento.

### 5. Checklist de prontidão
Responda sim/não a cada:
- [ ] SPEC articula problema, solução e escopo negativo?
- [ ] REQUIREMENTS tem ACs verificáveis e matriz de rastreabilidade?
- [ ] DESIGN cobre arquitetura, dados, API, segurança, performance?
- [ ] TEST-PLAN respeita pirâmide e cobre todos os ACs?
- [ ] TASKS são atômicas, com arquivos mapeados e testes vinculados?
- [ ] ADRs criados para toda decisão não-óbvia?
- [ ] Nenhum gap bloqueante aberto?

## Regras

- **Não implemente.** Esta skill termina com a spec pronta; implementação ocorre em sessão separada via START.md.
- **Não avance se houver gap bloqueante.** Retorne à fase correspondente, corrija e refaça o review.
- **Use dados reais da spec.** Cada afirmação deve poder ser checada abrindo o documento citado.

## Saída e dispatch ao reviewer

Gere `.claude/specs/[feature-name]/REVIEW-FINAL.md` e submeta ao **spec-reviewer** com o prompt obrigatório:

> *"Um desenvolvedor produziu o REVIEW-FINAL.md (FASE 6) para a feature [feature-name], consolidando a auditoria de toda a spec. Você é um revisor sênior. Avalie com olhar crítico de senior engineer: a matriz de rastreabilidade RF/RNF × DESIGN × TEST-PLAN × TASKS está completa? Os gaps listados são reais e cobrem tudo? Há gap bloqueante não tratado? A spec está pronta para handoff de implementação? Aprovar ou pedir correções."*

- **APROVADO** → avançar automaticamente para FASE 7 (geração do START.md)
- **REJEITADO** → corrigir os issues bloqueantes (geralmente voltando à fase correspondente para complementar) e re-submeter
- **ESCALAR** → consultar humano com a pergunta específica do reviewer

**Regra:** se o REVIEW-FINAL listar gaps bloqueantes, o reviewer DEVE rejeitar — não há handoff com gaps abertos.
