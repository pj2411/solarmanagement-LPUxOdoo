import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award,
  FileText
} from 'lucide-react';

export default function WarrantyView({ serialUnits }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredUnits = serialUnits.filter(u => {
    const isExpired = u.warranty_expiry_date ? u.warranty_expiry_date < todayStr : false;
    const isActive = u.warranty_expiry_date ? u.warranty_expiry_date >= todayStr : false;

    const matchesSearch = u.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.lead?.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ACTIVE') return matchesSearch && isActive;
    if (statusFilter === 'EXPIRED') return matchesSearch && isExpired;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Master Solar Warranty Registry
        </h2>
        <p className="text-xs text-slate-400">
          Tracks 20-Year linear output warranty on Tier-1 PV modules and 2-Year comprehensive warranty on smart inverters and battery storage banks.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by serial number (e.g. INV-2025-0518) or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Warranty Records</option>
            <option value="ACTIVE">Active In-Warranty</option>
            <option value="EXPIRED">Expired Warranties</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Hardware serial #</th>
              <th className="p-3">Component type</th>
              <th className="p-3">Homeowner / Client</th>
              <th className="p-3">Warranty term</th>
              <th className="p-3">Commissioned date</th>
              <th className="p-3">Expiry date</th>
              <th className="p-3">Warranty status</th>
              <th className="p-3 text-right">Certificate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredUnits.map((u) => {
              const isExpired = u.warranty_expiry_date ? u.warranty_expiry_date < todayStr : false;
              const hasDates = !!u.warranty_expiry_date;

              return (
                <tr key={u.serial_number} className="hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-amber-400">{u.serial_number}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {u.component_type}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-white">{u.lead?.customer_name || 'Customer'}</td>
                  <td className="p-3 text-slate-300"><span className="font-mono">{u.warranty_years}</span> years</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {u.warranty_start_date || 'Pending Dispatch'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">
                    {u.warranty_expiry_date || 'Pending Delivery'}
                  </td>
                  <td className="p-3">
                    {hasDates ? (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                        !isExpired
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {!isExpired ? 'Active' : 'Expired'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Uncommissioned</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUnit(u)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] border border-slate-700 inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <Award className="w-3 h-3" /> View Certificate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warranty Certificate Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="text-center space-y-1 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Solar Hardware Warranty Certificate</h3>
              <p className="text-xs text-slate-400">SunPower Solutions Turnkey Quality Guarantee</p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Serial Identification:</span>
                <span className="font-mono font-bold text-amber-400">{selectedUnit.serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Component Classification:</span>
                <span className="font-semibold text-white">{selectedUnit.component_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Beneficiary:</span>
                <span className="text-white">{selectedUnit.lead?.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Installation Address:</span>
                <span className="text-slate-300 truncate max-w-[220px]">{selectedUnit.lead?.address}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Warranty Coverage Term:</span>
                <span className="text-emerald-400 font-bold"><span className="font-mono">{selectedUnit.warranty_years}</span> Full Calendar Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commencement Date:</span>
                <span className="font-mono text-slate-200">{selectedUnit.warranty_start_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guaranteed Expiry Date:</span>
                <span className="font-mono text-slate-200">{selectedUnit.warranty_expiry_date || 'N/A'}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 space-y-1">
              <p>• Panels cover 80% degradation limit over 20 years under IEC standard 61215/61730.</p>
              <p>• Inverters and batteries include full replacement coverage for manufacturing and grid-surge defects.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
