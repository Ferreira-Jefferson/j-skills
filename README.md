# j-skills

Skills pessoais para Claude Code — criadas e mantidas por Jefferson Ferreira.

## O que são skills?

Skills são instruções estruturadas que ensinam o Claude Code a executar workflows complexos de forma consistente. Cada skill fica numa pasta com um `SKILL.md` (ponto de entrada) e arquivos auxiliares.

## Skills disponíveis

### `error-memory`
Memória persistente de erros e soluções. Evita retry loops consultando uma base de conhecimento de problemas já resolvidos.

- **Trigger automático:** após 2 falhas consecutivas na mesma operação
- **Trigger manual:** "consultar erros", "já resolvemos isso?", `/error-memory`
- Mantém base categorizada em `.claude/memory/errors/`

### `frontend-foundations`
Fundações de qualidade para projetos frontend. Serve tanto para iniciar projetos novos (greenfield) quanto para auditar projetos existentes.

- **Greenfield:** setup-checklist + estrutura de diretórios + templates prontos
- **Auditoria:** diagnóstico de anti-padrões + métricas + plano de ação priorizado
- Inclui templates para componentes, hooks, páginas, stores e testes

### `spec-creator`
Spec-Driven Development (SDD). Gera documentação completa antes de qualquer código: SPEC → REQUIREMENTS → DESIGN → TEST PLAN → TASKS.

- Fluxo com 8 fases, cada uma com aprovação explícita
- Evita implementações sem alinhamento prévio
- **Trigger:** "quero desenvolver X", "preciso implementar Y", "adicionar feature de Z"

## Como usar

Copie a pasta da skill desejada para `.claude/skills/` no seu projeto e registre no `CLAUDE.md`:

```md
## Skills disponíveis
- `error-memory` — memória persistente de erros
- `frontend-foundations` — fundações e auditoria de frontend
- `spec-creator` — spec-driven development
```

O Claude Code carrega as skills automaticamente pelo `SKILL.md` de cada pasta.
