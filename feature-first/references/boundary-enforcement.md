# Boundary Enforcement — configs por stack

Regras arquiteturais **só funcionam se o build falhar** quando violadas. Este arquivo tem configs prontos para as stacks mais comuns.

## Princípio único

Três regras, sempre as mesmas:
1. `modules/<a>/` não importa de `modules/<b>/` (módulo não importa módulo)
2. `shared/` não importa de `modules/*` (shared não conhece features)
3. Imports de `shared/` a partir de `modules/` são OK e encorajados

Variações por linguagem a seguir.

---

## Python — `import-linter`

Instalação:
```bash
pip install import-linter
```

Arquivo `config/lint/.importlinter`:
```ini
[importlinter]
root_package = my_project
include_external_packages = True

# Regra 1: módulos são independentes entre si
[importlinter:contract:modules-independent]
name = Módulos não podem importar uns dos outros
type = independence
modules =
    my_project.modules.briefing
    my_project.modules.persona_gen
    my_project.modules.copy_gen
    my_project.modules.publish_meta_ads

# Regra 2: shared não pode importar de modules
[importlinter:contract:shared-below-modules]
name = shared/ nunca importa de modules/
type = forbidden
source_modules = my_project.shared
forbidden_modules = my_project.modules
```

Rodar no CI:
```bash
lint-imports --config config/lint/.importlinter
```

Quando um módulo novo for adicionado, a lista em `modules-independent` precisa ser atualizada. Automatizar com script (um loop listando `modules/*/` e regenerando a seção do config).

**Exceção legítima via `shared/contracts/`:** `modules/checkout` pode importar `my_project.shared.contracts.order` — é infra de contrato, não import cruzado.

---

## TypeScript / JavaScript — ESLint `eslint-plugin-boundaries`

Instalação:
```bash
npm i -D eslint-plugin-boundaries
```

Arquivo `eslint.config.js`:
```js
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'module', pattern: 'src/modules/*', mode: 'folder' },
        { type: 'shared', pattern: 'src/shared/*', mode: 'folder' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // módulos podem importar de shared
          { from: 'module', allow: ['shared'] },
          // shared só importa shared
          { from: 'shared', allow: ['shared'] },
        ],
      }],
      'boundaries/no-unknown': 'error',
      'boundaries/no-private': 'error',
    },
  },
];
```

Alternativa mais simples (sem plugin extra) usando `no-restricted-imports`:
```js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/modules/*/*'],
          message: 'Módulo não pode importar outro módulo. Use shared/contracts/ ou shared/*.',
        },
      ],
    }],
  },
}
```

Para o kernel não importar módulos, adicionar um override no ESLint que aplica restrição extra a arquivos em `src/shared/`.

---

## Go — check custom no CI

Go não tem padrão consolidado como `import-linter`, mas um script simples no CI resolve:

Arquivo `scripts/check_boundaries.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

violations=0

# Regra 1: módulos não importam outros módulos
for mod in modules/*/; do
    mod_name=$(basename "$mod")
    # procura imports de outros módulos dentro deste
    offending=$(grep -rn "\"myproject/modules/" "$mod" \
        | grep -v "\"myproject/modules/$mod_name" \
        || true)
    if [ -n "$offending" ]; then
        echo "Import cruzado em $mod_name:"
        echo "$offending"
        violations=$((violations+1))
    fi
done

# Regra 2: shared não importa de modules
offending=$(grep -rn "\"myproject/modules/" shared/ || true)
if [ -n "$offending" ]; then
    echo "shared/ importa de modules/:"
    echo "$offending"
    violations=$((violations+1))
fi

if [ "$violations" -gt 0 ]; then
    exit 1
fi
echo "OK: fronteiras respeitadas."
```

Alternativa mais robusta: `github.com/fe3dback/go-arch-lint` — define contratos em YAML parecido com `import-linter`.

---

## Rust — `pub(crate)` + árvore de módulos

Rust resolve quase sozinho por padrão:
```
src/
├── main.rs
├── modules/
│   ├── mod.rs              # pub mod briefing; pub mod persona_gen;
│   ├── briefing/
│   │   ├── mod.rs          # pub fn entry_point() { ... }
│   │   └── internal.rs     # pub(crate) — não exportado além do módulo
│   └── persona_gen/...
└── shared/
    └── mod.rs
```

Chave: expor **apenas o entry point** de cada módulo (`pub`) e manter o resto `pub(crate)` ou privado. Se outro módulo tentar importar internals, o compilador já recusa.

Para a regra "módulo não importa módulo", use `clippy` com lint custom ou um script CI que rode `cargo tree` e valide o grafo.

---

## Java — ArchUnit

```java
@AnalyzeClasses(packages = "com.myproject")
class ArchTest {
    @ArchTest
    static final ArchRule modulesIndependent =
        slices().matching("com.myproject.modules.(*)..")
            .should().notDependOnEachOther();

    @ArchTest
    static final ArchRule sharedBelowModules =
        noClasses().that().resideInAPackage("..shared..")
            .should().dependOnClassesThat().resideInAPackage("..modules..");
}
```

Rodar no CI como parte dos testes.

---

## Política de escape hatch

**Padrão: não permitir bypass do linter.** Adicionar `# noqa`, `eslint-disable`, `@SuppressWarnings` em violação de fronteira é sinal de que:
(a) a fronteira está errada e deve ser revisada, ou
(b) o caso é uma orquestração que deveria virar evento/contrato.

Se usar bypass for inevitável em algum ponto, tratar como *tech debt* rastreado — nunca como solução normal.

---

## Integração no workflow de desenvolvimento

1. **Pre-commit hook:** rodar o check de fronteiras localmente antes do commit.
2. **CI bloqueante:** PR não passa sem o check verde.
3. **Failure message útil:** quando o linter reclamar, a mensagem deve citar esta doc ou o princípio — agente e humano precisam saber *por que* a regra existe.

Exemplo de mensagem custom em `.importlinter`:
```
Violação: modules/checkout importou de modules/billing.
Solução: (a) duplicar o código, (b) mover para shared/ se 3+ usam, (c) usar evento em shared/contracts/.
Ver: .claude/skills/feature-first/references/principles.md#4-modulo-nunca-importa-modulo
```

---

## Como evoluir as regras

Mudança de regra arquitetural = PR no config de linter. Não conversa em Slack, não combinado verbal. O linter é a documentação executável da arquitetura.
