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
  Zap,
  ArrowDownCircle,
  X
} from 'lucide-react';
import { api } from '../api';

export default function InventoryView({ inventory, bomTemplates, onRefresh }) {
  const [activeTab, setActiveTab] = useState('STOCK'); // 'STOCK' or 'BOM_TEMPLATES'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModalItem || restockQty <= 0) return;
    setIsSubmitting(true);
    try {
      await api.restockInventory(restockModalItem.id, parseInt(restockQty, 10));
      setSuccessMessage(`Successfully restocked +${restockQty} units of ${restockModalItem.name}!`);
      setTimeout(() => setSuccessMessage(''), 3500);
      setRestockModalItem(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error restocking inventory: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            type="button"
            onClick={() => setActiveTab('STOCK')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'STOCK' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live hardware inventory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BOM_TEMPLATES')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'BOM_TEMPLATES' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pre-configured BoM kits (1-5 kW)
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      )}

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
              <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU and item name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Procurement cost</th>
                  <th className="p-3">Selling price</th>
                  <th className="p-3">In-stock quantity</th>
                  <th className="p-3">Reorder threshold</th>
                  <th className="p-3">Inventory status</th>
                  <th className="p-3 text-right">Actions</th>
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
                      <td className="p-3 text-white">
                        <span className="font-mono font-bold">{item.stock_qty}</span> units
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className="font-mono">{item.reorder_threshold}</span> units
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 motion-safe:animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isLow ? 'Reorder needed' : 'Healthy stock'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQty(20);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          Restock
                        </button>
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
                  <h3 className="text-sm font-bold text-white">{template.description}</h3>
                  <p className="text-xs text-amber-400 mt-0.5">{template.capacity_kw} kW {template.system_type}</p>
                </div>
                <span className="text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  Labor: ₹{template.installation_charge_inr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Included hardware components:</span>
                {template.items?.map((bi) => (
                  <div key={bi.id} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-200">{bi.inventory_item?.name}</span>
                    <span className="text-amber-400 font-semibold">x<span className="font-mono">{bi.quantity}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-amber-400" />
                  Receive Inbound Inventory Shipment
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add verified physical warehouse stock to the central database.
                </p>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-white">{restockModalItem.name}</div>
              <div className="flex justify-between text-slate-400">
                <span>SKU: <span className="font-mono text-amber-400">{restockModalItem.sku}</span></span>
                <span>Current Stock: <span className="text-white font-bold"><span className="font-mono">{restockModalItem.stock_qty}</span> units</span></span>
              </div>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Inbound Quantity to Add (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRestockQty(preset)}
                    className="flex-1 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Receiving...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
