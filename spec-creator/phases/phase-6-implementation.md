# FASE 6 — Implementação (Task por Task)

## Pré-requisito: Branch dedicada

Antes da TASK-001, crie ou ative a branch da spec.
Consulte `@.claude/skills/spec-creator/rules.md` § 1 para convenções de nomenclatura.

Após confirmar a branch:
> *"Branch `<branch>` ativa. Iniciando TASK-001."*

## Protocolo por task

1. Anuncie: "Iniciando TASK-NNN — [título]"
2. Abra os arquivos pré-mapeados (`@caminho/arquivo`) — não re-explore a codebase
3. Implemente conforme os critérios de conclusão da task
4. Execute os testes associados
5. Se todos os critérios ✅: commit atômico descrevendo o que foi feito
6. Reporte: "TASK-NNN concluída. Aprove para avançar."

## Regras

- **Uma task por vez** — nunca avance sem aprovação explícita
- **Testes falhando = pare** — analise e corrija antes de continuar
- **Dúvida de design** — consulte os docs de spec, não assuma
- **Schema/infra changes** — siga as convenções do projeto (descobertas na FASE 0)
- **Decisão não prevista** — crie um ADR antes de prosseguir
