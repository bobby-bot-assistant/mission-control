#!/bin/bash
# Lint for hardcoded zinc/dark: theme classes that should use CSS variable theme system
# Run: bash scripts/lint-theme.sh

set -euo pipefail
cd "$(dirname "$0")/.."

ERRORS=0

echo "🔍 Checking for hardcoded dark: zinc classes..."
if grep -rn 'dark:bg-zinc\|dark:text-zinc\|dark:border-zinc\|dark:hover:bg-zinc\|dark:hover:text-zinc' \
  app/ components/ --include='*.tsx' --include='*.ts' | grep -v node_modules | grep -v 'prose-zinc'; then
  echo ""
  echo "❌ Found hardcoded dark:*-zinc-* classes. Use theme variables instead."
  echo "   See THEME_GUIDE.md for correct usage."
  ERRORS=1
fi

echo ""
echo "🔍 Checking for standalone zinc background/text/border classes..."
if grep -rn '\bbg-zinc-\|text-zinc-\|border-zinc-\|divide-zinc-\|ring-zinc-' \
  app/ components/ --include='*.tsx' --include='*.ts' | grep -v node_modules | grep -v 'prose-zinc'; then
  echo ""
  echo "⚠️  Found hardcoded zinc-* classes. Consider using theme variables."
  echo "   Exceptions: prose-zinc (typography plugin) is OK."
  ERRORS=1
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ No hardcoded zinc theme classes found. All clean!"
fi

exit $ERRORS
