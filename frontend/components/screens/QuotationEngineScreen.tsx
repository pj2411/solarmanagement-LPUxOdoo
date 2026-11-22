'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Gauge,
  BatteryCharging,
  Leaf,
  Zap,
  CheckCircle2,
  Download,
  Share2,
  CalendarCheck,
  Star,
  Sun,
  Cpu,
  Grid,
  Shield,
  Handshake,
  Wrench,
  CreditCard,
} from 'lucide-react';
import { HOTLINKED_IMAGES, type ScreenId } from '@/lib/solar-data';
import { calculateQuotationBOM, formatINR } from '@/lib/solar-logic';
import { downloadQuotationPdf } from '@/lib/pdf-qr-comms';
import { SolarImage } from '@/components/SolarImage';
import {
  ShareCommsModal,
  type ShareCommsPayload,
} from '@/components/ShareCommsModal';

interface QuotationEngineScreenProps {
  onNavigate: (screen: ScreenId, options?: { invoiceId?: string }) => void;
  onShowToast: (message: string) => void;
}

const PRESET_TABS = [
  { kw: 1, label: '1 kW Mono PERC' },
  { kw: 2, label: '2 kW High-Yield' },
  { kw: 3, label: '3 kW EcoSync (Recommended)', recommended: true },
  { kw: 4, label: '4 kW PeakPro' },
  { kw: 5, label: '5 kW MasterPower Enterprise' },
];

export function QuotationEngineScreen({
  onNavigate,
  onShowToast,
}: QuotationEngineScreenProps) {
  const [selectedKw, setSelectedKw] = useState<number>(3);
  const [customKwText, setCustomKwText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [sharePayload, setSharePayload] = useState<ShareCommsPayload | null>(null);

  const quote = useMemo(() => calculateQuotationBOM(selectedKw), [selectedKw]);

  const handlePresetClick = (kw: number) => {
    setSelectedKw(kw);
    setCustomKwText('');
    setIsCustomMode(false);
  };

  const handleCustomInput = (val: string) => {
    setCustomKwText(val);
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 100) {
      setSelectedKw(parsed);
      setIsCustomMode(true);
    }
  };

  const renderBomIcon = (icon: string) => {
    switch (icon) {
      case 'solar_power':
        return <Sun className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'power_input':
        return <Cpu className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'grid_view':
        return <Grid className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'flash_on':
        return <Zap className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'security':
        return <Shield className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'handshake':
        return <Handshake className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      default:
        return <Wrench className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66]">
            Live Quotation Engine · ID: SP-QT-2025-4198
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide uppercase text-[#001601] leading-none text-balance">
            Solar Quotation &amp; System Generator
          </h1>
          <p className="text-xs sm:text-sm text-[#42493f] max-w-2xl">
            Automated Bill of Materials (BOM), On-Grid &amp; Off-Grid Pricing, MNRE Subsidies, and Instant Customer Approval Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#f4f3f0] border border-[#e3e2df] px-4 py-2.5 rounded-xl shrink-0">
          <ShieldCheck className="w-6 h-6 text-[#0e7a66]" aria-hidden="true" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
              Validity Period
            </div>
            <div className="text-xs font-semibold text-[#1a1c1a]">
              Valid for 14 Days · Till 28 Mar 2025
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Selector Bar */}
      <div className="bg-[#f4f3f0] border border-[#e3e2df] p-2.5 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {PRESET_TABS.map((tab) => {
              const active = !isCustomMode && selectedKw === tab.kw;
              return (
                <button
                  key={tab.kw}
                  type="button"
                  onClick={() => handlePresetClick(tab.kw)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-[#002e03] text-white'
                      : 'bg-[#ffffff] text-[#42493f] border border-[#e3e2df] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
                  }`}
                >
                  {tab.recommended && (
                    <Star className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-[#ffffff] border border-[#c2c9bc] rounded-xl px-3 py-2">
            <label
              htmlFor="custom-kw-input"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#42493f] whitespace-nowrap"
            >
              Custom kW:
            </label>
            <input
              id="custom-kw-input"
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={customKwText}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder="e.g. 7.5"
              className="w-16 text-xs font-semibold text-[#001601] bg-transparent focus:outline-none tabular-nums"
            />
            <span className="text-xs text-[#42493f] font-medium">kWp</span>
          </div>
        </div>
      </div>

      {/* Main Comparison Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: On-Grid Net-Metered System */}
        <div className="lg:col-span-6 bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0e7a66] mb-1">
                  DISCOM Interconnected · Class-A Rooftop
                </p>
                <h2 className="font-display text-3xl sm:text-4xl uppercase text-[#001601] leading-none tracking-wide">
                  On-Grid Net-Metered System
                </h2>
              </div>
              <span className="w-11 h-11 rounded-xl bg-[#efeeeb] flex items-center justify-center text-[#001601] shrink-0">
                <Gauge className="w-6 h-6" aria-hidden="true" />
              </span>
            </div>

            <p className="text-xs text-[#42493f] leading-relaxed">
              Direct sync with city utility grid via bi-directional net-meter. Maximizes financial payback by feeding surplus generation into DISCOM network at regulated solar feed-in tariffs.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  PV Modules
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  {quote.onGridPanelCount}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-medium mt-0.5">
                  25-Yr Performance Guarantee
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Inverter Spec
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  {quote.onGridInverter}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-medium mt-0.5">
                  Dual MPPT · 98.4% Efficiency
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Net Metering
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  Bi-Directional 3-Phase Meter
                </div>
                <div className="text-[10px] text-[#42493f] mt-0.5">
                  Includes DISCOM CEIG Approval
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Mounting Substructure
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  Anodized Al 6005-T5 (HDG)
                </div>
                <div className="text-[10px] text-[#42493f] mt-0.5">
                  Wind rated up to 160 km/h
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#efeeeb] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-[#001601] text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                    Est. Monthly Generation
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#1a1c1a] tabular-nums">
                    {quote.estMonthlyUnits}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                  Annual Bill Relief
                </div>
                <div className="text-sm font-bold text-[#0e7a66] tabular-nums">
                  {quote.annualSavings}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#faf9f6] border border-[#e3e2df] space-y-2 text-xs tabular-nums">
            <div className="flex justify-between text-[#42493f]">
              <span>Gross Turnkey Project Cost:</span>
              <span className="font-semibold text-[#1a1c1a]">
                {formatINR(quote.onGridGross)}
              </span>
            </div>
            <div className="flex justify-between text-[#0e7a66] font-medium">
              <span>MNRE DBT CFA Direct Subsidy:</span>
              <span className="font-bold">- {formatINR(quote.subsidy)}</span>
            </div>
            <div className="flex justify-between text-[#42493f] text-[11px]">
              <span>State Green Energy Cess Exemption:</span>
              <span>- {formatINR(quote.stateCessExemption)}</span>
            </div>
            <div className="pt-3 border-t border-[#e3e2df] flex justify-between items-baseline">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#42493f]">
                  Net Effective Payable:
                </span>
                <div className="text-[10px] text-[#42493f]">
                  Inclusive of GST @ 13.8% composite
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl text-[#001601] leading-none">
                  {formatINR(quote.onGridNet)}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-semibold mt-0.5">
                  Zero-Down EMI from ₹2,390/mo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Hybrid & Battery Storage System */}
        <div className="lg:col-span-6 bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#42493f] mb-1">
                  24/7 Grid Resilient + ESS · Self-Sustaining
                </p>
                <h2 className="font-display text-3xl sm:text-4xl uppercase text-[#001601] leading-none tracking-wide">
                  Hybrid &amp; Battery Storage System
                </h2>
              </div>
              <span className="w-11 h-11 rounded-xl bg-[#efeeeb] flex items-center justify-center text-[#001601] shrink-0">
                <BatteryCharging className="w-6 h-6" aria-hidden="true" />
              </span>
            </div>

            <p className="text-xs text-[#42493f] leading-relaxed">
              Zero-blackout continuous solar architecture paired with smart lithium battery management. Automatically switches between Solar, LiFePO4 ESS, and Grid with sub-10ms cutover.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Battery Energy Storage
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  {quote.hybridBattery}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-medium mt-0.5">
                  6,000+ Cycles · 10-Yr Replacement
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Inverter Configuration
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  {quote.hybridInverter}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-medium mt-0.5">
                  Integrated EPS Emergency Output
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  Backup Autonomy
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  14.5 Hours Essential Loads
                </div>
                <div className="text-[10px] text-[#42493f] mt-0.5">
                  Runs 1.5T Inverter AC + Fridge + Lights
                </div>
              </div>
              <div className="p-3.5 bg-[#f4f3f0] rounded-xl">
                <div className="text-[10px] font-semibold uppercase text-[#42493f] tracking-wider">
                  BMS Intelligence
                </div>
                <div className="text-xs font-bold text-[#1a1c1a] mt-0.5">
                  CAN/RS485 Telemetry · IoT
                </div>
                <div className="text-[10px] text-[#42493f] mt-0.5">
                  Active thermal cell balancing
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#efeeeb] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-[#001601] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                    Blackout Immunity
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#1a1c1a]">
                    100% Micro-Grid Uptime
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                  Diesel Generator Offset
                </div>
                <div className="text-sm font-bold text-[#0e7a66]">
                  Zero Fumes · ₹0 Fuel
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#faf9f6] border border-[#e3e2df] space-y-2 text-xs tabular-nums">
            <div className="flex justify-between text-[#42493f]">
              <span>Gross Hybrid System Cost (with ESS):</span>
              <span className="font-semibold text-[#1a1c1a]">
                {formatINR(quote.hybridGross)}
              </span>
            </div>
            <div className="flex justify-between text-[#0e7a66] font-medium">
              <span>MNRE Subsidy (Applicable on Solar Portion):</span>
              <span className="font-bold">- {formatINR(quote.subsidy)}</span>
            </div>
            <div className="flex justify-between text-[#42493f] text-[11px]">
              <span>LiFePO4 Safe Harbor Tax Credit:</span>
              <span>- {formatINR(quote.hybridSafeHarborCredit)}</span>
            </div>
            <div className="pt-3 border-t border-[#e3e2df] flex justify-between items-baseline">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#42493f]">
                  Net Investment Payable:
                </span>
                <div className="text-[10px] text-[#42493f]">
                  Includes Inverter, LiFePO4 Rack, Wiring
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl text-[#001601] leading-none">
                  {formatINR(quote.hybridNet)}
                </div>
                <div className="text-[10px] text-[#0e7a66] font-semibold mt-0.5">
                  Solar Loans available from SBI/Canara
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Card Hardware & Engineering Visual Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#f4f3f0] border border-[#e3e2df] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
            <SolarImage
              src={HOTLINKED_IMAGES.quoteAlmmPanels}
              alt="Monocrystalline solar panels installed on a modern residential terrace"
              fallbackLabel="ALMM Panels"
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#42493f]">
              Certified Hardware
            </div>
            <div className="text-sm font-bold text-[#1a1c1a]">
              ALMM &amp; BIS Approved
            </div>
            <div className="text-xs text-[#42493f] mt-1 leading-snug">
              Tier-1 TOPCon half-cut cells with anti-reflective nanotech glass coating.
            </div>
          </div>
        </div>

        <div className="bg-[#f4f3f0] border border-[#e3e2df] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
            <SolarImage
              src={HOTLINKED_IMAGES.quoteIotInverter}
              alt="Technician testing solar hybrid inverter and lithium energy storage rack"
              fallbackLabel="IoT Telemetry"
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#42493f]">
              Digital Telemetry
            </div>
            <div className="text-sm font-bold text-[#1a1c1a]">
              IoT Cloud Monitoring
            </div>
            <div className="text-xs text-[#42493f] mt-1 leading-snug">
              Real-time smartphone telemetry app for string currents, generation &amp; grid feed.
            </div>
          </div>
        </div>

        <div className="bg-[#f4f3f0] border border-[#e3e2df] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
            <SolarImage
              src={HOTLINKED_IMAGES.quoteAerialMapping}
              alt="Aerial roof view of solar array layout with clear azimuth angles"
              fallbackLabel="3D Shadow Mapping"
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#42493f]">
              Precision Engineering
            </div>
            <div className="text-sm font-bold text-[#1a1c1a]">
              3D Shadow Mapping
            </div>
            <div className="text-xs text-[#42493f] mt-1 leading-snug">
              Civil structure with elevated walkway brackets for ease of monthly panel cleaning.
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Bill of Materials (BOM) Breakdown Table */}
      <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0e7a66]">
              Engineering Precision
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-[#001601]">
              Itemized Bill of Materials (BOM) &amp; Execution Costing
            </h3>
            <p className="text-xs text-[#42493f]">
              Calculated specifically for{' '}
              <strong className="text-[#1a1c1a]">{quote.label}</strong> system architecture.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-[#efeeeb] text-xs font-semibold text-[#1a1c1a] shrink-0">
            Tax Invoice Standard: GST 18%/12% Bundled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f4f3f0] text-[#42493f] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 rounded-l-xl">Item Description</th>
                <th className="py-3 px-4">Specification / Make</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e2df] tabular-nums">
              {quote.bomItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf9f6] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#1a1c1a]">
                    <div className="flex items-center gap-2">
                      {renderBomIcon(item.icon)}
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#42493f]">{item.spec}</td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular">
                    {formatINR(item.unitPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold">
                    {item.qtyLabel}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono-tabular">
                    {formatINR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#f4f3f0] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#42493f]">
            <CheckCircle2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>
              Includes 5-Year Comprehensive Onsite Maintenance (AMC) &amp; Generation Warranty
            </span>
          </div>
          <div className="text-right tabular-nums">
            <span className="text-[#42493f] font-medium mr-2">
              Total Estimated BOM Value:
            </span>
            <span className="text-base font-bold text-[#1a1c1a] font-mono-tabular">
              {formatINR(quote.onGridGross)}
            </span>
          </div>
        </div>
      </div>

      {/* Subsidy & Incentive Summary Card */}
      <div className="bg-[#f4f3f0] border border-[#e3e2df] rounded-2xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0e7a66] block">
              PM Surya Ghar: Muft Bijli Yojana
            </span>
            <h3 className="font-display text-3xl uppercase tracking-wide text-[#001601] leading-tight">
              Central &amp; State Financial Assistance
            </h3>
            <p className="text-xs text-[#42493f] leading-relaxed">
              Direct Benefit Transfer (DBT) funds are credited straight into the customer&apos;s Aadhaar-linked bank account within 30 days of DISCOM meter commissioning.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
            <div className="bg-[#ffffff] border border-[#e3e2df] p-4 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                Central Govt CFA Subsidy
              </div>
              <div className="font-display text-3xl text-[#0e7a66] mt-1">
                {formatINR(quote.subsidy)}
              </div>
              <div className="text-[10px] text-[#42493f] mt-1">
                Direct Bank Transfer under MNRE
              </div>
            </div>
            <div className="bg-[#ffffff] border border-[#e3e2df] p-4 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-[#42493f] tracking-wider">
                State DISCOM Rebate
              </div>
              <div className="font-display text-3xl text-[#001601] mt-1">
                {formatINR(quote.stateDiscomRebate)}
              </div>
              <div className="text-[10px] text-[#42493f] mt-1">
                Annual tariff adjustment credit
              </div>
            </div>
            <div className="bg-[#001601] p-4 rounded-xl text-white">
              <div className="text-[10px] uppercase font-semibold text-[#bdf0b0] tracking-wider">
                Net Out-Of-Pocket
              </div>
              <div className="font-display text-3xl text-white mt-1">
                {formatINR(quote.subsidyNetInvest)}
              </div>
              <div className="text-[10px] text-white/80 mt-1">
                ROI Estimated in 2.9 Years
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="w-10 h-10 rounded-xl bg-[#002e03] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-bold text-[#1a1c1a]">
              SunPower Executive Quote Reference:{' '}
              <span className="font-mono-tabular text-[#0e7a66]">
                SP-QT-2025-4198
              </span>
            </div>
            <div className="text-[11px] text-[#42493f]">
              MNRE Channel Partner ID: DL/2023/SOL-88291 · Digital Stamp Affixed
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            type="button"
            onClick={async () => {
              await downloadQuotationPdf({
                quote,
                quoteId: 'SP-QT-2025-4198',
              });
              onShowToast(
                'Official SunPower quotation PDF with embedded QR generated & downloaded.'
              );
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#efeeeb] text-[#1a1c1a] hover:bg-[#e3e2df] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download PDF Quotation</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setSharePayload({
                title: `Quotation SP-QT-2025-4198 (${quote.label})`,
                recipientName: 'Rajesh Sharma',
                defaultPhone: '+91 98100 10001',
                defaultEmail: 'rajesh.sharma@sunpower.in',
                subject: `SunPower Quotation SP-QT-2025-4198 · ${quote.label}`,
                message: `Dear Rajesh Sharma,\n\nPlease review your SunPower Solar Quotation (SP-QT-2025-4198):\n• System: ${quote.label}\n• On-Grid Gross: ${formatINR(quote.onGridGross)} | MNRE Subsidy: -${formatINR(quote.subsidy)}\n• Net Effective Payable: ${formatINR(quote.onGridNet)}\n• Est. Annual Savings: ${quote.annualSavings}\n\nLet us know when you would like to confirm your site survey or booking milestone.\n\nRegards,\nSunPower Solutions`,
                qrValue: `SUNPOWER|QUOTE|SP-QT-2025-4198|${quote.kw}KW|NET:${quote.onGridNet}`,
                qrLabel: 'SP-QT-2025-4198',
              })
            }
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#efeeeb] text-[#1a1c1a] hover:bg-[#e3e2df] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Share2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>Send WhatsApp / Gmail</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onShowToast('Opening Billing & Payment Gateway for SP-QT-2025-4198.');
              onNavigate('billing-payments', { invoiceId: 'SP-QT-2025-4198' });
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0e7a66] text-white hover:bg-[#085244] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            <span>Pay / Billing</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onShowToast(
                `Quote SP-QT-2025-4198 (${quote.label}) approved! Opening Site Survey.`
              );
              onNavigate('site-survey-engineering');
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#001601] text-white hover:bg-[#002e03] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <CalendarCheck className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
            <span>Approve &amp; Book Site Survey</span>
          </button>
        </div>
      </div>

      <ShareCommsModal
        open={Boolean(sharePayload)}
        payload={sharePayload}
        onClose={() => setSharePayload(null)}
        onShowToast={onShowToast}
      />
    </div>
  );
}
