#!/bin/bash
# Security check script - Run before committing to ensure no sensitive data is included

echo "🔒 Checking for sensitive files that should not be committed..."
echo ""

SENSITIVE_FILES=(
  "src/main/resources/application-local.properties"
  "target/classes/application-local.properties"
  ".env"
  ".env.local"
)

FOUND_SENSITIVE=false

for file in "${SENSITIVE_FILES[@]}"; do
  if [ -f "$file" ]; then
    if git check-ignore -q "$file" 2>/dev/null || [ ! -d .git ]; then
      echo "✅ $file exists but is properly ignored"
    else
      echo "❌ WARNING: $file exists and is NOT ignored!"
      FOUND_SENSITIVE=true
    fi
  fi
done

echo ""
if [ "$FOUND_SENSITIVE" = true ]; then
  echo "⚠️  SECURITY WARNING: Sensitive files are not properly ignored!"
  echo "   Please check your .gitignore file before committing."
  exit 1
else
  echo "✅ All sensitive files are properly protected."
  echo "   Safe to commit!"
fi

