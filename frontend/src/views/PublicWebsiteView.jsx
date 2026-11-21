import React, { useState } from 'react';
import { 
  Zap, 
  BatteryCharging, 
  CheckCircle2, 
  Calculator,
  ArrowRight,
  ShieldCheck,
  Building,
  Award,
  Phone,
  Mail,
  MapPin,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Globe
} from 'lucide-react';
import { api } from '../api';

export default function PublicWebsiteView({ onNavigate, onLeadCreated, onSignInClick, isStandalone = false }) {
  const [billAmount, setBillAmount] = useState(3800);
  const [roofArea, setRoofArea] = useState(350);
  const [systemType, setSystemType] = useState('ON_GRID');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSection, setActiveSection] = useState('home');

  const handleOpenStandalone = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=public`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Form states
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    subsidy_requested: true,
  });

  // Dynamic calculations based on Indian solar conditions (1kW produces ~120 units/mo, avg tariff ₹7/unit)
  // 1kW requires approx 80-100 sq.ft shadow-free roof area
  const kwFromBill = Math.round((billAmount / 7) / 120);
  const maxKwFromRoof = Math.floor(roofArea / 80);
  const recommendedKw = Math.min(10, Math.max(1, Math.min(kwFromBill, maxKwFromRoof || 1)));
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
  const twentyFiveYearSavings = (annualSavings * 25) - netInvestment;

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
      setSuccessMsg(`Survey booked for ${form.customer_name}. A technician will contact you.`);
      setForm({ customer_name: '', phone: '', email: '', address: '', subsidy_requested: true });
      if (onLeadCreated) onLeadCreated();
    } catch (err) {
      alert('Error submitting survey request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">

      {/* Top Standalone Launcher Bar (Shown inside ERP) */}
      {!isStandalone && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Public Customer Website
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Module 1</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customer-facing portal with solar savings calculator and PM Surya Ghar subsidy estimator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenStandalone}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex-shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Page
          </button>
        </div>
      )}

      {/* SECTION 1: HOME PAGE HERO */}
      <section id="home" className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 lg:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Certified Rooftop Solar Systems for Clean Home Energy
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            SunPower Solutions manufactures, procures, and installs Tier-1 Mono-PERC rooftop solar systems for homeowners and commercial establishments across India.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <a 
              href="#calculator" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
            >
              <Calculator className="w-4 h-4" /> Calculate solar savings
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              Book free roof survey
            </a>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('quotations') : (document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth' }))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-semibold text-xs border border-amber-500/30 transition-colors"
            >
              View formal packages
            </button>
            {!isStandalone && (
              <button
                type="button"
                onClick={handleOpenStandalone}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs border border-amber-500/40 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Page
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
            <div>
              <div className="text-lg font-bold text-white font-mono">40+</div>
              <div className="text-[11px] text-slate-400">Projects per month</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400 font-mono">15</div>
              <div className="text-[11px] text-slate-400">Certified technicians</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400 font-mono">₹78,000</div>
              <div className="text-[11px] text-slate-400">Direct DBT subsidy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-sky-400 font-mono">20 Years</div>
              <div className="text-[11px] text-slate-400">Panel output guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT COMPANY */}
      <section id="about" className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-semibold text-amber-400">About SunPower Solutions</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Full Turnkey Rooftop Solar Engineering</h2>
          <p className="text-xs text-slate-400">
            Engineered with strict quality standards, deterministic inventory control, and end-to-end execution.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Government Empaneled</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approved channel partner under the Ministry of New & Renewable Energy (MNRE) for direct DBT PM Surya Ghar subsidies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Certified Field Crew</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              15 full-time certified solar technicians with rigorous structural anchor testing, lightning arrestors, and earthing chemical pits.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">40 Projects Monthly</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving Punjab, Haryana, and Delhi NCR with guaranteed DISCOM net-metering synchronization within 14 business days.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLAR PRODUCTS CATALOG */}
      <section id="products" className="space-y-6">
        <div className="max-w-xl space-y-1">
          <span className="text-xs font-semibold text-amber-400">Hardware & Components</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Certified Tier-1 Solar Products</h2>
          <p className="text-xs text-slate-400">
            Every serialized component is tracked in our central database with automated warranty registration upon dispatch.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              20-Year Guarantee
            </span>
            <h3 className="font-bold text-sm text-white">Mono-PERC Half-Cut Panels</h3>
            <p className="text-xs text-slate-400">540Wp - 580Wp high efficiency bifacial & monofacial modules with anti-PID glass.</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
              ₹14,500 / panel
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              2-Year Warranty
            </span>
            <h3 className="font-bold text-sm text-white">Hybrid Grid-Tie Inverters</h3>
            <p className="text-xs text-slate-400">IP65 pure sine wave inverters with dual MPPT tracking and cloud WiFi monitoring.</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
              ₹38,000 / 3kW unit
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              6000 Life Cycles
            </span>
            <h3 className="font-bold text-sm text-white">Lithium & Tubular Batteries</h3>
            <p className="text-xs text-slate-400">48V 100Ah LiFePO4 battery modules & C10 solar tubular banks for 24x7 off-grid backup.</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
              ₹45,000 / pack
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Corrosion Proof
            </span>
            <h3 className="font-bold text-sm text-white">Mounting Structure & Cables</h3>
            <p className="text-xs text-slate-400">Hot-dip galvanized anodized aluminum struts, 4/6 sq.mm UV solar DC cabling & MC4.</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-medium">
              Included in BoM
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: ON-GRID VS OFF-GRID SYSTEMS */}
      <section id="systems" className="space-y-4">
        <div className="max-w-xl space-y-1">
          <span className="text-xs font-semibold text-amber-400">System Architectures</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Choose Your Solar System Type</h2>
          <p className="text-xs text-slate-400">Compare grid-tied net metering with independent battery energy storage.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* On-Grid Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">On-Grid Rooftop System</h3>
                  <p className="text-xs text-slate-400">Net metering with DISCOM</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Govt Subsidy Eligible
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Exports surplus generation back to the grid for monthly billing credit.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Lowest lifetime CAPEX with zero recurring battery replacement cost.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Central Government DBT PM Surya Ghar subsidy up to ₹78,000.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 20-Year linear panel power output warranty.
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Payback period:</span>
              <span className="font-bold text-emerald-400">~2.8 to 3.5 years</span>
            </div>
          </div>

          {/* Off-Grid Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Off-Grid Solar System</h3>
                  <p className="text-xs text-slate-400">Battery energy storage included</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                24x7 Power Backup
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Complete power independence from DISCOM power cuts and grid outages.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> High-capacity tubular or LiFePO4 lithium battery energy storage options.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Ideal for farmhouses, manufacturing workshops, and areas with unreliable power.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Heavy-duty pure sine wave inverter with MPPT charger.
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Payback period:</span>
              <span className="font-bold text-slate-200">~4.0 to 5.2 years</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SOLAR SAVINGS CALCULATOR */}
      <section id="calculator" className="grid lg:grid-cols-12 gap-8 p-6 lg:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400">Smart Sizing Engine</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Interactive Solar Savings Calculator</h2>
            <p className="text-xs text-slate-400">Slide to your monthly electricity bill to calculate system capacity and annual savings.</p>
          </div>

          {/* Bill Slider */}
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

          {/* Roof Area Slider */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300 font-medium">Usable Roof Area (Shadow-Free):</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{roofArea} sq.ft</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              step="50"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>100 sq.ft (~1 kW)</span>
              <span>800 sq.ft (~8 kW)</span>
              <span>2,000 sq.ft (~20 kW)</span>
            </div>
          </div>

          {/* System Type Selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSystemType('ON_GRID')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                systemType === 'ON_GRID'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Grid (Net Metering)
            </button>
            <button
              type="button"
              onClick={() => setSystemType('OFF_GRID')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                systemType === 'OFF_GRID'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Off-Grid (Battery Storage)
            </button>
          </div>

          {/* Dynamic Metrics Output */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Recommended Size</p>
              <p className="text-lg font-bold text-white font-mono">{recommendedKw} kW</p>
              <p className="text-[10px] text-slate-500">~{recommendedKw * 80} sq.ft used</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Monthly Savings</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">₹{estimatedMonthlySavings.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">₹{annualSavings.toLocaleString('en-IN')}/year</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Govt Subsidy</p>
              <p className="text-lg font-bold text-amber-400 font-mono">₹{subsidy.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500">PM Surya Ghar DBT</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Payback Period</p>
              <p className="text-lg font-bold text-slate-200 font-mono">{paybackYears} years</p>
              <p className="text-[10px] text-slate-500">Free power after</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <p className="text-[11px] text-amber-400 font-semibold">25-Yr Net Savings</p>
              <p className="text-lg font-extrabold text-amber-400 font-mono">₹{(twentyFiveYearSavings / 100000).toFixed(2)} L</p>
              <p className="text-[10px] text-slate-400">Lifetime financial gain</p>
            </div>
          </div>
        </div>

        {/* SECTION 8: CONTACT & ENQUIRY BOOKING */}
        <div id="contact" className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white">Book Free Rooftop Site Survey</h3>
            <p className="text-xs text-slate-400">A certified technician measures shadow angles and roof structure.</p>
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">Homeowner / Company Name *</label>
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
                <label className="text-xs text-slate-300 font-medium">Mobile Phone *</label>
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
                <label className="text-xs text-slate-300 font-medium">Email Address</label>
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
              <label className="text-xs text-slate-300 font-medium">Site Address & City *</label>
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
              <label htmlFor="subsidy_cb" className="text-xs text-slate-300">
                Apply for Central Govt PM Surya Ghar Subsidy
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Scheduling survey...' : `Confirm survey for ${recommendedKw} kW system`}
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 7: PM SURYA GHAR SUBSIDY INFORMATION */}
      <section id="subsidy" className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-semibold text-amber-400">National Solar Mission</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">PM Surya Ghar: Muft Bijli Yojana Subsidy Structure</h2>
          <p className="text-xs text-slate-400">
            Direct Benefit Transfer (DBT) deposited straight into the homeowner's registered bank account post commissioning.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-amber-400">Tier 1: 1 kW System</span>
            <div className="text-2xl font-extrabold text-white font-mono">₹30,000</div>
            <p className="text-xs text-slate-400">Flat central DBT subsidy for residential installations up to 1 kW capacity.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-amber-400">Tier 2: 2 kW System</span>
            <div className="text-2xl font-extrabold text-white font-mono">₹60,000</div>
            <p className="text-xs text-slate-400">Flat central DBT subsidy for residential installations up to 2 kW capacity.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-semibold text-amber-400">Tier 3: 3 kW to 10 kW</span>
            <div className="text-2xl font-extrabold text-white font-mono">₹78,000</div>
            <p className="text-xs text-slate-400">Maximum capped DBT central government subsidy for 3 kW and higher systems.</p>
          </div>
        </div>
      </section>

      {/* FOOTER & DIRECT CONTACT INFO */}
      <footer className="pt-8 border-t border-slate-800 grid sm:grid-cols-3 gap-6 text-xs text-slate-400">
        <div className="space-y-2">
          <div className="font-bold text-white text-sm">SunPower Solutions India</div>
          <p>Turnkey Solar EPC & Smart Asset Management.</p>
          <p>Completing ~40 rooftop installations monthly.</p>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-white text-sm">Service Hubs</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Jalandhar, Punjab (Main Depot)</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Delhi NCR (Sales & Engineering)</div>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-white text-sm">Get in Touch</div>
          <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> +91 181 405 8890 / +91 98765 43210</div>
          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> contact@sunpower.in</div>
        </div>
      </footer>
    </div>
  );
}
