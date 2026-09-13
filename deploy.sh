
#!/bin/bash
# Script de deploy para Toda Bela - Autenticação Automática

# 1. Adiciona e commita as mudanças localmente
git add .
git commit -m "update: $(date +"%d/%m/%Y %H:%M")"

# 2. Tenta carregar o token do arquivo .env
if [ -f .env ]; then
  # Extrai o valor do token ignorando espaços e aspas
  GITHUB_TOKEN=$(grep GITHUB_TOKEN .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

# 3. Verifica se o token existe e realiza o push seguro
if [ -n "$GITHUB_TOKEN" ]; then
  echo "🚀 Autenticando com Personal Access Token..."
  # Injeta o token diretamente na URL para evitar erro de senha
  git push https://x-access-token:${GITHUB_TOKEN}@github.com/Hell5s/studio.git main --force
  
  if [ $? -eq 0 ]; then
    echo "✅ Sincronização com GitHub concluída com sucesso!"
  else
    echo "❌ Erro ao enviar. Verifique se o token é válido e tem permissões de 'repo'."
  fi
else
  echo "⚠️ GITHUB_TOKEN não encontrado no arquivo .env"
  echo "Por favor, execute: ghp_seu_token conecte no github"
  exit 1
fi
