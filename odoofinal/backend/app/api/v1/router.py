from fastapi import APIRouter
from app.api.v1 import (
    analytics,
    auth,
    customers,
    dispatch,
    employees,
    installations,
    inventory,
    maintenance,
    orders,
    payments,
    public_calculator,
    quotations,
    surveys,
    warranties,
)

api_v1_router = APIRouter()

# 01. Public Website & Calculator
api_v1_router.include_router(public_calculator.router)

# 02. Authentication & RBAC
api_v1_router.include_router(auth.router)

# 03. Customer Management & CRM
api_v1_router.include_router(customers.router)

# 04. Site Survey Management
api_v1_router.include_router(surveys.router)

# 05. Quotation & Dynamic BOM
api_v1_router.include_router(quotations.router)

# 06. Order & Milestone Payment Management
api_v1_router.include_router(orders.router)
api_v1_router.include_router(payments.router)

# 07. Inventory & Warehouse Management
api_v1_router.include_router(inventory.router)

# 08. Dispatch & Serial Tracking
api_v1_router.include_router(dispatch.router)

# 09. Installation & Commissioning
api_v1_router.include_router(installations.router)

# 10. Warranty Management
api_v1_router.include_router(warranties.router)

# 11. Service & Maintenance (O&M)
api_v1_router.include_router(maintenance.router)

# 12. Employee & Field Crew Management
api_v1_router.include_router(employees.router)

# 13. Admin & Financial Analytics
api_v1_router.include_router(analytics.router)
