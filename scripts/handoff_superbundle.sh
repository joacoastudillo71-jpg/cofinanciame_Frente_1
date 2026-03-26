#!/bin/bash
# handoff_superbundle.sh
# Genera un snapshot completo del estado del proyecto

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BUNDLE_DIR=".superbundle"
BUNDLE_FILE="${BUNDLE_DIR}/SUPERBUNDLE_${TIMESTAMP}.md"

# Crear directorio si no existe
mkdir -p "$BUNDLE_DIR"

echo "📦 Generando Superbundle..."

# Generar contenido
{
    echo "# SUPERBUNDLE — Showcase Inmobiliario 3D"
    echo ""
    echo "**Generated**: ${TIMESTAMP}"
    echo "**Branch**: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "**Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    echo ""
    echo "---"
    echo ""
    echo "## Git Status"
    echo '```'
    git status --short 2>/dev/null || echo "No git info available"
    echo '```'
    echo ""
    echo "## Recent Commits"
    echo '```'
    git log --oneline -10 2>/dev/null || echo "No git info available"
    echo '```'
    echo ""
    echo "## Project Structure"
    echo '```'
    find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.md" 2>/dev/null | grep -v node_modules | grep -v dist | head -50
    echo '```'
    echo ""
    echo "## Package.json Scripts"
    echo '```json'
    cat package.json 2>/dev/null | grep -A 20 '"scripts"' | head -25
    echo '```'
} > "$BUNDLE_FILE"

echo "✅ Superbundle generado: $BUNDLE_FILE"

# Limpiar bundles viejos (mantener últimos 5)
ls -t "${BUNDLE_DIR}"/SUPERBUNDLE_*.md 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null

# Agregar al gitignore si no está
if ! grep -q ".superbundle" .gitignore 2>/dev/null; then
    echo ".superbundle" >> .gitignore
    echo "📝 Agregado .superbundle a .gitignore"
fi
