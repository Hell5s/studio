#!/bin/bash
git add .
git commit -m "update: $(date +"%d/%m/%Y %H:%M")"
git push origin main
echo "✅ Deploy enviado! Aguarde 1-2 min no Vercel."