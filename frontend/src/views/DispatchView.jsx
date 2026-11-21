import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Truck, 
  CheckCircle2, 
  PackageCheck, 
  Calendar, 
  Camera, 
  Plus, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../api';

export default function DispatchView({ serialUnits, orders, inventory, onRefresh }) {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || 1);
  const [componentType, setComponentType] = useState('INVERTER');
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || 1);
  const [dispatching, setDispatching] = useState(false);
  const [confirmingSerial, setConfirmingSerial] = useState(null);

  // Initialize html5-qrcode scanner when modal opens
  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      try {
        scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
        scanner.render((decodedText) => {
          setSerialNumber(decodedText);
          setShowScanner(false);
          scanner.clear();
        }, (error) => {
          // ignore scan frame errors
        });
      } catch (err) {
        console.warn('QR Scanner init error:', err);
      }
    }
    return () => {
      if (scanner) {
        try { scanner.clear(); } catch {}
      }
    };
  }, [showScanner]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!serialNumber) {
      alert('Please enter or scan a serial number');
      return;
    }
    setDispatching(true);
    try {
      const order = orders.find(o => o.id === selectedOrderId);
      await api.dispatchSerial({
        order_id: selectedOrderId,
        lead_id: order?.lead_id || 1,
        inventory_item_id: selectedItemId,
        component_type: componentType,
        serial_number: serialNumber.trim().toUpperCase()
      });
      alert(`Serial ${serialNumber} successfully mapped & dispatched!`);
      setSerialNumber('');
      onRefresh();
    } catch (err) {
      alert('Dispatch error: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleConfirmDelivery = async (serial) => {
    setConfirmingSerial(serial);
    try {
      const res = await api.confirmDelivery(serial);
      alert(`Delivery Confirmed! Automated Rule 3 Triggered:\n• Start Date: ${res.warranty_start_date}\n• Expiry Date: ${res.warranty_expiry_date} (${res.warranty_years} Years)`);
      onRefresh();
    } catch (err) {
      alert('Error confirming delivery: ' + err.message);
    } finally {
      setConfirmingSerial(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" />
          Warehouse Dispatch & Serial Number Tracking
        </h2>
        <p className="text-xs text-slate-400">
          Scan QR/barcodes, bind component serials to orders, and automatically trigger 20-Year (Panels) or 2-Year (Inverters/Batteries) warranties upon delivery confirmation.
        </p>
      </div>

      {/* Dispatch & Registration Form */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-amber-400" />
          Register Dispatched Hardware Unit
        </h3>

        <form onSubmit={handleDispatch} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] text-slate-300 font-medium">Customer Order #</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  #ORD-{o.id}: {o.lead?.customer_name || 'Customer'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-medium">Component Category</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              <option value="INVERTER">INVERTER (2-Yr Warranty)</option>
              <option value="PANEL">PANEL (20-Yr Warranty)</option>
              <option value="BATTERY">BATTERY (2-Yr Warranty)</option>
              <option value="CHARGE_CONTROLLER">CHARGE CONTROLLER (2-Yr Warranty)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-medium">Inventory Model / SKU</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              {inventory.map(i => (
                <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-medium">Hardware Serial #</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="e.g. INV-2026-8841"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex-shrink-0"
                title="Scan with Camera"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={dispatching}
              className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {dispatching ? 'Registering...' : 'Dispatch & Map Serial to Order'}
            </button>
          </div>
        </form>

        {/* Live Camera Scanner Box */}
        {showScanner && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" /> Point camera at QR Code or 1D Barcode
              </span>
              <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-white">✕ Close</button>
            </div>
            <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-black"></div>
          </div>
        )}
      </div>

      {/* Dispatched Serials Registry */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Serial Number</th>
              <th className="p-3">Component Type</th>
              <th className="p-3">Assigned Customer</th>
              <th className="p-3">Dispatched Date</th>
              <th className="p-3">Delivery Status</th>
              <th className="p-3">Warranty Expiry</th>
              <th className="p-3 text-right">Rule 3 Automation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {serialUnits.map((u) => {
              const isDelivered = u.delivery_confirmed;
              return (
                <tr key={u.serial_number} className="hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-amber-400">{u.serial_number}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {u.component_type}
                    </span>
                  </td>
                  <td className="p-3 text-white font-medium">{u.lead?.customer_name || 'Customer'}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {u.dispatched_at ? new Date(u.dispatched_at).toLocaleDateString() : 'Today'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isDelivered
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    }`}>
                      {isDelivered ? '✓ Delivered' : 'In Transit'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {u.warranty_expiry_date ? u.warranty_expiry_date : 'Pending Delivery'}
                  </td>
                  <td className="p-3 text-right">
                    {!isDelivered ? (
                      <button
                        onClick={() => handleConfirmDelivery(u.serial_number)}
                        disabled={confirmingSerial === u.serial_number}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {confirmingSerial === u.serial_number ? 'Computing...' : 'Confirm Delivery & Start Warranty'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Warranty Active ({u.warranty_years}Y)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
