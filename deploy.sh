
#!/bin/bash
# Script de deploy manual para facilitar o push com o token
git add .
git commit -m "update: $(date +"%d/%m/%Y %H:%M")"

# Tenta carregar o token do .env se existir
if [ -f .env ]; then
  export $(grep GITHUB_TOKEN .env | xargs)
fi

if [ -n "$GITHUB_TOKEN" ]; then
  echo "🚀 Enviando para o GitHub usando GITHUB_TOKEN..."
  # Nota: Substitua 'username/repo' pela sua URL real se necessário
  # git push https://x-access-token:${GITHUB_TOKEN}@github.com/username/repo.git main
  git push origin main
else
  echo "⚠️ GITHUB_TOKEN não encontrado. Tentando push normal..."
  git push origin main
fi

echo "✅ Deploy enviado! Aguarde o processamento no GitHub Actions / Vercel."
