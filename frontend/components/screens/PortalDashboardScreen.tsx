'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Truck,
  ShieldCheck,
  Compass,
  Receipt,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  X,
  Search,
  Landmark,
  BatteryCharging,
  Leaf,
  FileDown,
  MessageSquare,
  CreditCard,
  Activity,
  Users,
  Sun,
} from 'lucide-react';
import {
  CAPACITY_TABLE_ROWS,
  HOTLINKED_IMAGES,
  SOLAR_PACKAGES,
  type ScreenId,
  type UserRole,
} from '@/lib/solar-data';
import { SolarImage } from '@/components/SolarImage';
import {
  calculateQuotationBOM,
  calculateSolarMetrics,
  formatINR,
  type GridType,
  type RoofArchitecture,
  type SubsidyScheme,
} from '@/lib/solar-logic';
import { SEED_USERS } from '@/lib/solar-users';
import { downloadQuotationPdf } from '@/lib/pdf-qr-comms';
import { QrCodeDisplay } from '@/components/QrCodeDisplay';
import {
  ShareCommsModal,
  type ShareCommsPayload,
} from '@/components/ShareCommsModal';

interface PortalDashboardScreenProps {
  onNavigate: (screen: ScreenId, options?: { invoiceId?: string }) => void;
  onShowToast: (message: string) => void;
  activeRole?: UserRole;
  userName?: string;
}

export function PortalDashboardScreen({
  onNavigate,
  onShowToast,
  activeRole = 'Customer',
  userName = 'Customer',
}: PortalDashboardScreenProps) {
  // Calculator State
  const [monthlyBill, setMonthlyBill] = useState(4500);
  const [scheme, setScheme] = useState<SubsidyScheme>('pmsuryaghar');
  const [roofType, setRoofType] = useState<RoofArchitecture>('rcc');
  const [gridType, setGridType] = useState<GridType>('ongrid');

  // Quote Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [billInput, setBillInput] = useState('');
  const [roofArea, setRoofArea] = useState('');
  const [roofSurface, setRoofSurface] = useState('RCC Flat Roof');
  const [systemPref, setSystemPref] = useState(
    '3kW On-Grid Rooftop System (EcoSync)'
  );
  const [timeline, setTimeline] = useState('Immediate (Within 7 Days)');
  const [includeBattery, setIncludeBattery] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [submittedQuote, setSubmittedQuote] = useState<{
    name: string;
    phone: string;
    email: string;
    system: string;
    ref: string;
    kw: number;
  } | null>(null);
  const [sharePayload, setSharePayload] = useState<ShareCommsPayload | null>(
    null
  );

  // Modals State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [subsidyModalOpen, setSubsidyModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('SUN-2025-9842');
  const [activeTrackingId, setActiveTrackingId] = useState('SUN-2025-9842');

  const calc = useMemo(
    () =>
      calculateSolarMetrics({
        monthlyBillInr: monthlyBill,
        scheme,
        roofType,
        gridType,
      }),
    [monthlyBill, scheme, roofType, gridType]
  );

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleApplyCalcToForm = () => {
    setBillInput(
      `${formatINR(monthlyBill)} / mo (Recommended: ${calc.recommendedKw} kW System)`
    );
    setRoofArea(`~${calc.roofAreaSqFt} sq.ft`);
    if (gridType === 'hybrid') {
      setIncludeBattery(true);
      setSystemPref('5kW Hybrid Smart Inverter with Battery');
    } else if (calc.recommendedKw >= 4.5) {
      setSystemPref('5kW On-Grid MasterPower System');
    } else {
      setSystemPref('3kW On-Grid Rooftop System (EcoSync)');
    }
    if (activeRole === 'Customer') {
      onShowToast('Solar capacity calculation applied to your proposal.');
      onNavigate('quotation-engine');
      return;
    }
    onShowToast('Solar capacity calculation applied to feasibility request.');
    scrollToElement('feasibility-quote-form');
  };

  const handleSelectPackage = (systemValue: string) => {
    setSystemPref(systemValue);
    if (activeRole === 'Customer') {
      onShowToast(`Selected ${systemValue} proposal.`);
      onNavigate('quotation-engine');
      return;
    }
    onShowToast(`Selected ${systemValue} for feasibility quote.`);
    scrollToElement('feasibility-quote-form');
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `SUN-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const matchedKw = parseInt(systemPref, 10);
    const kw = Number.isFinite(matchedKw) && matchedKw >= 1 ? matchedKw : 3;
    setSubmittedQuote({
      name: fullName.trim() || 'Valued Customer',
      phone: phoneNumber.trim() || '+91 98100 10001',
      email: emailAddress.trim() || 'rajesh.sharma@sunpower.in',
      system: systemPref,
      ref,
      kw,
    });
    onShowToast(`Inquiry registered successfully! Ref: ${ref}`);
  };

  const handleDownloadFeasibilityPdf = async () => {
    if (!submittedQuote) return;
    const bom = calculateQuotationBOM(submittedQuote.kw);
    await downloadQuotationPdf({
      quote: bom,
      quoteId: submittedQuote.ref,
      customerName: submittedQuote.name,
      customerPhone: submittedQuote.phone,
      customerEmail: submittedQuote.email,
    });
    onShowToast(`Downloaded ${submittedQuote.ref}-SunPower-Quotation.pdf with QR.`);
  };

  const handleOpenQuoteShare = () => {
    if (!submittedQuote) return;
    const bom = calculateQuotationBOM(submittedQuote.kw);
    setSharePayload({
      title: `Feasibility Quote ${submittedQuote.ref}`,
      recipientName: submittedQuote.name,
      defaultPhone: submittedQuote.phone,
      defaultEmail: submittedQuote.email,
      subject: `SunPower Feasibility Quotation (${submittedQuote.ref}) — ${submittedQuote.system}`,
      message: `Hello ${submittedQuote.name},\n\nThank you for registering your rooftop solar inquiry (${submittedQuote.ref}) with SunPower Solutions Pvt Ltd.\n\nSelected System: ${submittedQuote.system}\nEst. On-Grid Gross: ${formatINR(bom.onGridGross)}\nPM Surya Ghar Subsidy: -${formatINR(bom.subsidy)}\nNet Turnkey Investment: ${formatINR(bom.onGridNet)}\n\nOur certified field engineer will confirm your LiDAR inspection slot shortly.`,
      qrValue: `SUNPOWER|QUOTE|${submittedQuote.ref}|${submittedQuote.kw}KW|NET:${bom.onGridNet}`,
      qrLabel: `Verify ${submittedQuote.ref}`,
    });
  };

  return (
    <div className="relative bg-transparent bg-architectural-dots">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-20">
        {/* SECTION 1: HERO WITH EARTH SHOWCASE */}
        <section
          id="hero"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-8rem)]"
        >
          <div className="lg:col-span-7 bg-[#ffffff]/84 border border-[#c2c9bc]/60 p-8 sm:p-11 rounded-3xl shadow-sm space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
              1kW–5kW Rooftop Solar Systems · MNRE Channel Partner
            </p>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.25rem] tracking-tight text-[#141e1c] leading-[0.92] text-balance">
              ON-GRID &amp; <span className="text-[#0e7a66]">HYBRID</span> SOLAR POWER
            </h1>

            <p className="font-display tracking-wide text-xl text-[#141e1c]">
              SunPower Solutions Pvt Ltd · Residential &amp; Commercial Rooftops
            </p>

            <p className="text-sm sm:text-base text-[#42493f] leading-relaxed max-w-xl">
              Complete end-to-end solar installation management—from instant savings calculation and government subsidy filing to certified rooftop commissioning.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {activeRole === 'Admin' ? (
                <button
                  type="button"
                  onClick={() => scrollToElement('feasibility-quote-form')}
                  className="px-6 py-3.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>Get Solar Quote</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('quotation-engine')}
                    className="px-6 py-3.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <span>My System Proposal</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('billing-payments')}
                    className="px-5 py-3.5 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Invoices &amp; Pay</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => scrollToElement('savings-calculator')}
                className="px-5 py-3.5 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] text-[#141e1c] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                <span>Savings Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f4f3f0] text-[#141e1c] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Truck className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                <span>Track Order</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
                <p className="text-[11px] uppercase font-bold tracking-wider text-[#42493f] mb-1">
                  System Range
                </p>
                <p className="font-display text-3xl text-[#141e1c] leading-none tabular-nums">
                  1kW–5kW
                </p>
                <span className="text-[11px] text-[#0e7a66] font-semibold mt-1 block">
                  On-Grid &amp; Hybrid
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
                <p className="text-[11px] uppercase font-bold tracking-wider text-[#42493f] mb-1">
                  Govt Subsidy
                </p>
                <p className="font-display text-3xl text-[#141e1c] leading-none tabular-nums">
                  Up to 40%
                </p>
                <button
                  type="button"
                  onClick={() => setSubsidyModalOpen(true)}
                  className="text-[11px] text-[#0e7a66] font-semibold mt-1 hover:underline text-left"
                >
                  MNRE Approved · Details
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
                <p className="text-[11px] uppercase font-bold tracking-wider text-[#42493f] mb-1">
                  Bill Savings
                </p>
                <p className="font-display text-3xl text-[#141e1c] leading-none tabular-nums">
                  85–90%
                </p>
                <span className="text-[11px] text-[#42493f] font-medium mt-1 block">
                  Estimated ROI
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Open space showcasing background ScrollGlobe */}
          <div
            className="lg:col-span-5 flex flex-col items-center justify-center"
            aria-hidden="true"
          />
        </section>

        {/* SPATIAL GLASSMORPHIC TELEMETRY SUMMARY STRIP */}
        <section
          aria-label="Spatial Operations & Payment Summary"
          className="bg-[#ffffff]/86 backdrop-blur-md border border-[#c2c9bc]/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          {activeRole === 'Customer' ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0e7a66]">
                    Connected Rooftop System · Real-Time Telemetry
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl text-[#001601] leading-none mt-1">
                    MY ROOFTOP SOLAR PLANT &amp; ENERGY SAVINGS
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('quotation-engine')}
                    className="px-4 py-2.5 rounded-xl bg-[#002e03] hover:bg-[#001601] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Activity className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
                    <span>My System Proposal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate('billing-payments', {
                        invoiceId: 'SP-INV-ADITYA-CUST',
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                    <span>Pay Advance via Razorpay</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    <span>Rooftop System</span>
                    <Sun className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
                  </div>
                  <p className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    5.0 kWp
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    RCC Roof · Grid Synchronized
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Daily Solar Generation
                  </p>
                  <p className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    22.4 kWh
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    Optimal Sun Hour Yield
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Monthly Grid Savings
                  </p>
                  <p className="font-display text-3xl text-[#0e7a66] mt-1 tabular-nums">
                    ₹4,850
                  </p>
                  <p className="text-[11px] text-[#42493f] font-medium">
                    Net Meter Bi-directional Export
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Performance Warranty
                  </p>
                  <p className="font-display text-3xl text-[#001601] mt-1">
                    25-Year
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    Linear Power Warranty Active
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0e7a66]">
                    Glassy Spatial Telemetry · Central Fleet Command
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl text-[#001601] leading-none mt-1">
                    FLEET OVERVIEW &amp; REAL-TIME SETTLEMENTS
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('operations-analytics')}
                    className="px-4 py-2.5 rounded-xl bg-[#002e03] hover:bg-[#001601] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Activity className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
                    <span>Open Analytics &amp; Operations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate('billing-payments', {
                        invoiceId: 'SP-INV-2025-4198',
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                    <span>Billing &amp; Payments</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    <span>Total Database Records</span>
                    <Users className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
                  </div>
                  <p className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    395 Records
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    Across 21 Relational Tables
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Active Fleet Pipeline
                  </p>
                  <p className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    1.48 MWp
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    38 Active Solar Leads
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Advance &amp; Direct Settlements
                  </p>
                  <p className="font-display text-3xl text-[#0e7a66] mt-1 tabular-nums">
                    30 Payments
                  </p>
                  <p className="text-[11px] text-[#42493f] font-medium">
                    Verified Gateway Transactions
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f6]/90 border border-[#e3e2df]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#42493f]">
                    Comms &amp; Dispatch
                  </p>
                  <p className="font-display text-3xl text-[#001601] mt-1">
                    17 Active
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-semibold">
                    Live Dispatch Gate Passes
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        {/* SECTION 2: CERTIFIED SOLAR PACKAGES & COMPARISON TABLE */}
        <section
          id="products-catalog"
          className="relative overflow-hidden bg-[#ffffff]/86 border border-[#c2c9bc]/60 rounded-3xl p-6 sm:p-10 shadow-sm"
        >
          {/* Low-Opacity Solar Panels Background */}
          <div
            className="absolute inset-0 pointer-events-none select-none z-0 opacity-[0.16]"
            aria-hidden="true"
          >
            <SolarImage
              src={HOTLINKED_IMAGES.quoteAlmmPanels}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
                  Engineered Solar Catalog · 1kW–5kW
                </p>
                <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-[#141e1c] leading-none text-balance">
                  CERTIFIED SOLAR <span className="text-[#0e7a66]">PACKAGES &amp; SYSTEMS</span>
                </h2>
                <p className="text-sm text-[#42493f] leading-relaxed">
                  Choose from pre-engineered turnkey packages or compare standard modular system capacities with full MNRE PM Surya Ghar subsidy compatibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('quotation-engine')}
                className="px-4 py-2.5 rounded-xl bg-[#f4f3f0]/95 hover:bg-[#e9e8e5] text-[#001601] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider whitespace-nowrap self-start md:self-auto"
              >
                Inspect Full BOM Breakdown
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOLAR_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-6 rounded-2xl flex flex-col justify-between bg-[#faf9f6]/90 ${
                    pkg.featured
                      ? 'border-2 border-[#0e7a66]'
                      : 'border border-[#c2c9bc]/70'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold uppercase tracking-wider text-[#42493f]">
                        {pkg.tierLabel}
                      </span>
                      <span className="font-semibold text-[#0e7a66]">
                        {pkg.badgeLabel}
                        {pkg.featured ? ' · Popular' : ''}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl text-[#141e1c]">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-[#42493f] mt-1">{pkg.description}</p>
                    <ul className="mt-4 space-y-2 text-xs text-[#1a1c1a]">
                      {pkg.specs.map((spec) => (
                        <li key={spec} className="flex items-start gap-2">
                          <span className="text-[#0e7a66] font-bold">·</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="border-t border-[#e3e2df] pt-4 mb-4">
                      <p className="text-[11px] text-[#42493f] uppercase font-bold">
                        Turnkey Net Estimate
                      </p>
                      <p className="font-display text-3xl text-[#0e7a66] tabular-nums mt-0.5">
                        {pkg.netEstimate}{' '}
                        {pkg.grossStrike && (
                          <span className="text-sm font-sans text-[#72796e] line-through ml-1">
                            {pkg.grossStrike}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.systemSelectValue)}
                      className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                        pkg.featured
                          ? 'bg-[#0e7a66] hover:bg-[#085244] text-white'
                          : 'bg-[#001601] hover:bg-[#002e03] text-white'
                      }`}
                    >
                      Select {pkg.title.split(' ')[0]} System
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Standard Capacity Matrix */}
            <div className="overflow-x-auto rounded-2xl border border-[#e3e2df]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f4f3f0]/95 text-[#42493f] font-bold uppercase text-[11px] tracking-wider border-b border-[#e3e2df]">
                    <th className="py-3.5 px-4">System</th>
                    <th className="py-3.5 px-4">Roof Req.</th>
                    <th className="py-3.5 px-4">Monthly Units</th>
                    <th className="py-3.5 px-4">Govt Subsidy</th>
                    <th className="py-3.5 px-4 text-right">Net Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e2df] text-[#1a1c1a] tabular-nums">
                  {CAPACITY_TABLE_ROWS.map((row) => (
                    <tr
                      key={row.system}
                      className={
                        row.highlight
                          ? 'bg-[#bcebc0]/40 hover:bg-[#bcebc0]/55'
                          : 'bg-[#ffffff]/90 hover:bg-[#faf9f6]'
                      }
                    >
                      <td className="py-3.5 px-4 font-bold text-[#141e1c]">
                        {row.system}
                      </td>
                      <td className="py-3.5 px-4">{row.roof}</td>
                      <td className="py-3.5 px-4">{row.units}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0e7a66]">
                        {row.subsidy}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {row.net}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: WORKFLOW OVERVIEW CARDS (SURVEY, DISPATCH, WARRANTY) - ADMIN ONLY */}
        {activeRole === 'Admin' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="survey">
          {/* Site Survey Card */}
          <div className="bg-[#ffffff]/84 border border-[#c2c9bc]/60 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
                01 · Site Survey &amp; Quotation
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-[#141e1c] leading-none">
                PRECISION ROOF INSPECTION &amp; CUSTOM QUOTES
              </h2>
              <p className="text-xs sm:text-sm text-[#42493f] leading-relaxed">
                Certified field engineers evaluate roof geometry, shadow-free area, and cable routing for instant itemized BOM approval.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#f4f3f0]">
                  <Compass className="w-5 h-5 text-[#0e7a66] mb-2" aria-hidden="true" />
                  <h3 className="font-display text-lg text-[#141e1c]">
                    Direction &amp; Shade
                  </h3>
                  <p className="text-[11px] text-[#42493f] mt-0.5">
                    Azimuth direction, tilt angle &amp; usable area.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f4f3f0]">
                  <Receipt className="w-5 h-5 text-[#0e7a66] mb-2" aria-hidden="true" />
                  <h3 className="font-display text-lg text-[#141e1c]">
                    Cable &amp; BOM
                  </h3>
                  <p className="text-[11px] text-[#42493f] mt-0.5">
                    AC/DC cable run &amp; automated BOM pricing.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('site-survey-engineering')}
              className="w-full py-3 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] text-[#001601] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Open Survey &amp; Engineering Desk
            </button>
          </div>

          {/* Dispatch & Commissioning Card */}
          <div className="bg-[#ffffff]/84 border border-[#c2c9bc]/60 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
                02 · Order, Dispatch &amp; Installation
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-[#141e1c] leading-none">
                TRACKED DISPATCH TO COMMISSIONING
              </h2>
              <p className="text-xs sm:text-sm text-[#42493f] leading-relaxed">
                Every solar panel and inverter is scanned via QR/barcode before dispatch, with live voltage testing and digital handover.
              </p>
              <div className="p-4 rounded-xl bg-[#f4f3f0] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Milestone: Testing &amp; Commissioning</span>
                  <span className="text-[#0e7a66] tabular-nums">92%</span>
                </div>
                <div className="w-full bg-[#e3e2df] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0e7a66] h-full rounded-full w-[92%]" />
                </div>
                <p className="text-[11px] text-[#42493f]">
                  QR Serialized Packing · Certified Technician Assigned
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('installation-dispatch')}
              className="w-full py-3 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] text-[#001601] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Open Installation &amp; Dispatch
            </button>
          </div>

          {/* 25-Year Warranty Card */}
          <div className="bg-[#ffffff]/84 border border-[#c2c9bc]/60 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
                03 · Warranty &amp; Care
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-[#141e1c] leading-none">
                25-YEAR WARRANTY &amp; 24-HR SLA
              </h2>
              <p className="text-xs sm:text-sm text-[#42493f] leading-relaxed">
                Serialized components are registered in the Warranty Vault upon commissioning with 24-hour field technician dispatch.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#f4f3f0]">
                  <ShieldCheck className="w-5 h-5 text-[#0e7a66] mb-1.5" aria-hidden="true" />
                  <p className="font-display text-2xl text-[#141e1c] leading-none">
                    25 Years
                  </p>
                  <p className="text-[11px] text-[#42493f] mt-1">
                    Linear Performance
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f4f3f0]">
                  <Phone className="w-5 h-5 text-[#0e7a66] mb-1.5" aria-hidden="true" />
                  <p className="font-display text-2xl text-[#141e1c] leading-none">
                    24-Hr SLA
                  </p>
                  <p className="text-[11px] text-[#42493f] mt-1">
                    Priority Tech Crew
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('service-warranty')}
              className="w-full py-3 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] text-[#001601] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Open Service &amp; Warranty Desk
            </button>
          </div>
        </section>
        )}

        {/* SECTION 4: INTERACTIVE SAVINGS & SUBSIDY CALCULATOR */}
        <section
          id="savings-calculator"
          className="bg-[#ffffff]/84 border border-[#c2c9bc]/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#bcebc0] text-[#00210b] flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl text-[#141e1c] leading-none">
                  Solar Savings &amp; Subsidy Calculator
                </h2>
                <p className="text-xs sm:text-sm text-[#42493f] mt-1">
                  Configure your bill, subsidy program, and roof structure to compute upfront subsidy, payback period, and 25-year return.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#0e7a66] whitespace-nowrap">
              Real-Time DISCOM Algorithm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <label
                htmlFor="calc-scheme"
                className="block text-[11px] uppercase font-bold text-[#42493f] mb-1.5"
              >
                Subsidy Program
              </label>
              <select
                id="calc-scheme"
                value={scheme}
                onChange={(e) => setScheme(e.target.value as SubsidyScheme)}
                className="w-full bg-[#ffffff] px-3 py-2 rounded-lg border border-[#c2c9bc] text-xs font-semibold text-[#141e1c] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              >
                <option value="pmsuryaghar">PM Surya Ghar (National)</option>
                <option value="commercial">Commercial / Tax Depr.</option>
                <option value="nosubsidy">Direct / Off-Grid Only</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <label
                htmlFor="calc-roof"
                className="block text-[11px] uppercase font-bold text-[#42493f] mb-1.5"
              >
                Roof Architecture
              </label>
              <select
                id="calc-roof"
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as RoofArchitecture)}
                className="w-full bg-[#ffffff] px-3 py-2 rounded-lg border border-[#c2c9bc] text-xs font-semibold text-[#141e1c] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              >
                <option value="rcc">RCC Flat Roof (Optimal)</option>
                <option value="tinshed">Industrial Tin Shed</option>
                <option value="tiled">Tiled / Pitched Roof</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <label
                htmlFor="calc-grid"
                className="block text-[11px] uppercase font-bold text-[#42493f] mb-1.5"
              >
                System Type
              </label>
              <select
                id="calc-grid"
                value={gridType}
                onChange={(e) => setGridType(e.target.value as GridType)}
                className="w-full bg-[#ffffff] px-3 py-2 rounded-lg border border-[#c2c9bc] text-xs font-semibold text-[#141e1c] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              >
                <option value="ongrid">On-Grid (Net-Metered)</option>
                <option value="hybrid">Hybrid (+Battery Backup)</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
            <div className="flex justify-between items-center text-xs font-bold text-[#141e1c] mb-3">
              <label htmlFor="calc-bill-slider">Monthly Electricity Bill:</label>
              <span className="text-[#0e7a66] text-xl font-display tracking-wide tabular-nums">
                {formatINR(monthlyBill)} / mo
              </span>
            </div>
            <input
              id="calc-bill-slider"
              type="range"
              min={1000}
              max={30000}
              step={500}
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(Number(e.target.value))}
              className="w-full accent-[#0e7a66] cursor-pointer h-2 bg-[#e3e2df] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#72796e] mt-2 font-mono-tabular">
              <span>₹1,000</span>
              <span>₹15,000</span>
              <span>₹30,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <p className="text-[11px] uppercase font-bold text-[#42493f]">
                Recommended Size
              </p>
              <p className="font-display text-3xl text-[#141e1c] tabular-nums mt-1">
                {calc.recommendedKw} kW
              </p>
              <p className="text-[11px] text-[#42493f]">
                ~{calc.roofAreaSqFt} sq.ft area
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <p className="text-[11px] uppercase font-bold text-[#42493f]">
                Govt Subsidy
              </p>
              <p className="font-display text-3xl text-[#0e7a66] tabular-nums mt-1">
                {formatINR(calc.subsidyAmount)}
              </p>
              <p className="text-[11px] text-[#42493f]">
                {scheme === 'pmsuryaghar'
                  ? 'PM Surya Ghar'
                  : scheme === 'commercial'
                  ? '40% Tax Deprec.'
                  : 'No Subsidy'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <p className="text-[11px] uppercase font-bold text-[#42493f]">
                Annual Bill Offset
              </p>
              <p className="font-display text-3xl text-[#0e7a66] tabular-nums mt-1">
                {formatINR(calc.annualSavings)}
              </p>
              <p className="text-[11px] text-[#42493f]">Direct DISCOM credit</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df]">
              <p className="text-[11px] uppercase font-bold text-[#42493f]">
                Payback Period
              </p>
              <p className="font-display text-3xl text-[#141e1c] tabular-nums mt-1">
                {calc.paybackYears} Yrs
              </p>
              <p className="text-[11px] text-[#0e7a66] font-semibold">
                Free Power After Payback
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#bcebc0]/25 border border-[#0e7a66]/25 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#42493f] block">
                  Gross Turnkey Investment
                </span>
                <span className="font-display text-2xl text-[#141e1c] tabular-nums">
                  {formatINR(calc.grossCost)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e7a66] block">
                  Estimated Net Payable
                </span>
                <span className="font-display text-2xl text-[#0e7a66] tabular-nums">
                  {formatINR(calc.netCost)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#bcebc0]/25 border border-[#0e7a66]/25 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#42493f] block">
                  25-Yr Lifetime Savings
                </span>
                <span className="font-display text-2xl text-[#0e7a66] tabular-nums">
                  {formatINR(calc.lifetimeSavings)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#42493f] block">
                  Lifetime CO₂ Offset
                </span>
                <span className="font-display text-2xl text-[#141e1c] tabular-nums">
                  {calc.co2OffsetTonnes} Tonnes
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleApplyCalcToForm}
              className="px-6 py-3 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Apply Sizing To Quote Form
            </button>
            <button
              type="button"
              onClick={() => setTrackingModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] text-[#141e1c] border border-[#c2c9bc] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Verify Existing Installation
            </button>
          </div>
        </section>

        {/* SECTION 5: FEASIBILITY & QUOTE FORM - ADMIN ONLY */}
        {activeRole === 'Admin' && (
          <section
            id="feasibility-quote-form"
            className="max-w-3xl mx-auto bg-[#ffffff]/84 border border-[#c2c9bc]/70 rounded-3xl p-6 sm:p-10 shadow-sm"
          >
          {!submittedQuote ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66] mb-2">
                Get Itemized Feasibility &amp; Quote
              </p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-[#141e1c] leading-none mb-3">
                REQUEST SOLAR <span className="text-[#0e7a66]">FEASIBILITY</span> &amp; QUOTE
              </h2>
              <p className="text-xs sm:text-sm text-[#42493f] mb-8">
                Fill in your rooftop specifications below. Our solar engineer will generate a shadow analysis report, estimated subsidy deduction, and custom financial plan within 2 hours.
              </p>

              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-full-name"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Full Name <span className="text-[#0e7a66]">*</span>
                    </label>
                    <input
                      id="quote-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quote-phone"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Phone Number <span className="text-[#0e7a66]">*</span>
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Email Address <span className="text-[#0e7a66]">*</span>
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="vikram@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quote-bill"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Monthly Electricity Bill <span className="text-[#0e7a66]">*</span>
                    </label>
                    <input
                      id="quote-bill"
                      type="text"
                      required
                      value={billInput}
                      onChange={(e) => setBillInput(e.target.value)}
                      placeholder="e.g. ₹4,500 / month"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-roof-area"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Estimated Roof Area (Sq. Ft)
                    </label>
                    <input
                      id="quote-roof-area"
                      type="text"
                      value={roofArea}
                      onChange={(e) => setRoofArea(e.target.value)}
                      placeholder="e.g. 350 sq.ft (approx.)"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quote-roof-type"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Roof Surface Type
                    </label>
                    <select
                      id="quote-roof-type"
                      value={roofSurface}
                      onChange={(e) => setRoofSurface(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    >
                      <option value="RCC Flat Roof">RCC Concrete Flat Roof</option>
                      <option value="Industrial Tin / Metal Shed">
                        Industrial Tin / Metal Shed
                      </option>
                      <option value="Tiled / Slanted Roof">Tiled / Slanted Roof</option>
                      <option value="Open Elevated Terrace">Open Elevated Terrace</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-system"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      System Preference <span className="text-[#0e7a66]">*</span>
                    </label>
                    <select
                      id="quote-system"
                      value={systemPref}
                      onChange={(e) => setSystemPref(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    >
                      <option value="3kW On-Grid Rooftop System (EcoSync)">
                        3kW On-Grid Rooftop System (EcoSync)
                      </option>
                      <option value="5kW On-Grid MasterPower System">
                        5kW On-Grid MasterPower System
                      </option>
                      <option value="5kW Hybrid Smart Inverter with Battery">
                        5kW Hybrid Smart Inverter with Battery
                      </option>
                      <option value="10kW Commercial Solar Microgrid">
                        10kW Commercial Solar Microgrid
                      </option>
                      <option value="Custom Engineered System (Site Survey Req)">
                        Custom Engineered System (Site Survey Req)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="quote-timeline"
                      className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                    >
                      Installation Timeline
                    </label>
                    <select
                      id="quote-timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    >
                      <option value="Immediate (Within 7 Days)">
                        Immediate (Within 7 Days)
                      </option>
                      <option value="This Month">This Month</option>
                      <option value="Within 2–3 Months">Within 2–3 Months</option>
                      <option value="Exploring Feasibility & Subsidy">
                        Exploring Feasibility &amp; Subsidy
                      </option>
                    </select>
                  </div>
                </div>

                <label className="p-3.5 rounded-xl bg-[#f4f3f0] border border-[#e3e2df] flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#141e1c]">
                    <BatteryCharging className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                    <span>Include Lithium Battery Storage Backup (Hybrid)?</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeBattery}
                    onChange={(e) => setIncludeBattery(e.target.checked)}
                    className="w-4 h-4 accent-[#0e7a66]"
                  />
                </label>

                <div>
                  <label
                    htmlFor="quote-requirements"
                    className="block text-xs font-bold text-[#141e1c] uppercase tracking-wider mb-1"
                  >
                    Message / Specific Site Requirements
                  </label>
                  <textarea
                    id="quote-requirements"
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Tell us about your rooftop type or specific backup requirements..."
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-[#42493f]">
                    100% Free On-Site Inspection · Direct MNRE Subsidy Support
                  </span>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Submit Feasibility Request</span>
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#bcebc0] text-[#0e7a66] flex items-center justify-center mb-5">
                <Leaf className="w-10 h-10" aria-hidden="true" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0e7a66] mb-2">
                Clean Energy Pioneer Registered
              </p>
              <h3 className="font-display text-4xl sm:text-5xl text-[#141e1c] mb-3 leading-tight text-balance">
                Congratulations,{' '}
                <span className="text-[#0e7a66]">
                  You have taken a greener step in future.
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-[#42493f] max-w-lg mb-6 leading-relaxed">
                Thank you, <strong className="text-[#141e1c]">{submittedQuote.name}</strong>! Your solar feasibility inquiry has been dispatched to our engineering team. A certified surveyor will contact you within 2 hours.
              </p>

              <div className="p-4 rounded-2xl bg-[#f4f3f0] border border-[#e3e2df] max-w-md w-full mb-6 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#42493f] font-semibold">
                    Reference Tracking No:
                  </span>
                  <span className="font-mono-tabular font-bold text-[#0e7a66]">
                    {submittedQuote.ref}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#42493f] font-semibold">
                    Selected System:
                  </span>
                  <span className="font-semibold text-[#1a1c1a]">
                    {submittedQuote.system}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#42493f] font-semibold">
                    Projected Carbon Offset:
                  </span>
                  <span className="font-bold text-[#0e7a66]">
                    ~4.2 Tonnes CO₂ / year
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <QrCodeDisplay
                  value={`SUNPOWER|FEASIBILITY|${submittedQuote.ref}|${submittedQuote.name}|${submittedQuote.kw}KW`}
                  size={120}
                  caption={`Inquiry QR · ${submittedQuote.ref}`}
                  downloadName={`${submittedQuote.ref}-QR.png`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadFeasibilityPdf}
                  className="px-5 py-3 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <FileDown className="w-4 h-4" aria-hidden="true" />
                  <span>Download Quote PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenQuoteShare}
                  className="px-5 py-3 rounded-xl bg-[#002e03] hover:bg-[#001601] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
                  <span>WhatsApp / Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate('billing-payments', {
                      invoiceId: 'SP-INV-2025-4198',
                    })
                  }
                  className="px-5 py-3 rounded-xl bg-[#faf9f6] border border-[#0e7a66] text-[#0e7a66] hover:bg-[#bcebc0]/25 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4" aria-hidden="true" />
                  <span>Pay Booking Advance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTrackingId(submittedQuote.ref);
                    setTrackingQuery(submittedQuote.ref);
                    setTrackingModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-[#141e1c] text-xs font-bold uppercase tracking-wider"
                >
                  Track This Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedQuote(null);
                    setFullName('');
                    setPhoneNumber('');
                    setEmailAddress('');
                    setBillInput('');
                    setRequirements('');
                  }}
                  className="px-5 py-3 rounded-xl bg-[#001601] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          )}
        </section>
        )}

        {/* SECTION 6: HEADQUARTERS MAP & LOCATION SHOWCASE - ADMIN ONLY */}
        {activeRole === 'Admin' && (
        <section
          id="map"
          className="bg-[#ffffff]/84 border border-[#c2c9bc]/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66] mb-1">
                Global Presence &amp; Operations
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-[#141e1c] leading-none">
                SUNPOWER SOLUTIONS <span className="text-[#0e7a66]">HEADQUARTERS</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#42493f] max-w-xl mt-2">
                Visit our clean technology campus, live solar telemetry command center, and demonstration testing lab.
              </p>
            </div>
            <span className="text-xs font-mono-tabular font-semibold text-[#0e7a66]">
              28.6280° N, 77.3649° E · Sector 62, Noida
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
                <div className="flex items-center gap-2 text-[#0e7a66] mb-1">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#141e1c]">
                    Registered Campus
                  </span>
                </div>
                <p className="text-xs text-[#1a1c1a] font-semibold">
                  SunPower Solutions Pvt Ltd
                </p>
                <p className="text-xs text-[#42493f] mt-0.5">
                  Green Energy Corridor, Solar Tech Park, Sector 62, Noida, NCR 201309
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
                <div className="flex items-center gap-2 text-[#0e7a66] mb-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#141e1c]">
                    Office &amp; Survey Hours
                  </span>
                </div>
                <p className="text-xs text-[#1a1c1a] font-semibold">
                  Mon – Sat: 9:00 AM – 7:30 PM
                </p>
                <p className="text-xs text-[#42493f] mt-0.5">
                  24/7 Grid Monitoring &amp; Emergency Dispatch
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
                <span className="font-bold text-xs uppercase tracking-wider text-[#141e1c] block mb-1">
                  Solar Irradiance Baseline
                </span>
                <p className="font-mono-tabular text-xs text-[#0e7a66] font-bold">
                  5.4 kWh/m²/day
                </p>
                <p className="text-[11px] text-[#42493f] mt-0.5">
                  Dispatch Radius: 120 km NCR Corridor
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-[#c2c9bc] overflow-hidden relative min-h-[280px] bg-[#e8f0ec] p-6 flex flex-col justify-between">
              <svg
                className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                aria-hidden="true"
              >
                <path
                  d="M -50 160 Q 250 110 700 220"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="10"
                />
                <path
                  d="M 320 -50 L 320 450"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                />
              </svg>
              <div className="relative z-10 flex justify-between items-center text-xs">
                <span className="px-3 py-1 rounded-lg bg-[#ffffff] border border-[#c2c9bc] font-bold text-[#141e1c]">
                  HQ Telemetry Command Center
                </span>
                <span className="font-semibold text-[#42493f]">Sector 62 Node</span>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
                <div className="w-11 h-11 rounded-full bg-[#0e7a66] text-white flex items-center justify-center border-2 border-white shadow-md">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="mt-2 bg-[#ffffff] px-4 py-1.5 rounded-xl text-center border border-[#c2c9bc]">
                  <p className="font-display text-base text-[#141e1c]">
                    SunPower Solutions HQ Campus
                  </p>
                  <p className="text-[11px] text-[#0e7a66] font-bold">
                    Main Dispatch &amp; Engineering Center
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex justify-between text-xs text-[#42493f] font-medium pt-3 border-t border-[#c2c9bc]/60">
                <span>Dispatch Radius: 120 km</span>
                <span className="text-[#0e7a66] font-bold tabular-nums">
                  64.8 kWh Generated Today
                </span>
              </div>
            </div>
          </div>
        </section>
        )}
      </div>

      {/* ORDER TRACKING MODAL */}
      {trackingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setTrackingModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Installation Tracking Portal"
        >
          <div
            className="w-full max-w-2xl bg-[#ffffff] border border-[#c2c9bc] rounded-3xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e3e2df]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#0e7a66] text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-[#141e1c] leading-none">
                    Installation Tracking Portal
                  </h3>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-[#0e7a66]">
                    Live DISCOM &amp; Technician Telemetry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                aria-label="Close Tracking Portal"
                className="w-9 h-9 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#1a1c1a] hover:bg-[#e9e8e5]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Order Tracking ID"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. SUN-2025-9842)"
                className="flex-1 px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs sm:text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              />
              <button
                type="button"
                onClick={() =>
                  setActiveTrackingId(trackingQuery.trim() || 'SUN-2025-9842')
                }
                className="px-5 py-3 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Track</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#bcebc0]/25 border border-[#0e7a66]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#141e1c]">
                Active · Stage 4 of 5 (Testing &amp; Pre-Commissioning)
              </span>
              <span className="font-mono-tabular font-bold text-[#0e7a66]">
                ID: {activeTrackingId}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
              {['Survey', 'Subsidy', 'Dispatch', 'Mounting', 'Grid Handover'].map(
                (stage, idx) => (
                  <div
                    key={stage}
                    className={`p-2.5 rounded-xl border ${
                      idx < 4
                        ? 'bg-[#0e7a66] text-white border-[#0e7a66]'
                        : 'bg-[#f4f3f0] text-[#42493f] border-[#e3e2df]'
                    }`}
                  >
                    <div className="font-bold">0{idx + 1}</div>
                    <div className="mt-0.5 truncate">{stage}</div>
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df] space-y-1">
                <p className="font-bold uppercase tracking-wider text-[#0e7a66]">
                  Lead Field Engineer
                </p>
                <p className="font-bold text-[#141e1c]">
                  Rajesh Kumar, Cert #IN-SOL-994
                </p>
                <p className="text-[#42493f]">SunPower NCR Installation Unit 04</p>
                <p className="pt-2 font-semibold text-[#0e7a66]">
                  ETA On-Site: Today, 2:30 PM
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df] space-y-1">
                <p className="font-bold uppercase tracking-wider text-[#0e7a66]">
                  Barcoded System Parts
                </p>
                <p className="font-mono-tabular text-[#1a1c1a]">
                  Inverter: SUN-INV-5K-0928
                </p>
                <p className="font-mono-tabular text-[#1a1c1a]">
                  Panels: TOPCon-550W (x9 Verified)
                </p>
                <p className="pt-2 font-semibold text-[#0e7a66]">
                  DISCOM Net-Meter: Approved &amp; Issued
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#e3e2df]">
              {activeRole === 'Admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackingModalOpen(false);
                    onNavigate('installation-dispatch');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-[#141e1c] text-xs font-bold uppercase tracking-wider"
                >
                  Open Full Dispatch Workbench
                </button>
              )}
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#001601] text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PM SURYA GHAR SUBSIDY MODAL */}
      {subsidyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setSubsidyModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="PM Surya Ghar Subsidy Portal"
        >
          <div
            className="w-full max-w-2xl bg-[#ffffff] border border-[#c2c9bc] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e3e2df]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#0e7a66] text-white flex items-center justify-center">
                  <Landmark className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-[#141e1c] leading-none">
                    PM Surya Ghar Subsidy Portal
                  </h3>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-[#0e7a66]">
                    Direct Benefit Transfer (DBT) Scheme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubsidyModalOpen(false)}
                aria-label="Close Subsidy Portal"
                className="w-9 h-9 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#1a1c1a]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
                <span className="text-[11px] font-bold text-[#42493f] uppercase block">
                  1 kW System
                </span>
                <p className="font-display text-3xl text-[#0e7a66] tabular-nums">
                  ₹30,000
                </p>
                <p className="text-[11px] text-[#42493f]">Fixed Subsidy Grant</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
                <span className="text-[11px] font-bold text-[#42493f] uppercase block">
                  2 kW System
                </span>
                <p className="font-display text-3xl text-[#0e7a66] tabular-nums">
                  ₹60,000
                </p>
                <p className="text-[11px] text-[#42493f]">Fixed Subsidy Grant</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#bcebc0]/35 border border-[#0e7a66]">
                <span className="text-[11px] font-bold text-[#0e7a66] uppercase block">
                  3 kW+ System
                </span>
                <p className="font-display text-3xl text-[#0e7a66] tabular-nums">
                  ₹78,000
                </p>
                <p className="text-[11px] text-[#141e1c] font-semibold">
                  Maximum Subsidy Cap
                </p>
              </div>
            </div>

            <ul className="text-xs text-[#42493f] space-y-2 bg-[#f4f3f0] p-4 rounded-2xl">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                <span>Automatic DISCOM feasibility check and technical sanction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                <span>Document filing on National Portal for Rooftop Solar</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                <span>Direct subsidy disbursement within 30 days of inspection</span>
              </li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubsidyModalOpen(false);
                  if (activeRole === 'Customer') {
                    onNavigate('quotation-engine');
                  } else {
                    scrollToElement('feasibility-quote-form');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0e7a66] text-white text-xs font-bold uppercase tracking-wider"
              >
                {activeRole === 'Customer' ? 'View My Subsidy Proposal' : 'Apply for Subsidy'}
              </button>
              <button
                type="button"
                onClick={() => setSubsidyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#001601] text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareCommsModal
        open={Boolean(sharePayload)}
        payload={sharePayload}
        onClose={() => setSharePayload(null)}
        onShowToast={onShowToast}
      />
    </div>
  );
}
