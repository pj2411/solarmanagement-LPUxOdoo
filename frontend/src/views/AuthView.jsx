import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { ROLES } from '../components/RoleSwitcher';

export default function AuthView({ currentRole, onRoleChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const permissions = [
    { module: '1. Public Website & Calculator', access: 'All Roles (Public)' },
    { module: '2. Customer Leads & CRM', access: 'Sales, Director' },
    { module: '3. Site Surveys & Roof Measure', access: 'Sales, Field Technician, Director' },
    { module: '4. Quotations & Pricing Engine', access: 'Sales, Director, Customer (View/Approve)' },
    { module: '5. Orders & Payments', access: 'Sales, Customer, Director' },
    { module: '6. Inventory & BoM Templates', access: 'Warehouse, Director' },
    { module: '7. Dispatch & Serial QR Scanning', access: 'Warehouse, Field Technician' },
    { module: '8. Field Installations & Canvas Sign', access: 'Field Technician, Director' },
    { module: '9. Warranty Registry', access: 'All Roles (Customer checks own warranty)' },
    { module: '10. Service Helpdesk & Triage', access: 'Support, Technician, Director' },
    { module: '11. Crew & Attendance', access: 'Director, HR' },
    { module: '12. Admin & Financial Analytics', access: 'Director / Admin Only' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-white">Authentication & Role-Based Access Control</h2>
        <p className="text-xs text-slate-400">
          Switch user personas instantly or review security privileges across ERP modules.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Role Persona Switcher Card */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Key className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">Instant Demo Persona Switcher</h3>
          </div>
          <p className="text-xs text-slate-300">
            No password required for evaluation. Click any role below to test all business logic from that perspective:
          </p>
          <div className="space-y-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isCur = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium border transition-all text-left ${
                    isCur
                      ? 'bg-amber-500/10 border-amber-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCur ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-white font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                  </div>
                  {isCur && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Active</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Traditional Login Form */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Direct JWT Sign In</h3>
          </div>
          <p className="text-xs text-slate-400">
            Simulate standard enterprise authentication with role claim.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); onRoleChange(selectedRole); alert(`Signed in as ${selectedRole}`); }} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-300">Email Address</label>
              <input
                type="email"
                value={email || `${selectedRole.toLowerCase()}@sunpower.in`}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-300">Password</label>
              <input
                type="password"
                value="••••••••••••"
                readOnly
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-300">Assign Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
            >
              Authenticate Role Session
            </button>
          </form>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white">RBAC Security Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Module Name</th>
                <th className="p-3">Permitted Roles & Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50">
                  <td className="p-3 font-medium text-slate-200">{p.module}</td>
                  <td className="p-3 text-amber-400 font-mono">{p.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
