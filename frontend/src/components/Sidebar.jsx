import React from 'react';
import {
  Globe,
  KeyRound,
  Users,
  Compass,
  FileSpreadsheet,
  ReceiptText,
  Package,
  QrCode,
  HardHat,
  ShieldCheck,
  Headphones,
  UserCheck,
  BarChart3,
  AlertCircle
} from 'lucide-react';

export const MODULES = [
  { id: 'public-website', label: '1. Public Website', icon: Globe, badge: 'Calculator' },
  { id: 'auth', label: '2. Authentication & Roles', icon: KeyRound },
  { id: 'customers', label: '3. Customer Management', icon: Users, badge: 'CRM' },
  { id: 'site-survey', label: '4. Site Surveys', icon: Compass, gatekeeper: true },
  { id: 'quotations', label: '5. Quotations', icon: FileSpreadsheet },
  { id: 'orders', label: '6. Orders & Payments', icon: ReceiptText },
  { id: 'inventory', label: '7. Inventory & BoM', icon: Package },
  { id: 'dispatch', label: '8. Dispatch & Serials', icon: QrCode },
  { id: 'installations', label: '9. Field Installations', icon: HardHat },
  { id: 'warranty', label: '10. Warranty Registry', icon: ShieldCheck },
  { id: 'helpdesk', label: '11. Service Helpdesk', icon: Headphones, badge: 'Zero-Click' },
  { id: 'employees', label: '12. Crew & Attendance', icon: UserCheck },
  { id: 'analytics', label: '13. Admin & Dynamic P&L', icon: BarChart3, badge: 'Live P&L' },
];

export default function Sidebar({ currentModule, onModuleSelect, currentRole, stats }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-65px)]">
      {/* Search or Quick Filter */}
      <div className="p-3 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
          13 Standalone Modules
        </div>
      </div>

      {/* Module Navigation List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentModule === mod.id;

          // Contextual notifications
          let badgeText = mod.badge;
          let badgeColor = 'bg-slate-800 text-slate-300';

          if (mod.id === 'inventory' && stats?.low_stock_items_count > 0) {
            badgeText = `${stats.low_stock_items_count} Low`;
            badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
          }
          if (mod.id === 'helpdesk' && stats?.tickets_summary?.open > 0) {
            badgeText = `${stats.tickets_summary.open} Open`;
            badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
          }

          return (
            <button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{mod.label}</span>
              </div>
              {badgeText && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${badgeColor}`}>
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SQLite Relational Engine Active</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          40 Projects/Mo | 15 Technicians
        </p>
      </div>
    </aside>
  );
}
