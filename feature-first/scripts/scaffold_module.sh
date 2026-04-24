#!/usr/bin/env bash
#
# scaffold_module.sh — cria um módulo novo seguindo Feature-First Architecture.
#
# Uso:
#   ./scripts/scaffold_module.sh <module_name> [--stack python|typescript|go]
#
# Exemplo:
#   ./scripts/scaffold_module.sh publish_meta_ads --stack python
#
# Requisitos:
#   - Rodar na raiz do projeto (onde existe modules/).
#   - O template base vem da skill feature-first (assets/module-template/).

set -euo pipefail

MODULE_NAME="${1:-}"
STACK="python"

if [[ -z "$MODULE_NAME" ]]; then
    echo "Erro: nome do módulo é obrigatório."
    echo "Uso: $0 <module_name> [--stack python|typescript|go]"
    exit 1
fi

# parse flags
shift || true
while [[ $# -gt 0 ]]; do
    case "$1" in
        --stack)
            STACK="${2:-}"
            shift 2
            ;;
        *)
            echo "Flag desconhecida: $1"
            exit 1
            ;;
    esac
done

# validar nome (snake_case)
if [[ ! "$MODULE_NAME" =~ ^[a-z][a-z0-9_]*$ ]]; then
    echo "Erro: nome do módulo deve ser snake_case (ex: publish_meta_ads)."
    exit 1
fi

MODULE_DIR="modules/${MODULE_NAME}"

if [[ -d "$MODULE_DIR" ]]; then
    echo "Erro: $MODULE_DIR já existe."
    exit 1
fi

echo "Criando módulo em $MODULE_DIR (stack: $STACK)..."

mkdir -p "$MODULE_DIR"/{tests,fixtures,migrations}

# MODULE.md — sempre
cat > "$MODULE_DIR/MODULE.md" <<EOF
# ${MODULE_NAME}

## Propósito
<!-- 1-2 linhas. O que este módulo faz? -->
TODO.

## Entry points
<!-- Handlers, endpoints, jobs expostos por este módulo -->
- TODO.

## Dependências de \`shared/\`
<!-- O que este módulo importa de shared/ -->
- TODO.

## Tabelas / coleções próprias
<!-- Tabelas possuídas por este módulo (migrations vivem aqui) -->
- TODO.

## Contratos publicados
<!-- Eventos emitidos em shared/contracts/ -->
- (nenhum)

## Contratos consumidos
<!-- Eventos observados -->
- (nenhum)

## Não-objetivos
<!-- O que parece mas não é responsabilidade deste módulo -->
- TODO.
EOF

# Arquivos de código conforme stack
case "$STACK" in
    python)
        touch "$MODULE_DIR/__init__.py" \
              "$MODULE_DIR/domain.py" \
              "$MODULE_DIR/handlers.py" \
              "$MODULE_DIR/tests/__init__.py" \
              "$MODULE_DIR/tests/test_domain.py"
        cat > "$MODULE_DIR/domain.py" <<'EOF'
"""Regra de negócio do módulo."""
EOF
        cat > "$MODULE_DIR/handlers.py" <<'EOF'
"""Entry points (HTTP, jobs, eventos)."""
EOF
        cat > "$MODULE_DIR/tests/test_domain.py" <<'EOF'
"""Unit tests — executar com: pytest modules/<nome>/tests/"""
EOF
        ;;
    typescript)
        touch "$MODULE_DIR/domain.ts" \
              "$MODULE_DIR/handlers.ts" \
              "$MODULE_DIR/index.ts" \
              "$MODULE_DIR/tests/domain.test.ts"
        cat > "$MODULE_DIR/index.ts" <<'EOF'
// Entry point público deste módulo — único arquivo importável externamente.
export {} ;
EOF
        ;;
    go)
        touch "$MODULE_DIR/domain.go" \
              "$MODULE_DIR/handlers.go" \
              "$MODULE_DIR/domain_test.go"
        ;;
    *)
        echo "Stack desconhecida: $STACK. Criando apenas MODULE.md."
        ;;
esac

touch "$MODULE_DIR/migrations/.gitkeep" \
      "$MODULE_DIR/fixtures/.gitkeep"

echo ""
echo "Módulo $MODULE_NAME criado."
echo ""
echo "Próximos passos:"
echo "  1. Editar $MODULE_DIR/MODULE.md — preencher propósito, entry points, deps."
echo "  2. Escrever testes primeiro (se o projeto usar TDD)."
echo "  3. Implementar."
echo "  4. Registrar o módulo no router/registry raiz (1 linha)."
echo "  5. Rodar o check de fronteiras — deve passar."
echo "  6. Commit."
