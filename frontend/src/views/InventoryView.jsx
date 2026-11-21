import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  PlusCircle, 
  Boxes,
  Zap
} from 'lucide-react';

export default function InventoryView({ inventory, bomTemplates, onRefresh }) {
  const [activeTab, setActiveTab] = useState('STOCK'); // 'STOCK' or 'BOM_TEMPLATES'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'PANELS',
    'INVERTERS',
    'BATTERIES',
    'MOUNTING_STRUCTURES',
    'WIRES_CONNECTORS',
    'SAFETY_EQUIPMENT'
  ];

  const filteredItems = inventory.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockCount = inventory.filter(i => i.stock_qty <= i.reorder_threshold).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Inventory & Bill of Materials (BoM)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock reservation engine across panels, inverters, batteries, cables, and safety gear.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'STOCK' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Hardware Inventory
          </button>
          <button
            onClick={() => setActiveTab('BOM_TEMPLATES')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'BOM_TEMPLATES' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pre-Configured BoM Kits (1-5 kW)
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {lowStockCount} hardware component(s) have fallen below their reorder safety threshold!
          </div>
          <button 
            onClick={() => setSelectedCategory('ALL')} 
            className="text-[11px] font-bold text-rose-400 underline hover:text-white"
          >
            Review Depleted Stock
          </button>
        </div>
      )}

      {activeTab === 'STOCK' ? (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by component name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU & Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Procurement Cost</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">In-Stock Qty</th>
                  <th className="p-3">Reorder Threshold</th>
                  <th className="p-3">Inventory Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => {
                  const isLow = item.stock_qty <= item.reorder_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50">
                      <td className="p-3">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-amber-400">
                        {item.category.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        ₹{item.unit_cost_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-medium">
                        ₹{item.selling_price_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        {item.stock_qty} units
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {item.reorder_threshold} units
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isLow ? '⚠️ REORDER NEEDED' : '✓ HEALTHY STOCK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Pre-Configured BOM Kits */
        <div className="grid md:grid-cols-2 gap-6">
          {bomTemplates.map((template) => (
            <div key={template.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                    {template.capacity_kw} kW {template.system_type}
                  </span>
                  <h3 className="text-sm font-bold text-white">{template.description}</h3>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  Labor: ₹{template.installation_charge_inr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Included Hardware Components:</span>
                {template.items?.map((bi) => (
                  <div key={bi.id} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-200">{bi.inventory_item?.name}</span>
                    <span className="text-amber-400 font-mono font-semibold">x{bi.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
