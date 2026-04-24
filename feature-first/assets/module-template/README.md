# Module template

Copiar esta pasta inteira (ou usar `scripts/scaffold_module.sh`) para criar um módulo novo.

## Estrutura sugerida

```
modules/__MODULE_NAME__/
├── MODULE.md                  ← manifest do módulo (OBRIGATÓRIO)
├── domain.{py,ts,go}          ← regra de negócio do módulo
├── handlers.{py,ts,go}        ← entry points (HTTP, job, evento)
├── ui.{tsx,vue,html}          ← se aplicável
├── migrations/                ← tabelas próprias do módulo
│   └── 001_initial.sql
├── fixtures/                  ← dados de exemplo / seeds / snapshots
└── tests/
    ├── test_domain.*          ← unit
    └── test_integration.*     ← integração (DB real, APIs mockadas)
```

## Regras ao criar um módulo

1. Preencher `MODULE.md` antes de escrever código — força explicitar propósito e fronteira.
2. Nomear em `snake_case` com verbo+substantivo concreto (ex: `publish_meta_ads`, `generate_persona`).
3. Só importar de `shared/*` e do próprio módulo — nunca de outros módulos.
4. Publicar eventos em `shared/contracts/` quando precisar comunicar com outros módulos.
5. Migrations do módulo moram no próprio módulo — não em pasta global.

## Arquivos que este template inclui

- `MODULE.md` — manifest template com seções obrigatórias e placeholders
- `README.md` — este arquivo (remover após scaffold ou deixar para referência)

Pastas como `migrations/`, `fixtures/`, `tests/` são criadas pelo script de scaffold conforme a stack escolhida.
