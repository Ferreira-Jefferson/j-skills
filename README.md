# j-skills

<div align="center">

![Skills](https://img.shields.io/badge/skills-3-6366f1?style=for-the-badge)
![Claude Code](https://img.shields.io/badge/Claude_Code-compatible-f97316?style=for-the-badge&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/license-GPL--3.0-22c55e?style=for-the-badge)
![Author](https://img.shields.io/badge/by-Jefferson_Ferreira-0ea5e9?style=for-the-badge&logo=github&logoColor=white)

**Skills pessoais para Claude Code — workflows complexos executados com consistência.**

</div>

---

## O que são skills?

Skills são instruções estruturadas que ensinam o Claude Code a executar workflows complexos de forma consistente. Cada skill fica numa pasta com um `SKILL.md` (ponto de entrada) e arquivos auxiliares com o detalhe de cada fase.

```
j-skills/
├── error-memory/          # memória persistente de erros
├── frontend-foundations/  # fundações e auditoria de frontend
└── spec-creator/          # spec-driven development
```

---

## Skills

### `error-memory` ![trigger](https://img.shields.io/badge/trigger-automático_após_2_falhas-ef4444?style=flat-square) ![version](https://img.shields.io/badge/version-1.0.0-94a3b8?style=flat-square)

Memória persistente de erros e soluções. Evita retry loops consultando uma base de conhecimento de problemas já resolvidos antes de tentar de novo.

| Workflow | Quando |
|----------|--------|
| **LOOKUP** | Após 2 falhas consecutivas na mesma operação |
| **SAVE** | Após resolver um problema novo que exigiu 2+ tentativas |
| **MAINTAIN** | Quando um arquivo de categoria passar de 80 entradas |

Mantém base categorizada em `.claude/memory/errors/` — `supabase`, `git`, `deploy`, `typescript`, `database`, `runtime`, `network`, `windows`, `tooling`.

---

### `frontend-foundations` ![trigger](https://img.shields.io/badge/trigger-greenfield_ou_auditoria-6366f1?style=flat-square) ![version](https://img.shields.io/badge/version-1.0.0-94a3b8?style=flat-square)

Fundações de qualidade para projetos frontend. Dois modos:

| Modo | Quando usar | Arquivos-chave |
|------|-------------|----------------|
| 🌱 **Greenfield** | Iniciando projeto novo | `setup-checklist.md` + `structure.md` + `templates/` |
| 🔎 **Auditoria** | Avaliando projeto existente | `audit-playbook.md` + `anti-patterns.md` |

**10 princípios cobertos:** tamanho de arquivo, duas camadas de componentes, reuso com governança, camadas distintas, regra de estilo, cobertura real, hooks como primitivos, resiliência por default, ADRs obrigatórios, tokens de design centralizados.

Inclui **templates prontos** para componentes, hooks, páginas, stores e testes.

---

### `spec-creator` ![trigger](https://img.shields.io/badge/trigger-qualquer_pedido_de_desenvolvimento-f97316?style=flat-square) ![version](https://img.shields.io/badge/version-1.0.1-94a3b8?style=flat-square)

Spec-Driven Development — nenhuma linha de código sem spec aprovada.

```
INPUT → FASE 0: Entrevista & Clarificação
      → FASE 1: SPEC.md          (visão geral)
      → FASE 2: REQUIREMENTS.md
      → FASE 3: DESIGN.md        (arquitetura)
      → FASE 4: TEST-PLAN.md
      → FASE 5: TASKS.md         (tasks atômicas)
      → FASE 6: IMPLEMENTATION   (task a task)
      → FASE 7: REVIEW FINAL
      → FASE 8: START autônomo
```

Cada fase é carregada on-demand. Toda transição requer aprovação explícita do usuário.

---

## Como usar

Copie a pasta da skill para `.claude/skills/` no seu projeto e registre no `CLAUDE.md`:

```md
## Skills disponíveis
- `error-memory` — memória persistente de erros
- `frontend-foundations` — fundações e auditoria de frontend
- `spec-creator` — spec-driven development
```

O Claude Code carrega automaticamente pelo `SKILL.md` de cada pasta.
