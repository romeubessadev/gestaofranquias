# millennium-sync (Brazil worker)

Polls `sync_job` and talks to Millennium from a **Brazilian IP**. Supabase Edge abroad cannot replace this worker (ERP blocks non-BR addresses).

## Requirements

- Node 20+ (or Deno equivalent) on a VPS/host in Brazil
- Outbound HTTPS/HTTP to Millennium API
- Supabase service-role key (writes aggregates + job status)

## Environment

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Bypass RLS for upserts / claim |
| `MILLENNIUM_API_BASE` | yes | e.g. `http://host:6017/api` |
| `ERP_SECRET_KEY` | yes | Decrypt `erp_credential.password_ciphertext` |
| `POLL_INTERVAL_MS` | no | Default `45000` (45s) |

## Job kinds

| `sync_job.kind` | Window | Notes |
| --------------- | ------ | ----- |
| `BACKFILL` | today−90d → yesterday (store TZ) | Enqueued after onboarding |
| `LIGHT` | calendar today | Scheduled by `light_interval_min` (2 or 30) |
| `FORCE_LIGHT` | calendar today | Enqueued by OWNER/MANAGER force refresh |

Concurrency: **one `RUNNING` job per `credential_id`**. Login → sequential `VENDAS.Lista` per store → upsert `sales_day_agg` / `sales_hour_agg` → always `logout` in `finally`.

## Local loop (sketch)

```bash
# from repo root after implementing the poll entrypoint
cd workers/millennium-sync
npm test   # or: npm test -- workers/millennium-sync from root
```

Domain units live next to the sources (`millenniumSales.test.ts`, `runSyncJob.test.ts`). Fixture: `fixtures/vendas-lista.sample.json`.

## Related

- Schema: `supabase/migrations/20260922120000_erp_sync_sales.sql`
- Enqueue Edge: `supabase/functions/erp-sync-enqueue`
- Aggregation: `src/data/wedash/salesAggregate.ts`
