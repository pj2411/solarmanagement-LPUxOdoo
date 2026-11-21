import React, { useState } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  TrendingUp, 
  Download, 
  PieChart as PieIcon, 
  Boxes, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell 
} from 'recharts';

export default function AnalyticsView({ analyticsData }) {
  if (!analyticsData) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
        Computing real-time relational analytics from SQLite...
      </div>
    );
  }

  const {
    total_revenue_inr = 0,
    total_expenses_inr = 0,
    net_profit_inr = 0,
    pending_payments_inr = 0,
    inventory_valuation_inr = 0,
    subsidy_tracking = {},
    projects_pnl = []
  } = analyticsData;

  const exportCSV = () => {
    const headers = "Order ID,Project Name,Customer,Capacity (kW),System Type,Revenue (INR),BoM Cost (INR),Labor Hours,Labor Rate,Labor Cost (INR),Total Cost (INR),Profit (INR),Margin (%)\n";
    const rows = projects_pnl.map(p => 
      `${p.order_id},"${p.project_name}","${p.customer_name}",${p.capacity_kw},${p.system_type},${p.collected_revenue_inr},${p.bom_hardware_cost_inr},${p.installation_hours},${p.technician_hourly_rate},${p.labor_cost_inr},${p.total_project_cost_inr},${p.project_profit_inr},${p.profit_margin_pct}%`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SunPower_Financial_PnL_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = projects_pnl.map(p => ({
    name: p.customer_name,
    Revenue: p.collected_revenue_inr,
    HardwareCost: p.bom_hardware_cost_inr,
    LaborCost: p.labor_cost_inr,
    NetProfit: p.project_profit_inr
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Executive Financial & Dynamic Job P&L Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Rule 5 Enforced: Profit = Revenue - SUM(BoM Component Procurement Costs) - (Field Hours * Tech Hourly Rate).
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
        >
          <Download className="w-4 h-4" /> Export P&L Report (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Collected Revenue</span>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">
            ₹{total_revenue_inr.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Advance & Full Payments</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Operating Costs</span>
          <p className="text-xl font-extrabold text-rose-400 font-mono">
            ₹{total_expenses_inr.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">BoM Hardware + Field Labor</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Net Realized Profit</span>
          <p className="text-xl font-extrabold text-amber-400 font-mono">
            ₹{net_profit_inr.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">
            {total_revenue_inr > 0 ? `${((net_profit_inr / total_revenue_inr) * 100).toFixed(1)}% Gross Margin` : '0%'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Pending Customer Dues</span>
          <p className="text-xl font-extrabold text-sky-400 font-mono">
            ₹{pending_payments_inr.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Receivables Pipeline</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-slate-400 font-medium">Warehouse Valuation</span>
          <p className="text-xl font-extrabold text-white font-mono">
            ₹{inventory_valuation_inr.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-500">Hardware Stock Asset</span>
        </div>
      </div>

      {/* Recharts Financial Comparison Bar Chart */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white">Project-Wise Revenue, Hardware Cost, Labor & Net Profit</h3>
            <p className="text-xs text-slate-400">Dynamically generated from foreign-key relational models</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> BoM Cost
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Net Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="HardwareCost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="NetProfit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Project-Wise Profitability Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white">Itemized Project Job-Costing Ledger</h3>
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Project & Client</th>
                <th className="p-3">Collected Revenue</th>
                <th className="p-3">BoM Hardware Cost</th>
                <th className="p-3">Field Hours & Rate</th>
                <th className="p-3">Labor Cost</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Net Profit</th>
                <th className="p-3 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects_pnl.map((p) => {
                const isProfitable = p.project_profit_inr >= 0;
                return (
                  <tr key={p.order_id} className="hover:bg-slate-850/50">
                    <td className="p-3">
                      <div className="font-semibold text-white">{p.customer_name}</div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        {p.capacity_kw} kW {p.system_type} | Order #{p.order_id}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-medium text-emerald-400">
                      ₹{p.collected_revenue_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      ₹{p.bom_hardware_cost_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {p.installation_hours}h @ ₹{p.technician_hourly_rate}/h
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      ₹{p.labor_cost_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono text-rose-300 font-medium">
                      ₹{p.total_project_cost_inr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={isProfitable ? 'text-amber-400' : 'text-rose-400'}>
                        ₹{p.project_profit_inr.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        p.profit_margin_pct >= 20
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : p.profit_margin_pct > 0
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {p.profit_margin_pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PM Surya Ghar Subsidy DBT Tracking Status */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Central Government PM Surya Ghar National Subsidy Tracking
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Not Applied</span>
            <p className="text-base font-bold text-slate-400 font-mono">{subsidy_tracking.NOT_APPLIED || 0} Orders</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Application Submitted</span>
            <p className="text-base font-bold text-amber-400 font-mono">{subsidy_tracking.APPLIED || 0} Orders</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">DISCOM Inspected</span>
            <p className="text-base font-bold text-sky-400 font-mono">{subsidy_tracking.INSPECTED || 0} Orders</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">DBT Direct Disbursed</span>
            <p className="text-base font-bold text-emerald-400 font-mono">{subsidy_tracking.DISBURSED || 0} Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
