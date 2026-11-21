import React from 'react';
import {
  LayoutGrid,
  Layers,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  Tag,
  Warehouse,
  MapPin,
  Users,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Headphones,
  BarChart3,
  Globe
} from 'lucide-react';

export const NAVIGATION_GROUPS = [
  {
    title: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
      { id: 'inventory', label: 'Stock', icon: Layers },
      { id: 'dispatch', label: 'Move history', icon: Clock },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'orders', label: 'Receipts', icon: ArrowDownLeft },
      { id: 'delivery', label: 'Delivery', icon: ArrowUpRight },
      { id: 'installations', label: 'Transfers', icon: ArrowLeftRight },
      { id: 'adjustments', label: 'Adjustments', icon: Sliders },
    ]
  },
  {
    title: 'SETUP',
    items: [
      { id: 'quotations', label: 'Products', icon: Tag },
      { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
      { id: 'site-survey', label: 'Locations', icon: MapPin },
      { id: 'customers', label: 'Suppliers', icon: Users },
      { id: 'public-website', label: 'Customer Portal', icon: Globe },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'reorder-rules', label: 'Reorder rules', icon: AlertTriangle },
      { id: 'warranty', label: 'Warranty registry', icon: ShieldCheck },
      { id: 'helpdesk', label: 'Service helpdesk', icon: Headphones },
      { id: 'analytics', label: 'Executive P&L', icon: BarChart3 },
    ]
  }
];

export default function Sidebar({
  currentModule,
  onModuleSelect,
  currentUser,
  onLogout,
  onRoleChange,
  stats
}) {
  return (
    <aside className="w-60 flex-shrink-0 bg-[#FBFBFA] dark:bg-[#15171C] border-r border-[#E8E8E5] dark:border-[#272A34] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E8E8E5] dark:border-[#272A34] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#C53B3B] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
          s
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-[#18181B] dark:text-[#FAFAFA] lowercase truncate leading-none">
            stocksense
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] font-semibold mt-1 leading-none">
            WAREHOUSE CONTROL
          </div>
        </div>
      </div>

      {/* Direct Navigation List - Zero Hamburger Menus */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-semibold text-[#A1A1AA] dark:text-[#71717A] uppercase tracking-widest px-2.5 mb-1.5">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                let alertBadge = null;
                if (item.id === 'reorder-rules' && stats?.low_stock_items_count > 0) {
                  alertBadge = stats.low_stock_items_count;
                } else if (item.id === 'helpdesk' && stats?.tickets_summary?.open > 0) {
                  alertBadge = stats.tickets_summary.open;
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleSelect(item.id)}
                    type="button"
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#FDF2F2] dark:bg-[#2A1818] border border-[#F87171] dark:border-[#C53B3B] text-[#18181B] dark:text-[#FAFAFA] font-semibold shadow-xs'
                        : 'text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F4F4F2] dark:hover:bg-[#1C1E24] hover:text-[#18181B] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#C53B3B]' : 'text-[#71717A] dark:text-[#A1A1AA]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {alertBadge !== null && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FEE2E2] dark:bg-[#3D1E1E] text-[#C53B3B]">
                        {alertBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile & Quick Persona Switcher in Sidebar Footer */}
      <div className="p-3 border-t border-[#E8E8E5] dark:border-[#272A34] bg-white dark:bg-[#1C1E24]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#FEE2E2] dark:bg-[#3D1E1E] text-[#C53B3B] font-bold text-xs flex items-center justify-center flex-shrink-0">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#18181B] dark:text-[#FAFAFA] truncate">
                {currentUser?.name || 'StockSense Admin'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] uppercase font-semibold tracking-wider">
                  {currentUser?.role || 'ADMIN'}
                </span>
                {onRoleChange && (
                  <select
                    value={currentUser?.role || 'ADMIN'}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="text-[9px] bg-transparent text-[#C53B3B] font-semibold border-none cursor-pointer focus:outline-none"
                    title="Change Persona"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="SUPPORT">Support</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            type="button"
            className="p-1.5 rounded-lg text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C53B3B] hover:bg-[#FEE2E2]/50 dark:hover:bg-[#3D1E1E]/50 transition-colors"
            title="Sign out of StockSense"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
