# Migração Cloudinary -> Cloudflare R2

Migra as fotos e os vídeos da conta Cloudinary `djtuzexfd` para o bucket R2.
Depois troca as URLs nos documentos do Firestore.

## Pré-requisitos

1. Crie um `.env` **fora do repositório** com estas variáveis:
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` e
   `GOOGLE_APPLICATION_CREDENTIALS` (caminho do JSON da service account do projeto `studio-6696860128-c7a6f`).
2. Aponte para ele com `MIGRATION_ENV` em todo comando. O script nunca imprime esses valores.
3. Os arquivos gerados ficam em `scripts/migrate-cloudinary-to-r2/out/`. A pasta está no gitignore.

No PowerShell use `$env:MIGRATION_ENV="C:\caminho\migracao.env"`. No bash use `export MIGRATION_ENV=...`.

## Ordem de execução

```bash
# 1. Inventário: só lê. Mostra URLs únicas por coleção/campo, public_ids únicos e campos inesperados (!).
npx tsx scripts/migrate-cloudinary-to-r2/migrate.ts --inventory

# 2. Backup: grava out/backup-<timestamp>.json com {colecao, docPath, docId, campo, valorAntigo}.
npx tsx scripts/migrate-cloudinary-to-r2/migrate.ts --backup

# 3. Upload: baixa os originais, gera WebP 320/480/640/828/1080/1600 + orig e envia ao R2.
#    Vídeos são copiados como estão para vid/<id>.<ext>. Gera out/mapping.json e out/upload-report-*.json.
#    É idempotente: pode rodar de novo, porque pula o que já está no R2.
npx tsx scripts/migrate-cloudinary-to-r2/migrate.ts --upload

# 4. Rewrite em dry-run (padrão): mostra o diff e não grava nada.
npx tsx scripts/migrate-cloudinary-to-r2/migrate.ts --rewrite

# 5. Rewrite de verdade. No fim roda o inventário e precisa mostrar 0 URLs Cloudinary restantes.
npx tsx scripts/migrate-cloudinary-to-r2/migrate.ts --rewrite --apply
```

Testes das funções puras:

```bash
npx tsx --test scripts/migrate-cloudinary-to-r2/lib.test.ts
```

## Regras

- **Chave no R2:** `img/<slug-do-public_id>-<hash8>/<largura>.webp` e `.../orig.webp`.
  Todos os objetos usam `Cache-Control: public, max-age=31536000, immutable`.
- **Imagem pequena não é ampliada** (equivale ao `c_limit`). Então todas as larguras sempre existem.
  A rotação EXIF é aplicada e os metadados são removidos.
- **Dedupe pelo public_id.** Transformação e versão (`v123`) são ignoradas.
  Uma transformação salva na URL (crop, efeito) é descartada. O inventário lista essas URLs para conferência.
- **Valor gravado no Firestore:** imagem vira `<R2_PUBLIC_URL>/img/<id>/1080.webp`. Vídeo vira `<R2_PUBLIC_URL>/vid/<id>.<ext>`.
  A forma do campo é preservada: string continua string, e em `{url, originalUrl}` as duas chaves passam a apontar para a mesma URL nova.
  URLs dentro de textos e HTML também são trocadas. O que não está no `mapping.json` não é alterado.
- **Gravação segura:** o `--apply` grava em lotes de 400 documentos com precondição `lastUpdateTime`.
  Se um documento foi editado durante a execução, o lote inteiro falha e nada dele é gravado.
  Nesse caso, rode `--rewrite --apply` de novo.
- **O que não é migrado:** URLs de outra conta, `fetch`, `private` e `raw`.
  O inventário mostra essas URLs, e elas continuam como estão.
