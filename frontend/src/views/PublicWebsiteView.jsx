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
    <div className="space-y-12 lg:space-y-16 pb-28 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Top Standalone Launcher Bar (Shown inside ERP) */}
      {!isStandalone && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                Public Customer Website
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Module 1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Customer-facing portal with solar savings calculator and PM Surya Ghar subsidy estimator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenStandalone}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex-shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Page
          </button>
        </div>
      )}

      {/* SECTION 1: HOME PAGE HERO */}
      <section id="home" className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>India's Premier Rooftop Solar Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Certified Rooftop Solar Systems for Clean Home Energy
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl">
            SunPower Solutions manufactures, procures, and installs Tier-1 Mono-PERC rooftop solar systems for homeowners and commercial establishments across India.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href="#calculator" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20"
            >
              <Calculator className="w-5 h-5" /> Calculate Solar Savings
            </a>
            <a 
              href="#survey-booking" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('survey-booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 transition-all"
            >
              Book Free Roof Survey
            </a>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('quotations') : (document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth' }))}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-semibold text-sm sm:text-base border border-amber-500/30 transition-all"
            >
              View Formal Packages
            </button>
            {!isStandalone && (
              <button
                type="button"
                onClick={handleOpenStandalone}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-sm sm:text-base border border-amber-500/40 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Page
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 sm:pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-slate-800">
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-sans tracking-tight truncate">40+</div>
              <div className="text-xs sm:text-sm text-slate-400 truncate">Projects per month</div>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400 font-sans tracking-tight truncate">15</div>
              <div className="text-xs sm:text-sm text-slate-400 truncate">Certified technicians</div>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 font-sans tracking-tight truncate">₹78,000</div>
              <div className="text-xs sm:text-sm text-slate-400 truncate">Direct DBT subsidy</div>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-sky-400 font-sans tracking-tight truncate">20 Years</div>
              <div className="text-xs sm:text-sm text-slate-400 truncate">Panel output guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT COMPANY */}
      <section id="about" className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">About SunPower Solutions</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Full Turnkey Rooftop Solar Engineering</h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered with strict quality standards, deterministic inventory control, and end-to-end execution.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white">Government Empaneled</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Approved channel partner under the Ministry of New & Renewable Energy (MNRE) for direct DBT PM Surya Ghar subsidies.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white">Certified Field Crew</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              15 full-time certified solar technicians with rigorous structural anchor testing, lightning arrestors, and earthing chemical pits.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white">40 Projects Monthly</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Serving Punjab, Haryana, and Delhi NCR with guaranteed DISCOM net-metering synchronization within 14 business days.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLAR PRODUCTS CATALOG */}
      <section id="products" className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">Hardware & Components</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Certified Tier-1 Solar Products</h2>
          <p className="text-sm sm:text-base text-slate-400">
            Every serialized component is tracked in our central database with automated warranty registration upon dispatch.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              20-Year Guarantee
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-white">Mono-PERC Half-Cut Panels</h3>
            <p className="text-sm text-slate-400 leading-relaxed">540Wp - 580Wp high efficiency bifacial & monofacial modules with anti-PID glass.</p>
            <div className="pt-3 border-t border-slate-800 text-sm sm:text-base text-amber-400 font-mono font-bold">
              ₹14,500 / panel
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              2-Year Warranty
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-white">Hybrid Grid-Tie Inverters</h3>
            <p className="text-sm text-slate-400 leading-relaxed">IP65 pure sine wave inverters with dual MPPT tracking and cloud WiFi monitoring.</p>
            <div className="pt-3 border-t border-slate-800 text-sm sm:text-base text-emerald-400 font-mono font-bold">
              ₹38,000 / 3kW unit
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              6000 Life Cycles
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-white">Lithium & Tubular Batteries</h3>
            <p className="text-sm text-slate-400 leading-relaxed">48V 100Ah LiFePO4 battery modules & C10 solar tubular banks for 24x7 off-grid backup.</p>
            <div className="pt-3 border-t border-slate-800 text-sm sm:text-base text-sky-400 font-mono font-bold">
              ₹45,000 / pack
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Corrosion Proof
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-white">Mounting Structure & Cables</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Hot-dip galvanized anodized aluminum struts, 4/6 sq.mm UV solar DC cabling & MC4.</p>
            <div className="pt-3 border-t border-slate-800 text-sm sm:text-base text-slate-300 font-medium">
              Included in BoM
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: ON-GRID VS OFF-GRID SYSTEMS */}
      <section id="systems" className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">System Architectures</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Choose Your Solar System Type</h2>
          <p className="text-sm sm:text-base text-slate-400">Compare grid-tied net metering with independent battery energy storage.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* On-Grid Card */}
          <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">On-Grid Rooftop System</h3>
                  <p className="text-sm text-slate-400">Net metering with DISCOM</p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Govt Subsidy Eligible
              </span>
            </div>
            <ul className="space-y-3.5 text-sm sm:text-base text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Exports surplus generation back to the grid for monthly billing credit.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Lowest lifetime CAPEX with zero recurring battery replacement cost.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Central Government DBT PM Surya Ghar subsidy up to ₹78,000.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>20-Year linear panel power output warranty.</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm sm:text-base">
              <span className="text-slate-400">Payback period:</span>
              <span className="font-bold text-emerald-400 text-base sm:text-lg">~2.8 to 3.5 years</span>
            </div>
          </div>

          {/* Off-Grid Card */}
          <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                  <BatteryCharging className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">Off-Grid Solar System</h3>
                  <p className="text-sm text-slate-400">Battery energy storage included</p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                24x7 Power Backup
              </span>
            </div>
            <ul className="space-y-3.5 text-sm sm:text-base text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Complete power independence from DISCOM power cuts and grid outages.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>High-capacity tubular or LiFePO4 lithium battery energy storage options.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Ideal for farmhouses, manufacturing workshops, and areas with unreliable power.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                <span>Heavy-duty pure sine wave inverter with MPPT charger.</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm sm:text-base">
              <span className="text-slate-400">Payback period:</span>
              <span className="font-bold text-slate-200 text-base sm:text-lg">~4.0 to 5.2 years</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: SOLAR SAVINGS CALCULATOR & BOOKING */}
      <section id="calculator" className="grid lg:grid-cols-12 gap-8 lg:gap-10 p-8 sm:p-10 lg:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">Smart Sizing Engine</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Interactive Solar Savings Calculator</h2>
            <p className="text-sm sm:text-base text-slate-400">Slide to your monthly electricity bill to calculate system capacity and annual savings.</p>
          </div>

          {/* Bill Slider */}
          <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-sm sm:text-base text-slate-200 font-semibold">Average Monthly Electricity Bill:</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400 tracking-tight font-sans">₹{billAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="25000" 
              step="500"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value))}
              className="w-full accent-amber-500 h-3 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 font-mono">
              <span>₹1,000/mo</span>
              <span>₹10,000/mo</span>
              <span>₹25,000/mo</span>
            </div>
          </div>

          {/* Roof Area Slider */}
          <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-sm sm:text-base text-slate-200 font-semibold">Usable Roof Area (Shadow-Free):</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400 tracking-tight font-sans">{roofArea} sq.ft</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              step="50"
              value={roofArea}
              onChange={(e) => setRoofArea(Number(e.target.value))}
              className="w-full accent-amber-500 h-3 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 font-mono">
              <span>100 sq.ft (~1 kW)</span>
              <span>800 sq.ft (~8 kW)</span>
              <span>2,000 sq.ft (~20 kW)</span>
            </div>
          </div>

          {/* System Type Selector */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSystemType('ON_GRID')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-bold border transition-all ${
                systemType === 'ON_GRID'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Grid (Net Metering)
            </button>
            <button
              type="button"
              onClick={() => setSystemType('OFF_GRID')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-bold border transition-all whitespace-nowrap ${
                systemType === 'OFF_GRID'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Off-Grid (Battery Storage)
            </button>
          </div>

          {/* Dynamic Metrics Output - Perfectly Proportioned To Never Overflow Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 min-w-0 overflow-hidden flex flex-col justify-between space-y-1">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Recommended</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white font-sans truncate">{recommendedKw} kW</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">~{recommendedKw * 80} sq.ft</p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 min-w-0 overflow-hidden flex flex-col justify-between space-y-1">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Monthly Savings</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-emerald-400 font-sans truncate">₹{estimatedMonthlySavings.toLocaleString('en-IN')}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">₹{annualSavings.toLocaleString('en-IN')}/yr</p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 min-w-0 overflow-hidden flex flex-col justify-between space-y-1">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Govt Subsidy</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-amber-400 font-sans truncate">₹{subsidy.toLocaleString('en-IN')}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Direct DBT</p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 min-w-0 overflow-hidden flex flex-col justify-between space-y-1">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Payback</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-200 font-sans truncate">{paybackYears} yrs</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Free power after</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 min-w-0 overflow-hidden flex flex-col justify-between space-y-1">
              <p className="text-[11px] sm:text-xs text-amber-400 font-bold truncate">25-Yr Savings</p>
              <p className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-amber-400 font-sans truncate">₹{(twentyFiveYearSavings / 100000).toFixed(2)} L</p>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Net lifetime gain</p>
            </div>
          </div>
        </div>

        {/* SECTION 8: CONTACT & ENQUIRY BOOKING */}
        <div id="contact" className="lg:col-span-5 bg-slate-950 p-7 sm:p-9 lg:p-10 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl sm:text-2xl text-white">Book Free Roof Survey</h3>
            <p className="text-sm text-slate-400">A certified technician measures shadow angles and structural roof stability.</p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm text-slate-200 font-semibold block mb-1.5">Homeowner / Company Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Gurpreet Singh"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs sm:text-sm text-slate-200 font-semibold block mb-1.5">Mobile Phone *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-slate-200 font-semibold block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-slate-200 font-semibold block mb-1.5">Site Address & City *</label>
              <textarea 
                rows="2"
                required
                placeholder="e.g. 45-B, Model Town, Jalandhar, Punjab"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <input 
                type="checkbox" 
                id="subsidy_cb"
                checked={form.subsidy_requested}
                onChange={(e) => setForm({ ...form, subsidy_requested: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="subsidy_cb" className="text-xs sm:text-sm text-slate-300 cursor-pointer font-medium">
                Apply for Central Govt PM Surya Ghar Subsidy
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {submitting ? 'Scheduling survey...' : `Confirm survey for ${recommendedKw} kW system`}
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 7: PM SURYA GHAR SUBSIDY INFORMATION */}
      <section id="subsidy" className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">National Solar Mission</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">PM Surya Ghar: Muft Bijli Yojana Subsidy Structure</h2>
          <p className="text-sm sm:text-base text-slate-400">
            Direct Benefit Transfer (DBT) deposited straight into the homeowner's registered bank account post commissioning.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-amber-400">Tier 1: 1 kW System</span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono">₹30,000</div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Flat central DBT subsidy for residential installations up to 1 kW capacity.</p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-amber-400">Tier 2: 2 kW System</span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono">₹60,000</div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Flat central DBT subsidy for residential installations up to 2 kW capacity.</p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-amber-400">Tier 3: 3 kW to 10 kW</span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono">₹78,000</div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Maximum capped DBT central government subsidy for 3 kW and higher systems.</p>
          </div>
        </div>
      </section>

      {/* FOOTER & DIRECT CONTACT INFO */}
      <footer className="pt-12 border-t border-slate-800 grid sm:grid-cols-3 gap-8 text-sm sm:text-base text-slate-400">
        <div className="space-y-3">
          <div className="font-bold text-white text-base sm:text-lg">SunPower Solutions India</div>
          <p>Turnkey Solar EPC & Smart Asset Management.</p>
          <p>Completing ~40 rooftop installations monthly.</p>
        </div>
        <div className="space-y-3">
          <div className="font-bold text-white text-base sm:text-lg">Service Hubs</div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" /> Jalandhar, Punjab (Main Depot)</div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" /> Delhi NCR (Sales & Engineering)</div>
        </div>
        <div className="space-y-3">
          <div className="font-bold text-white text-base sm:text-lg">Get in Touch</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400 flex-shrink-0" /> +91 181 405 8890 / +91 98765 43210</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-400 flex-shrink-0" /> contact@sunpower.in</div>
        </div>
      </footer>
    </div>
  );
}
