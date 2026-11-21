import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Lock, 
  Unlock, 
  Download, 
  CheckCircle, 
  Zap, 
  BatteryCharging, 
  AlertCircle,
  FileText,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import { generateQuotationPDF } from '../utils/pdfExport';

export default function QuotationView({ quotations, leads, surveys, onRefresh, onNavigate }) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || 1);
  const [capacityKw, setCapacityKw] = useState(3.0);
  const [systemType, setSystemType] = useState('ON_GRID');
  const [bomBreakdown, setBomBreakdown] = useState(null);
  const [loadingBom, setLoadingBom] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected lead and its survey status
  const currentLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const currentSurvey = surveys.find(s => s.lead_id === currentLead?.id);
  const isSurveyApproved = currentSurvey?.is_approved === true;

  // Fetch BOM calculation live whenever capacity or systemType changes
  useEffect(() => {
    let active = true;
    const fetchCalc = async () => {
      setLoadingBom(true);
      setErrorMsg('');
      try {
        const data = await api.calculateBom(capacityKw, systemType);
        if (active) setBomBreakdown(data);
      } catch (err) {
        if (active) setErrorMsg(err.message);
      } finally {
        if (active) setLoadingBom(false);
      }
    };
    fetchCalc();
    return () => { active = false; };
  }, [capacityKw, systemType]);

  const handleCreateQuotation = async () => {
    if (!currentSurvey) {
      alert('No survey found for this customer lead!');
      return;
    }
    setCreatingQuote(true);
    setErrorMsg('');
    try {
      await api.createQuotation({
        lead_id: currentLead.id,
        survey_id: currentSurvey.id,
        capacity_kw: capacityKw,
        system_type: systemType
      });
      alert('Quotation generated successfully and sent to customer!');
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreatingQuote(false);
    }
  };

  const handleApproveQuote = async (quoteId) => {
    try {
      await api.approveQuotation(quoteId);
      alert('Quotation marked as Approved by Customer! Converted to active Order.');
      onRefresh();
    } catch (err) {
      alert('Error approving quotation: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          Quotation & Turnkey Pricing Engine
        </h2>
        <p className="text-xs text-slate-400">
          Enforces Survey Gatekeeper Rule, calculates exact BoM hardware packages, applies PM Surya Ghar subsidy, and exports official PDF quotes.
        </p>
      </div>

      {/* Interactive Quotation Generator */}
      <div className="grid lg:grid-cols-12 gap-6 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-sm text-white">1. Configure Solar System</h3>

          {/* Lead Selector */}
          <div>
            <label className="text-[11px] text-slate-300 font-medium">Select Customer Lead</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.customer_name} ({l.capacity_kw}kW - {l.pipeline_stage})
                </option>
              ))}
            </select>
          </div>

          {/* Survey Gatekeeper Status Notice */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            isSurveyApproved
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {isSurveyApproved ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>
                {isSurveyApproved
                  ? 'Roof Survey Approved — Quoting Unlocked'
                  : 'Roof Survey Pending — Quoting Locked (Rule 1)'}
              </span>
            </div>
            {!isSurveyApproved && (
              <button
                onClick={() => onNavigate('site-survey')}
                className="text-[11px] font-bold underline hover:text-white"
              >
                Go to Surveys →
              </button>
            )}
          </div>

          {/* Capacity KW Selector (1kW to 5kW) */}
          <div>
            <label className="text-[11px] text-slate-300 font-medium">System Capacity (1 kW to 5 kW)</label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {[1.0, 2.0, 3.0, 4.0, 5.0].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setCapacityKw(kw)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    capacityKw === kw
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {kw} kW
                </button>
              ))}
            </div>
          </div>

          {/* System Type Selector */}
          <div>
            <label className="text-[11px] text-slate-300 font-medium">System Architecture</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setSystemType('ON_GRID')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  systemType === 'ON_GRID'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> On-Grid (Net Metering)
              </button>
              <button
                type="button"
                onClick={() => setSystemType('OFF_GRID')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  systemType === 'OFF_GRID'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5" /> Off-Grid (Battery Bank)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generate Button with Gatekeeper enforcement */}
          <button
            onClick={handleCreateQuotation}
            disabled={creatingQuote || !isSurveyApproved}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSurveyApproved
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isSurveyApproved ? (
              <>
                <FileText className="w-4 h-4" />
                {creatingQuote ? 'Generating...' : `Generate & Dispatch ${capacityKw}kW Quotation`}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Locked: Requires Technician Survey Approval First
              </>
            )}
          </button>
        </div>

        {/* Right BoM Breakdown Calculation Box */}
        <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-sm text-white">Deterministic Bill of Materials (BoM) Calculation</h3>
              <p className="text-[11px] text-slate-400">Auto-configured for {capacityKw} kW {systemType}</p>
            </div>
            {loadingBom && <span className="text-xs text-amber-400 animate-pulse">Calculating...</span>}
          </div>

          {bomBreakdown && (
            <div className="space-y-4">
              {/* Items List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {bomBreakdown.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900 border border-slate-800">
                    <div>
                      <span className="font-medium text-white">{item.name}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        SKU: {item.sku} | Qty: {item.quantity} | Available Stock: {item.stock_qty}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-200">₹{item.subtotal_inr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Hardware Total (Panels, Inverter, Structure, Cables):</span>
                  <span className="font-mono">₹{bomBreakdown.hardware_total_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Installation, Testing & Grid Commissioning Charge:</span>
                  <span className="font-mono">₹{bomBreakdown.installation_charge_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Direct Govt PM Surya Ghar Subsidy Benefit:</span>
                  <span className="font-mono">- ₹{bomBreakdown.subsidy_discount_inr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold text-sm pt-2 border-t border-slate-800">
                  <span>Net Customer Payable Amount:</span>
                  <span className="font-mono">₹{bomBreakdown.grand_total_inr.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quotations History Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white">Issued Quotations Registry</h3>
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Quote #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">System</th>
                <th className="p-3">Gross Amount</th>
                <th className="p-3">Govt Subsidy</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-850/50">
                  <td className="p-3 font-mono text-slate-400">#SPQ-{q.id}</td>
                  <td className="p-3 font-medium text-white">{q.lead?.customer_name || 'Customer'}</td>
                  <td className="p-3 font-mono text-amber-400">{q.capacity_kw} kW {q.system_type}</td>
                  <td className="p-3 font-mono text-slate-300">₹{(q.hardware_total_inr + q.installation_charge_inr).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono text-emerald-400">-₹{q.subsidy_discount_inr.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-mono font-bold text-white">₹{q.grand_total_inr.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      q.status === 'APPROVED_BY_CUSTOMER'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => generateQuotationPDF(q)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 inline-flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    {q.status !== 'APPROVED_BY_CUSTOMER' && (
                      <button
                        onClick={() => handleApproveQuote(q.id)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium inline-flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3" /> Customer Approve
                      </button>
                    )}
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
