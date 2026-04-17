# SDD — Gotchas

Erros frequentes observados em execuções SDD. Consulte antes de iniciar cada sessão.
Adicione novas entradas sempre que Claude tropeçar em algo novo.

## G-001: Pular FASE 0 e ir direto para FASE 1
**Sintoma:** Recebe "quero implementar X" e já começa a escrever SPEC.md sem explorar o projeto.
**Fix:** FASE 0 é obrigatória. Sem discovery + entrevista, requisitos ficam incompletos e o escopo vira alvo móvel.

## G-002: Carregar todos os arquivos de fase de uma vez
**Sintoma:** Lê phase-0 até phase-8 no início da conversa para "ter contexto completo".
**Fix:** Carregue APENAS o arquivo da fase atual. Fases futuras não devem estar em contexto — aumentam tokens e criam confusão.

## G-003: Avançar para FASE 6 sem aprovação explícita da FASE 5
**Sintoma:** Após escrever TASKS.md, começa a implementar sem esperar confirmação.
**Fix:** Toda transição de fase requer aprovação. "Parece bom" não é aprovação. Aguarde "aprovado", "pode ir", "ok" ou equivalente explícito.

## G-004: Criar branch depois de começar a codar
**Sintoma:** Escreve código na branch atual e cria a branch dedicada depois.
**Fix:** Branch é criada ANTES da TASK-001 — é o primeiro ato da FASE 6, não uma formalidade posterior.

## G-005: Salvar arquivos de spec fora da pasta dedicada
**Sintoma:** SPEC.md, REQUIREMENTS.md ou DESIGN.md salvos na raiz do projeto ou em `docs/`.
**Fix:** Todos os artefatos da spec vivem na pasta dedicada da feature. Default: `.claude/specs/[feature-name]/`.

## G-006: Gerar START.md antes da REVIEW FINAL
**Sintoma:** START.md gerado ao final da FASE 5 ou durante a FASE 6 "para facilitar retomada".
**Fix:** START.md é gerado APENAS na FASE 8, depois que REVIEW-FINAL.md está completo.

## G-007: Executar múltiplas tasks sem pausa entre elas
**Sintoma:** Implementa TASK-001, TASK-002, TASK-003 em sequência sem esperar feedback.
**Fix:** Cada task exige: código → testes → commit → aprovação. Uma task de cada vez.

## G-008: Escrever código antes da FASE 5 aprovada
**Sintoma:** Durante FASE 3 ou FASE 4, já começa a "esboçar" funções ou classes como "rascunho".
**Fix:** Qualquer código antes da FASE 5 aprovada é proibido. Documente em ADR se necessário.

## G-009: Assumir stack/convenções em vez de descobrir
**Sintoma:** Gera templates com "Jest/Playwright" sem verificar se o projeto usa essas ferramentas.
**Fix:** FASE 0 (Discovery) existe para isso. Leia o manifest e a estrutura do projeto antes de assumir qualquer stack.

## G-010: Forçar seções irrelevantes por seguir template rígido
**Sintoma:** Feature backend-only com seção "Frontend Components" vazia, ou pipeline com seção "Rate Limiting".
**Fix:** Cada phase file tem uma seção "Adaptação" — use-a. Omita seções que não se aplicam à feature.
