# Judge demo: "Where is your database?" -> one command, full proof.
# Run: powershell -ExecutionPolicy Bypass -File show_db.ps1

Write-Host "============================================================"
Write-Host "  SIMS DATABASE - LIVE PROOF"
Write-Host "============================================================"
Write-Host ""
Write-Host "1) WHERE IT RUNS: PostgreSQL 16 in Docker"
Write-Host "   Container: sims_postgres_db   Database: sims_db"
Write-Host "   Host port 5433 -> container port 5432"
Write-Host ""
docker ps --format "   {{.Names}} | {{.Status}} | {{.Ports}}"
Write-Host ""

Write-Host "2) CONNECTION (as seen by the app, secret hidden)"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "select current_database() as db, current_user as usr, inet_server_addr() as host, inet_server_port() as port, version();"
Write-Host ""

Write-Host "3) TABLES (21 tables = all 13 modules)"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "\dt"
Write-Host ""

Write-Host "4) SEEDED / LIVE DATA"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "select 'users' as table_name, count(*) from users union all select 'customers', count(*) from customers union all select 'leads', count(*) from leads union all select 'site_surveys', count(*) from site_surveys union all select 'quotations', count(*) from quotations union all select 'orders', count(*) from orders union all select 'service_tickets', count(*) from service_tickets union all select 'warranty_records', count(*) from warranty_records order by table_name;"
Write-Host ""

Write-Host "5) ALEMBIC MIGRATION APPLIED (schema version)"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "select * from alembic_version;"
Write-Host ""

Write-Host "6) NEW BILLING COLUMNS (proof our PS-rule migration ran)"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "select column_name, data_type from information_schema.columns where table_name='service_tickets' and column_name in ('in_warranty','parts_cost','labour_cost','billable_amount','customer_confirmed','closed_at') order by column_name;"
Write-Host ""

Write-Host "7) REAL TICKET WITH AUTO-BILL (INR 1000 parts + 2 hrs = INR 3500)"
docker exec sims_postgres_db psql -U postgres -d sims_db -c "select ticket_number, description, in_warranty, parts_cost, labour_cost, billable_amount, status from service_tickets order by reported_at desc limit 5;"
Write-Host ""

Write-Host "8) SAME DATA VIA OUR API (no phpMyAdmin needed)"
Write-Host "   Swagger: http://localhost:8000/docs"
Write-Host "   Analytics: GET http://localhost:8000/api/v1/analytics/dashboard"
Write-Host "============================================================"
