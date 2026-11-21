import React from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Headphones, 
  Crown,
  Sparkles
} from 'lucide-react';

export const ROLES = [
  { id: 'CUSTOMER', label: 'Public / Customer', icon: UserCheck, desc: 'View website, approve quotes, warranty cards, raise tickets', color: 'from-sky-500 to-blue-600' },
  { id: 'SALES', label: 'Sales & Survey', icon: ShieldCheck, desc: 'Capture leads, schedule surveys, generate & send quotes', color: 'from-amber-500 to-orange-600' },
  { id: 'WAREHOUSE', label: 'Warehouse Dispatch', icon: Truck, desc: 'Stock control, packing checklist, scan QR/serials, dispatch', color: 'from-emerald-500 to-teal-600' },
  { id: 'TECHNICIAN', label: 'Field Technician', icon: Wrench, desc: 'Roof survey approval, install timer, test power, canvas signature', color: 'from-indigo-500 to-violet-600' },
  { id: 'SUPPORT', label: 'Support / Helpdesk', icon: Headphones, desc: 'Zero-click warranty lookup, fault code triage, auto-invoicing', color: 'from-rose-500 to-pink-600' },
  { id: 'ADMIN', label: 'Director / Admin', icon: Crown, desc: 'Dynamic project-wise P&L, BI analytics, subsidy & crew management', color: 'from-amber-400 to-yellow-500' },
];

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const activeRoleObj = ROLES.find(r => r.id === currentRole) || ROLES[5];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-amber-400 font-extrabold text-lg tracking-wider">SP</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                SunPower ERP
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Standalone Pro
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Active Role: <span className="font-semibold text-slate-200">{activeRoleObj.label}</span>
              <span className="hidden sm:inline text-slate-500"> — {activeRoleObj.desc}</span>
            </p>
          </div>
        </div>

        {/* 1-Click Role Switcher Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 whitespace-nowrap">
            Switch Persona:
          </span>
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r text-white shadow-md shadow-amber-500/10 font-semibold border border-white/20 ' + role.color
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
                title={role.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {role.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
