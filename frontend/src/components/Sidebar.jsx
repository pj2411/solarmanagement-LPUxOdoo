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
  X
} from 'lucide-react';

export const MODULE_SECTIONS = [
  {
    title: 'Sales & Customers',
    modules: [
      { id: 'public-website', label: 'Public Website', icon: Globe, badge: 'Portal' },
      { id: 'customers', label: 'Customer Management', icon: Users, badge: 'CRM' },
      { id: 'site-survey', label: 'Site Surveys', icon: Compass, gatekeeper: true },
      { id: 'quotations', label: 'Quotations & Pricing', icon: FileSpreadsheet },
    ]
  },
  {
    title: 'Operations & Supply',
    modules: [
      { id: 'orders', label: 'Orders & Payments', icon: ReceiptText },
      { id: 'inventory', label: 'Inventory & BoM', icon: Package },
      { id: 'dispatch', label: 'Dispatch & Serials', icon: QrCode },
      { id: 'installations', label: 'Field Installations', icon: HardHat },
    ]
  },
  {
    title: 'Post-Install & Care',
    modules: [
      { id: 'warranty', label: 'Warranty Registry', icon: ShieldCheck },
      { id: 'helpdesk', label: 'Service Helpdesk', icon: Headphones, badge: 'Zero-Click' },
      { id: 'employees', label: 'Crew & Attendance', icon: UserCheck },
    ]
  },
  {
    title: 'Governance & P&L',
    modules: [
      { id: 'analytics', label: 'Admin & Dynamic P&L', icon: BarChart3, badge: 'Live P&L' },
      { id: 'auth', label: 'Roles & Access Control', icon: KeyRound },
    ]
  }
];

export const MODULES = MODULE_SECTIONS.flatMap(s => s.modules);

export const ROLE_CONFIG = {
  ADMIN: {
    portalTitle: 'Full Enterprise ERP',
    badge: '13 Modules',
    roleLabel: 'Director / Admin',
    allowedModules: [
      'analytics',
      'customers',
      'site-survey',
      'quotations',
      'orders',
      'inventory',
      'dispatch',
      'installations',
      'warranty',
      'helpdesk',
      'employees',
      'auth',
      'public-website'
    ],
    defaultModule: 'analytics'
  },
  SALES: {
    portalTitle: 'Sales & Customer Portal',
    badge: 'Sales Scope',
    roleLabel: 'Sales & Survey Lead',
    allowedModules: [
      'customers',
      'site-survey',
      'quotations',
      'orders',
      'public-website'
    ],
    defaultModule: 'customers'
  },
  SUPPORT: {
    portalTitle: 'Customer Support Portal',
    badge: 'Support Scope',
    roleLabel: 'Support / Helpdesk Lead',
    allowedModules: [
      'helpdesk',
      'warranty',
      'customers',
      'public-website'
    ],
    defaultModule: 'helpdesk'
  },
  TECHNICIAN: {
    portalTitle: 'Field Technician Portal',
    badge: 'Field Ops',
    roleLabel: 'Certified Field Technician',
    allowedModules: [
      'installations',
      'site-survey',
      'employees',
      'dispatch',
      'helpdesk'
    ],
    defaultModule: 'installations'
  },
  WAREHOUSE: {
    portalTitle: 'Warehouse & Supply Portal',
    badge: 'Supply Chain',
    roleLabel: 'Warehouse & Dispatch Officer',
    allowedModules: [
      'inventory',
      'dispatch',
      'orders',
      'warranty'
    ],
    defaultModule: 'inventory'
  },
  CUSTOMER: {
    portalTitle: 'Homeowner Solar Portal',
    badge: 'Consumer Portal',
    roleLabel: 'Solar Beneficiary / Customer',
    allowedModules: [
      'public-website',
      'quotations',
      'warranty',
      'helpdesk'
    ],
    defaultModule: 'public-website'
  }
};

export default function Sidebar({ 
  currentModule, 
  onModuleSelect, 
  currentRole = 'ADMIN', 
  currentUser,
  onRoleChange,
  onLogout,
  stats,
  isOpen = true,
  isCompact = false,
  onToggle,
  onClose
}) {
  const roleCfg = ROLE_CONFIG[currentRole] || ROLE_CONFIG.ADMIN;
  const allowedIds = roleCfg.allowedModules;

  // Filter sections and modules based on role
  const filteredSections = MODULE_SECTIONS.map((section) => ({
    ...section,
    modules: section.modules.filter((mod) => allowedIds.includes(mod.id))
  })).filter((section) => section.modules.length > 0);

  const filteredModules = filteredSections.flatMap((s) => s.modules);
  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none transition-all duration-300 ease-in-out z-50 flex-shrink-0 overflow-hidden
        ${isOpen 
          ? (isCompact ? 'w-16' : 'w-72') 
          : 'w-0 opacity-0 border-r-0 pointer-events-none'
        }
        max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-2xl
        ${!isOpen ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0'}
      `}
    >
      {/* Brand Header with Prominently Sized Hamburger Menu & Logo */}
      <div className={`h-16 border-b border-slate-800 flex items-center flex-shrink-0 ${isCompact ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-sm cursor-pointer"
            title={isCompact ? "Expand menu" : "Collapse menu"}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-amber-500" />
          </button>

          {!isCompact && (
            <button
              type="button"
              onClick={() => {
                if (onModuleSelect) onModuleSelect('public-website');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-all focus:outline-none text-left"
              title="Go to ERP Home (Public Website)"
              aria-label="Go to ERP Home"
            >
              <Sun className="w-6 h-6 text-amber-400 fill-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="min-w-0">
                <div className="text-base font-extrabold tracking-tight text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                  SunPower Solutions
                </div>
                <div className="text-[11px] font-semibold text-slate-400 truncate">
                  Solar Enterprise ERP
                </div>
              </div>
            </button>
          )}
        </div>

        {!isCompact && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Scope Header */}
      {!isCompact && (
        <div className="px-4 py-2.5 flex-shrink-0 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
          <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
            {roleCfg.portalTitle}
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-bold bg-white text-slate-950 shadow-sm whitespace-nowrap">
            {roleCfg.badge}
          </span>
        </div>
      )}

      {/* Nav List - Dynamically Filtered to Authorized Role Scope */}
      <nav className={`flex-1 py-2 overflow-y-auto space-y-3 ${isCompact ? 'px-1.5 space-y-1.5 items-center' : 'px-3'}`}>
        {isCompact ? (
          // Compact Rail View: Centered Icons with Hover Tooltips
          filteredModules.map((mod) => {
            const Icon = mod.icon;
            const isActive = currentModule === mod.id;

            let badgeText = mod.badge;
            let badgeColor = 'bg-slate-800 text-slate-200';
            if (mod.id === 'inventory' && stats?.low_stock_items_count > 0) {
              badgeText = `${stats.low_stock_items_count} Low`;
              badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
            }
            if (mod.id === 'helpdesk' && stats?.tickets_summary?.open > 0) {
              badgeText = `${stats.tickets_summary.open} Open`;
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            }

            return (
              <div key={mod.id} className="relative group flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => onModuleSelect(mod.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                  }`}
                  aria-label={mod.label}
                  title={mod.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </button>

                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 flex items-center gap-2">
                  <span>{mod.label}</span>
                  {badgeText && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                      {badgeText}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          // Expanded View: Structured Business Workflow Groups for Active Role
          filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider px-2 pt-2 pb-0.5 select-none">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.modules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = currentModule === mod.id;

                  let badgeText = mod.badge;
                  let badgeColor = 'bg-slate-800 text-slate-300 border border-slate-700';

                  if (mod.id === 'inventory' && stats?.low_stock_items_count > 0) {
                    badgeText = `${stats.low_stock_items_count} Low`;
                    badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                  }
                  if (mod.id === 'helpdesk' && stats?.tickets_summary?.open > 0) {
                    badgeText = `${stats.tickets_summary.open} Open`;
                    badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
                  }

                  return (
                    <button
                      key={mod.id}
                      onClick={() => onModuleSelect(mod.id)}
                      className={`sidebar-nav-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all group ${
                        isActive
                          ? 'active bg-amber-500/20 text-white font-bold border border-amber-500/50 shadow-sm'
                          : 'text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'
                        }`} />
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
                            className="p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {badgeText && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${badgeColor}`}>
                            {badgeText}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* User Profile & Persona Switcher at Bottom */}
      <div className={`border-t border-slate-800 bg-slate-950/90 flex-shrink-0 ${isCompact ? 'p-2 flex items-center justify-center' : 'p-3'}`}>
        {isCompact ? (
          <div className="relative group flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold text-sm flex items-center justify-center border border-amber-500/30 cursor-pointer">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'V'}
            </div>
            <div className="absolute left-full ml-2 bottom-0 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
              <div>{currentUser?.name || 'Vikram Malhotra'}</div>
              <div className="text-xs text-amber-400 mt-0.5">{currentRole || 'ADMIN'}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-sm flex items-center justify-center border border-amber-500/40 flex-shrink-0">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'V'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {currentUser?.name || 'Vikram Malhotra'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-slate-400 font-medium truncate">
                    {roleCfg.roleLabel || currentRole || 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                type="button"
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors flex-shrink-0"
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
