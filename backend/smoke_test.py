"""End-to-end smoke test against a running API on localhost:8000."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000"


def call(method: str, path: str, body=None, token: str | None = None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode())


def main() -> None:
    health = call("GET", "/api/health")
    assert health["data"]["status"] == "ok", health

    login = call(
        "POST", "/api/v1/auth/login",
        {"email": "admin@sunpower.in", "password": "demo2026"},
    )
    token = login["access_token"]
    assert login["token"] == token, login
    assert login["role"] == "ADMIN", login
    assert login["user"]["role"] == "ADMIN", login

    for path in (
        "/api/leads", "/api/surveys", "/api/quotations", "/api/inventory",
        "/api/orders", "/api/warehouse/serials", "/api/installations",
        "/api/tickets", "/api/employees", "/api/analytics", "/api/public/site",
    ):
        result = call("GET", path, token=token)
        assert result.get("success") is True, (path, result)

    leads = call("GET", "/api/leads", token=token)["data"]
    assert leads and "grid_suitable" in leads[0] and "follow_up_notes" in leads[0], leads[0]

    inventory = call("GET", "/api/inventory", token=token)["data"]
    assert inventory and "selling_price_inr" in inventory[0] and "unit_cost_inr" in inventory[0], inventory[0]

    orders = call("GET", "/api/orders", token=token)["data"]
    assert orders and "total_amount_inr" in orders[0] and "balance_due_inr" in orders[0], orders[0]

    installations = call("GET", "/api/installations", token=token)["data"]
    assert installations and "system_tested_ok" in installations[0] and "technician" in installations[0], installations[0]

    tickets = call("GET", "/api/tickets", token=token)["data"]
    assert tickets and "issue_description" in tickets[0] and "serial_number" in tickets[0], tickets[0]

    jobs = call("GET", "/api/employees/1/jobs", token=token)["data"]
    assert {"surveys_count", "installations_count", "surveys", "installations"} <= set(jobs), jobs

    analytics = call("GET", "/api/analytics", token=token)["data"]
    for key in (
        "total_revenue_inr", "total_expenses_inr", "net_profit_inr",
        "pending_payments_inr", "inventory_valuation_inr", "low_stock_items_count",
        "subsidy_tracking", "tickets_summary", "projects_pnl",
    ):
        assert key in analytics, (key, analytics)
    assert analytics["projects_pnl"], analytics
    assert {"NOT_APPLIED", "APPLIED", "INSPECTED", "DISBURSED"} <= set(
        analytics["subsidy_tracking"]
    ), analytics["subsidy_tracking"]

    public_site = call("GET", "/api/public/site")["data"]
    for key in ("settings", "packages", "products", "testimonials", "faqs"):
        assert key in public_site, (key, public_site)
    assert public_site["packages"] and public_site["products"], public_site
    assert public_site["testimonials"] and public_site["faqs"], public_site
    settings = public_site["settings"]
    for key in (
        "hero", "company", "calculator", "subsidy", "stats", "about",
        "architectures", "sections",
    ):
        assert key in settings, (key, settings)
    assert settings["calculator"]["subsidy_tiers"], settings["calculator"]
    assert settings["architectures"] and settings["about"]["cards"], settings

    bom = call("GET", "/api/bom/calculate?capacity_kw=5&system_type=OFF_GRID", token=token)
    assert bom["data"]["items"], bom
    assert "cost_subtotal_inr" in bom["data"]["items"][0], bom["data"]["items"][0]

    otp = call("POST", "/api/v1/auth/request-otp", {"phone": "+91 99999 00000"})
    assert "otp" in otp, otp
    verified = call(
        "POST", "/api/v1/auth/verify-otp",
        {"phone": "+91 99999 00000", "otp": otp["otp"]},
    )
    assert verified["access_token"]
    assert verified["token"] == verified["access_token"]

    print("SMOKE TEST PASSED")


if __name__ == "__main__":
    main()
