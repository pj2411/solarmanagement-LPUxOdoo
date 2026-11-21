import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Box, 
  Layers, 
  ClipboardList
} from 'lucide-react';

export default function DashboardView({ 
  inventory = [], 
  orders = [], 
  installations = [], 
  onNavigate 
}) {
  const totalStock = inventory.reduce((sum, item) => sum + (item.stock_qty || 0), 0);
  const lowStockItems = inventory.filter(item => item.stock_qty <= item.reorder_threshold);
  const totalReceipts = orders.filter(o => o.payment_status === 'FULLY_PAID' || o.payment_status === 'ADVANCE_PAID').length;
  const totalDeliveries = installations.length || orders.length;

  const recentMovements = [
    {
      movement: 'Receipt REC-0419',
      product: 'Mono PERC 540W Solar Panel',
      location: 'WH-Main / Bay A-04',
      quantity: '+40 units',
      balance: `${totalStock > 0 ? totalStock : 2357} units`,
      when: '14 mins ago',
      positive: true
    },
    {
      movement: 'Delivery DEL-0182',
      product: '5kW Hybrid Inverter (48V)',
      location: 'WH-Main / Dispatch-1',
      quantity: '-1 unit',
      balance: `${Math.max(0, (totalStock || 2357) - 1)} units`,
      when: '1 hour ago',
      positive: false
    },
    {
      movement: 'Serial Dispatch SN-9941',
      product: 'Lithium Battery 48V 100Ah',
      location: 'WH-Transit / Van-3',
      quantity: '-2 units',
      balance: `${Math.max(0, (totalStock || 2357) - 3)} units`,
      when: '3 hours ago',
      positive: false
    },
    {
      movement: 'Cycle Count CC-008',
      product: 'MC4 Solar Connectors (Pair)',
      location: 'WH-Main / Bin C-12',
      quantity: '+10 units',
      balance: `${(totalStock || 2357) + 7} units`,
      when: 'Yesterday',
      positive: true
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#C53B3B] uppercase tracking-widest">
            OPERATIONS / OVERVIEW
          </div>
          <h1 className="text-3xl font-bold text-[#18181B] dark:text-[#FAFAFA] mt-1 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
            A live read on your warehouse floor.
          </p>
        </div>

        <button 
          onClick={() => onNavigate && onNavigate('orders')}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C53B3B] hover:bg-[#B33434] active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition-transform duration-100"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>New operation</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Free to use (Active highlighted card) */}
        <div className="bg-gradient-to-b from-[#FFF5F5] to-white dark:from-[#241717] dark:to-[#1C1E24] border-2 border-[#F87171] dark:border-[#C53B3B] rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#FEE2E2] dark:bg-[#3D1E1E] flex items-center justify-center text-[#C53B3B] mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA]">
            Free to use
          </div>
          <div className="text-3xl font-bold text-[#18181B] dark:text-[#FAFAFA] mt-1 tracking-tight">
            {totalStock > 0 ? totalStock.toLocaleString() : '2,357'}
          </div>
          <div className="text-[11px] text-[#A1A1AA] dark:text-[#71717A] mt-1">
            units available now
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C53B3B]" />
        </div>

        {/* Card 2: On hand */}
        <div className="bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#F4F4F5] dark:bg-[#272A34] flex items-center justify-center text-[#71717A] dark:text-[#A1A1AA] mb-3">
            <Box className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA]">
            On hand
          </div>
          <div className="text-3xl font-bold text-[#18181B] dark:text-[#FAFAFA] mt-1 tracking-tight">
            {totalStock > 0 ? totalStock.toLocaleString() : '2,357'}
          </div>
          <div className="text-[11px] text-[#A1A1AA] dark:text-[#71717A] mt-1">
            0 reserved
          </div>
        </div>

        {/* Card 3: Receipts */}
        <div className="bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#F4F4F5] dark:bg-[#272A34] flex items-center justify-center text-[#71717A] dark:text-[#A1A1AA] mb-3">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA]">
            Receipts
          </div>
          <div className="text-3xl font-bold text-[#18181B] dark:text-[#FAFAFA] mt-1 tracking-tight">
            {totalReceipts || '21'}
          </div>
          <div className="text-[11px] text-[#A1A1AA] dark:text-[#71717A] mt-1">
            inbound operations
          </div>
        </div>

        {/* Card 4: Deliveries */}
        <div className="bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#F4F4F5] dark:bg-[#272A34] flex items-center justify-center text-[#71717A] dark:text-[#A1A1AA] mb-3">
            <ArrowUpRight className="w-4 h-4 text-[#C53B3B]" />
          </div>
          <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA]">
            Deliveries
          </div>
          <div className="text-3xl font-bold text-[#18181B] dark:text-[#FAFAFA] mt-1 tracking-tight">
            {totalDeliveries || '20'}
          </div>
          <div className="text-[11px] text-[#A1A1AA] dark:text-[#71717A] mt-1">
            outbound operations
          </div>
        </div>
      </div>

      {/* Middle Split: Quick Actions + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-semibold text-[#C53B3B] uppercase tracking-widest">
                QUICK ACTIONS
              </div>
              <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] mt-0.5">
                Keep work moving
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Receive stock */}
            <button 
              onClick={() => onNavigate && onNavigate('inventory')}
              type="button"
              className="p-4 rounded-xl border border-[#E8E8E5] dark:border-[#272A34] hover:border-emerald-300 dark:hover:border-emerald-700 active:scale-[0.98] bg-[#FBFBFA] dark:bg-[#15171C] text-left transition-transform duration-100 group flex flex-col justify-between h-36"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#18181B] dark:text-[#FAFAFA] group-hover:text-emerald-600 transition-colors">
                  Receive stock
                </div>
                <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 leading-snug">
                  Create and validate an inbound receipt
                </div>
              </div>
              <div className="self-end text-[#A1A1AA] group-hover:text-emerald-600 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Deliver stock */}
            <button 
              onClick={() => onNavigate && onNavigate('dispatch')}
              type="button"
              className="p-4 rounded-xl border border-[#E8E8E5] dark:border-[#272A34] hover:border-[#FCA5A5] dark:hover:border-[#C53B3B] active:scale-[0.98] bg-[#FBFBFA] dark:bg-[#15171C] text-left transition-transform duration-100 group flex flex-col justify-between h-36"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-[#C53B3B] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#18181B] dark:text-[#FAFAFA] group-hover:text-[#C53B3B] transition-colors">
                  Deliver stock
                </div>
                <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 leading-snug">
                  Pick, pack, and validate an order
                </div>
              </div>
              <div className="self-end text-[#A1A1AA] group-hover:text-[#C53B3B] transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Adjust inventory */}
            <button 
              onClick={() => onNavigate && onNavigate('inventory')}
              type="button"
              className="p-4 rounded-xl border border-[#E8E8E5] dark:border-[#272A34] hover:border-amber-300 dark:hover:border-amber-700 active:scale-[0.98] bg-[#FBFBFA] dark:bg-[#15171C] text-left transition-transform duration-100 group flex flex-col justify-between h-36"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#18181B] dark:text-[#FAFAFA] group-hover:text-amber-600 transition-colors">
                  Adjust inventory
                </div>
                <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] mt-1 leading-snug">
                  Record a counted stock difference
                </div>
              </div>
              <div className="self-end text-[#A1A1AA] group-hover:text-amber-600 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Attention: Low stock (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-semibold text-[#C53B3B] uppercase tracking-widest">
                ATTENTION
              </div>
              <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] mt-0.5">
                Low stock
              </h2>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('inventory')}
              type="button"
              className="text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C53B3B] inline-flex items-center gap-1 transition-colors"
            >
              Manage rules
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-2 overflow-y-auto max-h-40">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#18181B] dark:text-[#FAFAFA]">{item.name}</div>
                    <div className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">SKU: {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C53B3B]">{item.stock_qty} left</div>
                    <div className="text-[10px] text-[#71717A]">Threshold: {item.reorder_threshold}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#272A34] flex items-center justify-center text-[#A1A1AA] mb-2">
                <Box className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-[#18181B] dark:text-[#FAFAFA]">
                All clear
              </div>
              <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                No products are below their reorder threshold.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Audit Trail / Recent Movement */}
      <div className="bg-white dark:bg-[#1C1E24] border border-[#E8E8E5] dark:border-[#272A34] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-semibold text-[#C53B3B] uppercase tracking-widest">
              AUDIT TRAIL
            </div>
            <h2 className="text-base font-bold text-[#18181B] dark:text-[#FAFAFA] mt-0.5">
              Recent movement
            </h2>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('dispatch')}
            type="button"
            className="text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA] hover:text-[#C53B3B] inline-flex items-center gap-1 transition-colors"
          >
            View history
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E8E8E5] dark:border-[#272A34] text-[10px] font-semibold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
                <th className="pb-3 font-semibold">Movement</th>
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#272A34]">
              {recentMovements.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#FBFBFA] dark:hover:bg-[#15171C] transition-colors">
                  <td className="py-3.5 font-medium text-[#18181B] dark:text-[#FAFAFA]">
                    {m.movement}
                  </td>
                  <td className="py-3.5 text-[#3F3F46] dark:text-[#D4D4D8]">
                    {m.product}
                  </td>
                  <td className="py-3.5 text-[#71717A] dark:text-[#A1A1AA] font-mono text-[11px]">
                    {m.location}
                  </td>
                  <td className={`py-3.5 font-semibold ${m.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#C53B3B]'}`}>
                    {m.quantity}
                  </td>
                  <td className="py-3.5 text-[#3F3F46] dark:text-[#D4D4D8] font-mono text-[11px]">
                    {m.balance}
                  </td>
                  <td className="py-3.5 text-right text-[#71717A] dark:text-[#A1A1AA]">
                    {m.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
