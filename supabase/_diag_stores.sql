select millennium_store_id, code, name, trade_name, active
from public.store
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
order by millennium_store_id;
