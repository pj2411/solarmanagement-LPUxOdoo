import React, { useState } from 'react';
import { 
  Sun, 
  Zap, 
  BatteryCharging, 
  ShieldCheck, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  IndianRupee,
  Building,
  Check
} from 'lucide-react';
import { api } from '../api';

export default function PublicWebsiteView({ onNavigate, onLeadCreated }) {
  const [billAmount, setBillAmount] = useState(3800);
  const [systemType, setSystemType] = useState('ON_GRID');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    subsidy_requested: true,
  });

  // Dynamic calculations based on Indian solar conditions (1kW produces ~120 units/mo, avg tariff ₹7/unit)
  const recommendedKw = Math.min(5, Math.max(1, Math.round((billAmount / 7) / 120)));
  const monthlyUnits = recommendedKw * 120;
  const estimatedMonthlySavings = Math.min(billAmount, Math.round(monthlyUnits * 7.5));
  const annualSavings = estimatedMonthlySavings * 12;

  // Approximate turnkey cost before subsidy
  const grossCost = recommendedKw * (systemType === 'ON_GRID' ? 58000 : 85000);
  // PM Surya Ghar Subsidy
  let subsidy = 0;
  if (systemType === 'ON_GRID') {
    if (recommendedKw <= 1) subsidy = 30000;
    else if (recommendedKw <= 2) subsidy = 60000;
    else subsidy = 78000;
  }
  const netInvestment = Math.max(0, grossCost - subsidy);
  const paybackYears = (netInvestment / annualSavings).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone) {
      alert('Please provide name and phone number');
      return;
    }
    setSubmitting(true);
    try {
      await api.createLead({
        ...form,
        capacity_kw: recommendedKw,
        system_type: systemType,
        monthly_bill_inr: billAmount,
        grid_suitable: true,
        follow_up_notes: `Website Lead via Solar Calculator (${recommendedKw}kW ${systemType}).`
      });
      setSuccessMsg(`Thank you ${form.customer_name}! Your site survey has been scheduled. A certified technician will visit your site.`);
      setForm({ customer_name: '', phone: '', email: '', address: '', subsidy_requested: true });
      if (onLeadCreated) onLeadCreated();
    } catch (err) {
      alert('Error submitting survey request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            PM Surya Ghar: Muft Bijli Yojana Approved Installer
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Power Your Rooftop with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Clean Solar Energy</span>
          </h1>
          <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
            SunPower Solutions installs Tier-1 Mono-PERC rooftop solar systems for Indian homeowners and enterprises. Slash your power bills by up to 90% and claim up to ₹78,000 direct DBT government subsidy.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a 
              href="#calculator" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Calculator className="w-4 h-4" /> Calculate Your Savings
            </a>
            <button
              onClick={() => onNavigate('quotations')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              Explore Packages <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* On-Grid vs Off-Grid Comparison */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-white">Compare Solar Systems</h2>
          <p className="text-xs text-slate-400">Choose between grid-connected net metering or autonomous battery storage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* On-Grid Card */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">On-Grid Rooftop System</h3>
                  <p className="text-xs text-slate-400">Net Metering with DISCOM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Govt Subsidy Eligible
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Exports surplus solar generation back to grid for power bill credits.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Zero battery recurring replacement cost — lowest lifetime CAPEX.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Direct DBT Central Government Subsidy up to ₹78,000.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 20-Year Solar Panel Linear Output Warranty.
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Payback Period:</span>
              <span className="font-bold text-emerald-400">~2.8 to 3.5 Years</span>
            </div>
          </div>

          {/* Off-Grid Card */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Off-Grid Solar System</h3>
                  <p className="text-xs text-slate-400">Battery Bank Storage Included</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                24x7 Power Backup
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" /> Complete independence from DISCOM power cuts and load shedding.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" /> High-capacity Tubular or LiFePO4 Lithium battery energy storage.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" /> Ideal for farmhouses, remote areas, and factories with high outages.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" /> Heavy duty hybrid pure sine wave inverter with MPPT charger.
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Payback Period:</span>
              <span className="font-bold text-sky-400">~4.0 to 5.2 Years</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Solar Savings Calculator & Lead Booking */}
      <section id="calculator" className="grid lg:grid-cols-12 gap-8 p-6 lg:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Smart Sizing Engine</span>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Interactive Solar Savings Calculator</h2>
            <p className="text-xs text-slate-400">Slide to your monthly electricity bill to calculate system size & ROI</p>
          </div>

          {/* Slider */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300 font-medium">Average Monthly Electricity Bill:</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">₹{billAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="25000" 
              step="500"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹1,000/mo</span>
              <span>₹10,000/mo</span>
              <span>₹25,000/mo</span>
            </div>
          </div>

          {/* System Type Selector */}
          <div className="flex gap-3">
            <button
              onClick={() => setSystemType('ON_GRID')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                systemType === 'ON_GRID'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Grid (Net Metering)
            </button>
            <button
              onClick={() => setSystemType('OFF_GRID')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                systemType === 'OFF_GRID'
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Off-Grid (Battery Storage)
            </button>
          </div>

          {/* Dynamic Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Recommended Size</p>
              <p className="text-lg font-bold text-white font-mono">{recommendedKw} kW</p>
              <p className="text-[10px] text-slate-500">~{recommendedKw * 80} sq.ft roof</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Monthly Savings</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">₹{estimatedMonthlySavings.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">₹{annualSavings.toLocaleString('en-IN')}/year</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Govt Subsidy</p>
              <p className="text-lg font-bold text-amber-400 font-mono">₹{subsidy.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">Direct DBT to bank</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Payback Period</p>
              <p className="text-lg font-bold text-sky-400 font-mono">{paybackYears} Yrs</p>
              <p className="text-[10px] text-slate-500">Free power after</p>
            </div>
          </div>
        </div>

        {/* Lead Capture Form */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Book Free Rooftop Site Survey</h3>
            <p className="text-xs text-slate-400">A certified technician will measure shadow angles & structure</p>
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-300 font-medium">Homeowner / Company Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Gurpreet Singh"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-medium">Mobile Phone *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 font-medium">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-300 font-medium">Site Address & City *</label>
              <textarea 
                rows="2"
                required
                placeholder="e.g. 45-B, Model Town, Jalandhar, Punjab"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="subsidy_cb"
                checked={form.subsidy_requested}
                onChange={(e) => setForm({ ...form, subsidy_requested: e.target.checked })}
                className="accent-amber-500 rounded"
              />
              <label htmlFor="subsidy_cb" className="text-[11px] text-slate-300">
                Apply for Central Govt PM Surya Ghar Subsidy
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {submitting ? 'Scheduling Survey...' : `Confirm Site Survey for ${recommendedKw} kW System`}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
