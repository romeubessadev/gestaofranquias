# millennium-sync (Brazil worker)

Polls `sync_job` and talks to Millennium from a **Brazilian IP**.

👉 **Guia em português (passo a passo):** [COMO-RODAR.md](./COMO-RODAR.md)

## Quick start

```bash
cd workers/millennium-sync
cp .env.example .env   # fill SUPABASE_* + ERP_SECRET_KEY
npm install
npm start
```

## Environment

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Bypass RLS for upserts / claim |
| `MILLENNIUM_API_BASE` | yes | e.g. `http://host:6017/api` |
| `ERP_SECRET_KEY` | yes | Decrypt `erp_credential.password_ciphertext` |
| `POLL_INTERVAL_MS` | no | Default `45000` (45s) |

Also reads the repo-root `.env` (maps `VITE_SUPABASE_URL` → `SUPABASE_URL` if needed).

## Job kinds

| `sync_job.kind` | Window | Notes |
| --------------- | ------ | ----- |
| `BACKFILL` | today−90d → yesterday (store TZ) | Enqueued after onboarding |
| `LIGHT` | calendar today | Auto-enqueued when `light_interval_min` elapsed |
| `FORCE_LIGHT` | calendar today | Enqueued by OWNER/MANAGER force refresh |

Concurrency: **one `RUNNING` job per `credential_id`**. Login → sequential `VENDAS.Lista` → upsert → always `logout`.

## Related

- Schema: `supabase/migrations/20260922120000_erp_sync_sales.sql`
- Enqueue Edge: `supabase/functions/erp-sync-enqueue`
- Aggregation: `src/data/wedash/salesAggregate.ts`
