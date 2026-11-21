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
  Sun,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
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

export default function Sidebar({ 
  currentModule, 
  onModuleSelect, 
  currentRole, 
  currentUser,
  onRoleChange,
  onLogout,
  stats,
  isOpen = true,
  isCompact = false,
  onToggle,
  onToggleCompact,
  onClose
}) {
  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none transition-all duration-300 ease-in-out z-50 flex-shrink-0
        ${isOpen 
          ? (isCompact ? 'w-16' : 'w-64') 
          : 'w-0 overflow-hidden opacity-0 border-r-0 pointer-events-none'
        }
        max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-2xl
        ${!isOpen ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0'}
      `}
    >
      {/* Brand Header with Left-Corner Hamburger Menu */}
      <div className={`h-14 border-b border-slate-800 flex items-center justify-between flex-shrink-0 px-3.5 ${isCompact ? 'justify-center px-2' : ''}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors flex-shrink-0 focus:outline-none"
            title="Toggle menu (Hamburger)"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          {!isCompact && (
            <div className="flex items-center gap-2 min-w-0">
              <Sun className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <div className="text-sm font-bold tracking-tight text-white truncate leading-none">
                SunPower Solutions
              </div>
            </div>
          )}
        </div>

        {/* Right side controls in sidebar header */}
        {!isCompact && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleCompact && (
              <button
                type="button"
                onClick={onToggleCompact}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Collapse to compact icon rail"
                aria-label="Collapse to compact icon rail"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Close drawer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {isCompact && onToggleCompact && (
          <button
            type="button"
            onClick={onToggleCompact}
            className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand full sidebar"
            aria-label="Expand full sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Module Navigation List Header */}
      {!isCompact && (
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-0.5">
            13 Standalone Modules
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className={`flex-1 overflow-y-auto py-1 space-y-1 scrollbar-thin ${isCompact ? 'px-1.5 flex flex-col items-center' : 'px-2'}`}>
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

          if (isCompact) {
            return (
              <div key={mod.id} className="relative group flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => onModuleSelect(mod.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                  }`}
                  aria-label={mod.label}
                  title={mod.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-full ml-2.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 flex items-center gap-2">
                  <span>{mod.label}</span>
                  {badgeText && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeColor}`}>
                      {badgeText}
                    </span>
                  )}
                </div>
              </div>
            );
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
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {mod.id === 'public-website' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`${window.location.origin}${window.location.pathname}?view=public`, '_blank');
                    }}
                    title="Open standalone public website in new tab"
                    className="p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                {badgeText && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${badgeColor}`}>
                    {badgeText}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Persona Switcher at Bottom */}
      <div className={`border-t border-slate-800 bg-slate-950/80 flex-shrink-0 ${isCompact ? 'p-2 flex flex-col items-center gap-2' : 'p-3'}`}>
        {isCompact ? (
          <div className="relative group flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30 cursor-pointer">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'V'}
            </div>
            <div className="absolute left-full ml-2.5 bottom-0 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
              <div>{currentUser?.name || 'Vikram Malhotra'}</div>
              <div className="text-[10px] text-amber-400">{currentRole || 'ADMIN'}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'V'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Vikram Malhotra'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {onRoleChange ? (
                    <select
                      value={currentRole || 'ADMIN'}
                      onChange={(e) => onRoleChange(e.target.value)}
                      className="text-[9px] bg-slate-800 text-amber-400 font-semibold rounded px-1.5 py-0.5 border border-slate-700 cursor-pointer focus:outline-none focus:border-amber-500"
                      title="Switch Persona"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SALES">Sales</option>
                      <option value="WAREHOUSE">Warehouse</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="SUPPORT">Support</option>
                      <option value="CUSTOMER">Customer</option>
                    </select>
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                      {currentRole || 'ADMIN'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Sign out of ERP session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
