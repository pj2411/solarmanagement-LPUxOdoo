import React, { useState } from 'react';
import { 
  ReceiptText, 
  IndianRupee, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Truck,
  Download,
  Clock
} from 'lucide-react';
import { api } from '../api';
import { generateInvoicePDF } from '../utils/pdfExport';

export default function OrderPaymentView({ orders, onRefresh, onNavigate }) {
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [payAmount, setPayAmount] = useState(50000);
  const [processing, setProcessing] = useState(false);
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

  const handlePay = async (orderId) => {
    setProcessing(true);
    setLastPaymentResult(null);
    try {
      const res = await api.recordPayment(orderId, {
        amount: Number(payAmount),
        payment_type: 'ADVANCE'
      });
      setLastPaymentResult(res);
      alert(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully! BoM inventory reserved.`);
      onRefresh();
    } catch (err) {
      alert('Payment processing error: ' + err.message);
    } finally {
      setProcessing(false);
      setPayingOrderId(null);
    }
  };

  const handleSubsidyUpdate = async (orderId, newStatus) => {
    try {
      await api.updateSubsidy(orderId, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('API notice updating subsidy status:', err);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-amber-400" />
          Order & Payment Management
        </h2>
        <p className="text-xs text-slate-400">
          Enforces BoM stock deduction upon payment receipt, auto-creates field installation tasks, and generates official GST Tax Invoices.
        </p>
      </div>

      {/* BoM Explosion Notification Box */}
      {lastPaymentResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Backend BoM Explosion & Stock Deduction Activated (Rule #2):
          </div>
          <p className="text-xs text-slate-300">
            Order #{lastPaymentResult.order_id} recorded. Inventory deducted from stock. Auto-created field installation job #{lastPaymentResult.installation_job_id || 'Active'}.
          </p>
          {lastPaymentResult.low_stock_alerts?.length > 0 && (
            <div className="p-2.5 rounded bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Low Stock Warning Triggered: </span>
                {lastPaymentResult.low_stock_alerts.map(a => `${a.name} (Qty: ${a.current_stock})`).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer & System</th>
              <th className="p-3">Total Value</th>
              <th className="p-3">Advance Paid</th>
              <th className="p-3">Balance Due</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">BoM Deducted</th>
              <th className="p-3">Govt Subsidy DBT</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map((o) => {
              const quote = o.quotation;
              const lead = o.lead;
              const isPaid = o.payment_status === 'FULLY_PAID';
              const isAdvance = o.payment_status === 'ADVANCE_PAID';

              return (
                <tr key={o.id} className="hover:bg-slate-850/50">
                  <td className="p-3 text-slate-400">#ORD-<span className="font-mono">{o.id}</span></td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{lead?.customer_name || 'Customer'}</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {quote?.capacity_kw || 3} kW {quote?.system_type || 'ON_GRID'}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-200">
                    ₹{o.total_amount_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-emerald-400 font-medium">
                    ₹{o.advance_paid_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-rose-400 font-medium">
                    ₹{o.balance_due_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isAdvance
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      o.bom_deducted
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {o.bom_deducted ? '✓ Stock Deducted' : 'Pending Payment'}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={o.subsidy_tracking_status}
                      onChange={(e) => handleSubsidyUpdate(o.id, e.target.value)}
                      className="px-2 py-1 text-[11px] bg-slate-950 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="NOT_APPLIED">NOT_APPLIED</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="INSPECTED">INSPECTED</option>
                      <option value="DISBURSED">DISBURSED</option>
                    </select>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => generateInvoicePDF(o)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <Download className="w-3 h-3 text-amber-400" /> Invoice
                    </button>
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => { setPayingOrderId(o.id); setPayAmount(o.balance_due_inr > 50000 ? 50000 : o.balance_due_inr); }}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3 h-3" /> Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {payingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Record Order Payment & Deduct Stock
            </h3>
            <p className="text-xs text-slate-400">
              Receipt of payment automatically triggers BoM deduction and queues technician installation scheduling.
            </p>
            <div>
              <label className="text-xs text-slate-300 font-medium">Payment Amount (INR)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayingOrderId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePay(payingOrderId)}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing BoM...' : 'Confirm Payment & Deduct BoM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
