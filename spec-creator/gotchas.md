# SDD — Gotchas

Erros frequentes observados em execuções SDD. Consulte antes de iniciar cada sessão.
Adicione novas entradas sempre que Claude tropeçar em algo novo.

## G-001: Pular FASE 0 e ir direto para FASE 1
**Sintoma:** Recebe "quero implementar X" e já começa a escrever SPEC.md sem explorar o projeto.
**Fix:** FASE 0 é obrigatória. Sem discovery + entrevista, requisitos ficam incompletos e o escopo vira alvo móvel.

## G-002: Carregar todos os arquivos de fase de uma vez
**Sintoma:** Lê phase-0 até phase-7 no início da conversa para "ter contexto completo".
**Fix:** Carregue APENAS o arquivo da fase atual. Fases futuras não devem estar em contexto — aumentam tokens e criam confusão.

## G-003: Tentar implementar durante a skill
**Sintoma:** Depois de gerar TASKS.md ou REVIEW-FINAL.md, começa a escrever código ou criar branch.
**Fix:** Esta skill **apenas define** a spec. Nenhum código é escrito. A implementação ocorre em sessão separada, guiada pelo START.md gerado na FASE 7.

## G-004: Review da FASE 6 cobrir implementação em vez de spec
**Sintoma:** REVIEW-FINAL.md lista "cobertura de testes observada", "dívidas técnicas encontradas durante implementação", etc.
**Fix:** A FASE 6 revisa a **completude da spec** (consistência entre SPEC/REQUIREMENTS/DESIGN/TEST-PLAN/TASKS, gaps, ACs verificáveis), não a implementação — que ainda não existe nesta skill.

## G-005: Salvar arquivos de spec fora da pasta dedicada
**Sintoma:** SPEC.md, REQUIREMENTS.md ou DESIGN.md salvos na raiz do projeto ou em `docs/`.
**Fix:** Todos os artefatos da spec vivem na pasta dedicada da feature. Default: `.claude/specs/[feature-name]/`.

## G-006: Gerar START.md antes da REVIEW FINAL
**Sintoma:** START.md gerado ao final da FASE 5 "para facilitar retomada".
**Fix:** START.md é gerado APENAS na FASE 7, depois que REVIEW-FINAL.md confirma que a spec está completa.

## G-007: Avançar de fase sem dispatch ao spec-reviewer
**Sintoma:** Após escrever um doc, começa o próximo sem submeter ao revisor formal — ou pergunta ao usuário em vez de acionar o agente.
**Fix:** Toda transição é gateada pelo agente `spec-reviewer` (não pelo humano). Submeta o doc com o prompt obrigatório de revisão sênior; só avance no veredicto APROVADO. Em REJEITADO, corrija e re-submeta. Em ESCALAR, aí sim consulte o humano. (FASE 7 é automática após APROVADO em FASE 6.)

## G-008: START.md marcar tasks como "em andamento" ou "concluídas"
**Sintoma:** O START.md gerado declara TASK-001 como "em andamento" ou lista tasks como "concluídas".
**Fix:** Esta skill não implementa, logo **todas as tasks começam como pendentes**. O START.md indica apenas qual é a próxima a iniciar (TASK-001).

## G-009: Assumir stack/convenções em vez de descobrir
**Sintoma:** Gera templates com "Jest/Playwright" sem verificar se o projeto usa essas ferramentas.
**Fix:** FASE 0 (Discovery) existe para isso. Leia o manifest e a estrutura do projeto antes de assumir qualquer stack.

## G-010: Forçar seções irrelevantes por seguir template rígido
**Sintoma:** Feature backend-only com seção "Frontend Components" vazia, ou pipeline com seção "Rate Limiting".
**Fix:** Cada phase file tem uma seção "Adaptação" — use-a. Omita seções que não se aplicam à feature.

## G-011: Furo no DESIGN descoberto durante a implementação
**Sintoma:** Agente desenvolvedor (ou code-reviewer) escala porque o DESIGN omite uma decisão crítica ou está inconsistente com a realidade do código.
**Fix:** Esta skill é one-shot — não tem mecanismo de "re-disparar fases". O orquestrador deve **pausar a wave** e o usuário deve abrir uma **nova sessão de spec-creator com escopo de patch**: criar `.claude/specs/[feature-name]-patch-NN/` apenas com o delta (apenas os documentos da fase impactada). Após review, o patch é integrado manualmente nos docs originais e a implementação retoma. Nunca deixe o agente "improvisar" para preencher gap do DESIGN.

## G-012: Esquecer de materializar agentes no SETUP
**Sintoma:** A skill começa a FASE 0 sem ter criado `.claude/specs/[feature-name]/agents/` com os 3 templates copiados (orchestrator, code-reviewer, developer).
**Fix:** O SETUP é etapa OBRIGATÓRIA antes da FASE 0. Sem ele, a sessão de implementação não terá agentes formais para consumir — START.md vai apontar para arquivos inexistentes. Verificar que a pasta `agents/` da spec existe e contém os 3 arquivos (com placeholders já substituídos) antes de avançar para FASE 0.
