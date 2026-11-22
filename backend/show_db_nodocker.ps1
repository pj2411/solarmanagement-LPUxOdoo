# Fallback judge demo WITHOUT the docker CLI.
# Uses the local psql client against the Docker-published port 5433.
# Password is read from .env and never printed.

$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $envFile) {
  $env:PGPASSWORD = (Get-Content $envFile | Where-Object { $_ -match '^POSTGRES_PASSWORD=' } | ForEach-Object { ($_ -split '=', 2)[1].Trim('"') })
}

$psqlArgs = @('-w', '-h', '127.0.0.1', '-p', '5433', '-U', 'postgres', '-d', 'sims_db')

Write-Host "============================================================"
Write-Host "  SIMS DATABASE - LIVE PROOF (WITHOUT DOCKER CLI)"
Write-Host "  Host: 127.0.0.1:5433  DB: sims_db  Engine: PostgreSQL 16"
Write-Host "============================================================"
Write-Host ""
Write-Host "1) ENGINE VERSION"
& psql @psqlArgs -tAc "select version();"
Write-Host ""
Write-Host "2) TABLE COUNT"
& psql @psqlArgs -tAc "select count(*) from information_schema.tables where table_schema='public';"
Write-Host ""
Write-Host "3) TABLES"
& psql @psqlArgs -c "\dt"
Write-Host ""
Write-Host "4) LIVE ROW COUNTS"
& psql @psqlArgs -c "select 'users' as tbl,count(*) from users union all select 'leads',count(*) from leads union all select 'customers',count(*) from customers union all select 'service_tickets',count(*) from service_tickets union all select 'warranty_records',count(*) from warranty_records order by tbl;"
Write-Host ""
Write-Host "5) ALEMBIC MIGRATION"
& psql @psqlArgs -c "select * from alembic_version;"
Write-Host ""
Write-Host "6) AUTO-BILLED TICKET (INR 1000 parts + 2 hrs = INR 3500)"
& psql @psqlArgs -c "select ticket_number,in_warranty,parts_cost,labour_cost,billable_amount,status from service_tickets order by reported_at desc limit 3;"
Write-Host ""
Write-Host "============================================================"
