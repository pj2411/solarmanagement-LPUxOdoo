'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  PlusCircle,
  Download,
  CheckCircle2,
  Info,
  ChevronRight,
  ShieldCheck,
  FileText,
  Receipt,
  Send,
  Timer,
  AlertTriangle,
  KeyRound,
  MessageSquare,
  Package,
  X,
} from 'lucide-react';
import {
  HOTLINKED_IMAGES,
  INITIAL_SERVICE_TICKETS,
  type ServiceTicket,
} from '@/lib/solar-data';
import {
  closeServiceTicketWithOtp,
  createServiceTicket,
  filterServiceTickets,
  type TicketFilter,
} from '@/lib/solar-logic';
import {
  downloadCsvFile,
  downloadWarrantyCertificatePdf,
} from '@/lib/pdf-qr-comms';
import { SolarImage } from '@/components/SolarImage';
import {
  ShareCommsModal,
  type ShareCommsPayload,
} from '@/components/ShareCommsModal';

interface ServiceWarrantyScreenProps {
  onShowToast: (message: string) => void;
}

export function ServiceWarrantyScreen({
  onShowToast,
}: ServiceWarrantyScreenProps) {
  const [tickets, setTickets] = useState<ServiceTicket[]>(
    INITIAL_SERVICE_TICKETS
  );
  const [filter, setFilter] = useState<TicketFilter>('all');

  // Ticket Form State
  const [category, setCategory] = useState('Panel Cleaning');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High Priority'>(
    'Medium'
  );
  const [capacity, setCapacity] = useState('5 kW Rooftop');
  const [customerName, setCustomerName] = useState('Sunil Verma');
  const [description, setDescription] = useState('');

  // Modals
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [mpptModalOpen, setMpptModalOpen] = useState(false);
  const [closureOtp, setClosureOtp] = useState(['8', '4', '1', '9']);
  const [closureError, setClosureError] = useState<string | null>(null);
  const [sharePayload, setSharePayload] = useState<ShareCommsPayload | null>(null);

  const formCardRef = useRef<HTMLDivElement | null>(null);

  const openTicketForClosure = useMemo(
    () => tickets.find((t) => t.status !== 'Resolved') || tickets[0],
    [tickets]
  );

  const filteredTickets = useMemo(
    () => filterServiceTickets(tickets, filter),
    [tickets, filter]
  );

  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomNum = Math.floor(8900 + Math.random() * 1000);
    const created = createServiceTicket({
      category,
      severity,
      capacity,
      customerName,
      description,
      ticketNumber: randomNum,
    });
    setTickets((prev) => [created, ...prev]);
    setDescription('');
    onShowToast(`Ticket ${created.id} dispatched to on-call technician!`);
  };

  const handleAuthorizeClosure = () => {
    if (!openTicketForClosure) return;
    const result = closeServiceTicketWithOtp(
      tickets,
      openTicketForClosure.id,
      closureOtp
    );
    if (!result.ok) {
      setClosureError(result.error || 'Invalid OTP.');
      return;
    }
    setTickets(result.tickets);
    setClosureError(null);
    setOtpModalOpen(false);
    onShowToast(
      `Customer OTP Verified! Ticket ${openTicketForClosure.id} marked Closed.`
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      {/* Top Context & Header Banner */}
      <div className="rounded-2xl bg-[#f4f3f0] border border-[#c2c9bc]/60 p-6 lg:p-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0e7a66]">
            Module 10 &amp; 11 Engine · Munich Re Backed · Telemetry Sync Live (Node 04)
          </p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide uppercase text-[#001601] leading-none text-balance">
            Service, Warranty &amp; Maintenance Desk
          </h1>
          <p className="text-sm sm:text-base text-[#42493f] max-w-2xl">
            25-Year Warranty Vault, Automated Fault Code Monitoring, Technician Ticketing &amp; Ticket Closure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              formCardRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }
            className="px-4 py-2.5 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Raise Urgent Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadCsvFile(
                'sunpower-fleet-sla-logs.csv',
                ['Ticket ID', 'Issue Type', 'Customer', 'Capacity/Location', 'Technician', 'SLA Clock', 'Severity', 'Status'],
                tickets.map((t) => [
                  t.id,
                  t.issueType,
                  t.customerName,
                  t.capacityLocation,
                  t.technician,
                  t.slaClock,
                  t.severity,
                  t.statusLabel,
                ])
              );
              onShowToast('Fleet SLA diagnostic logs exported as CSV.');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#e3e2df] hover:bg-[#dbdad7] text-[#1a1c1a] text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export Fleet SLA Logs</span>
          </button>
        </div>
      </div>

      {/* Telemetry & System Health Micro-Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 rounded-xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#42493f] font-semibold">
              Active Fleet Array Status
            </span>
            <div className="font-display text-3xl text-[#001601] flex items-baseline gap-2 tabular-nums">
              <span>99.4%</span>
              <span className="text-xs font-sans font-normal text-[#42493f]">
                Operational Health
              </span>
            </div>
            <p className="text-xs text-[#42493f] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
              <span>All 12 Modules Normal &amp; Synchronized</span>
            </p>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 -rotate-90"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e9e8e5"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0e7a66"
                strokeDasharray="99.4, 100"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <div className="md:col-span-8 rounded-xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#bcebc0] text-[#264f30] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[#0e7a66]">
                  Telemetry Alert #FLT-3091
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#42493f]">09:14 AM Today</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#1a1c1a]">
                Notice: Slight Grid Overvoltage detected on Phase-1 (252V) — Auto-cleared by Inverter MPPT at 09:14 AM.
              </p>
              <p className="text-xs text-[#42493f]">
                Phase balance re-established. DISCOM node stabilized within ±1.5% margin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMpptModalOpen(true)}
            className="text-xs font-semibold text-[#0e7a66] hover:text-[#001601] flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Inverter MPPT Log</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* SECTION 1: Warranty Vault & Asset Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
              Module 10 Core Assets
            </span>
            <h2 className="font-display text-2xl lg:text-3xl uppercase tracking-wide text-[#001601]">
              Certified Warranty Vault &amp; Underwriting
            </h2>
          </div>
          <div className="text-xs text-[#42493f] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>Secured by Munich Reinsurance Policy #IN-SOL-99420-X</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Warranty Card */}
          <div className="lg:col-span-2 rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-6 lg:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-[#0e7a66] uppercase">
                    Photovoltaic Array Safeguard
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-[#001601] uppercase tracking-wide mt-1">
                    25-Year Linear Performance Warranty
                  </h3>
                  <p className="text-xs sm:text-sm text-[#42493f] mt-1">
                    Monocrystalline N-Type Bi-Facial Array with 0.40% Annual Degradation Guarantee.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#264f30] bg-[#bcebc0] px-3 py-1 rounded-lg">
                  Active &amp; Insured (Munich Re)
                </span>
              </div>

              <div className="bg-[#f4f3f0] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#1a1c1a]">
                    Yield Output Guarantee Index
                  </span>
                  <span className="font-semibold text-[#001601] tabular-nums">
                    87.4% Output at Year 25 (Min Guaranteed)
                  </span>
                </div>
                <div className="w-full h-16">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 500 70"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,5 Q125,12 250,22 T500,42 L500,70 L0,70 Z"
                      fill="#bcebc0"
                      fillOpacity="0.45"
                    />
                    <path
                      d="M0,5 Q125,12 250,22 T500,42"
                      fill="none"
                      stroke="#0e7a66"
                      strokeWidth="2.5"
                    />
                    <circle cx="0" cy="5" r="4" fill="#001601" />
                    <circle cx="250" cy="22" r="3.5" fill="#0e7a66" />
                    <circle cx="500" cy="42" r="4" fill="#002e03" />
                  </svg>
                </div>
                <div className="flex justify-between text-[11px] text-[#42493f] font-mono-tabular">
                  <span>Yr 1: 98.0%</span>
                  <span>Yr 10: 93.5%</span>
                  <span>Yr 25: 87.4%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                <div className="bg-[#faf9f6] border border-[#e3e2df] rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#42493f]">
                    Policy Inception
                  </span>
                  <p className="font-semibold text-xs sm:text-sm text-[#1a1c1a] mt-0.5">
                    Nov 15, 2024
                  </p>
                </div>
                <div className="bg-[#faf9f6] border border-[#e3e2df] rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#42493f]">
                    Policy Expiry
                  </span>
                  <p className="font-semibold text-xs sm:text-sm text-[#1a1c1a] mt-0.5">
                    Nov 14, 2049
                  </p>
                </div>
                <div className="bg-[#faf9f6] border border-[#e3e2df] rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#42493f]">
                    Coverage Cap
                  </span>
                  <p className="font-semibold text-xs sm:text-sm text-[#1a1c1a] mt-0.5">
                    ₹ 14,50,000
                  </p>
                </div>
                <div className="bg-[#faf9f6] border border-[#e3e2df] rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#42493f]">
                    Underwriter
                  </span>
                  <p className="font-semibold text-xs sm:text-sm text-[#1a1c1a] mt-0.5">
                    Munich Re Direct
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e3e2df] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono-tabular text-[#42493f]">
                SHA-256 Cert Hash: 9d82...f7a1
              </span>
              <button
                type="button"
                onClick={async () => {
                  await downloadWarrantyCertificatePdf({
                    policyNo: '#IN-SOL-99420-X',
                    arraySerial: 'SP-IN-2024-5K',
                    customerName: 'Rajesh Sharma (Vasant Kunj)',
                    inceptionDate: 'Nov 15, 2024',
                    expiryDate: 'Nov 14, 2049',
                    coverageCap: '₹ 14,50,000',
                    certHash: '9d82a40c71be88e3f7a1',
                  });
                  onShowToast(
                    'Official 25-Year Warranty Certificate (PDF with QR) downloaded.'
                  );
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>Download Official Warranty Certificate (PDF)</span>
              </button>
            </div>
          </div>

          {/* Right Stack */}
          <div className="space-y-6 flex flex-col">
            <div className="flex-1 rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#0e7a66]">
                    BOS Infrastructure
                  </span>
                  <span className="font-semibold text-[#264f30]">Active</span>
                </div>
                <h3 className="font-display text-2xl text-[#001601] tracking-wide uppercase">
                  12-Year Replacement Warranty
                </h3>
                <p className="text-xs text-[#42493f]">
                  Hybrid Grid-Tied Inverter with Rapid Shutdown &amp; Integrated AFCI Module.
                </p>
                <div className="bg-[#f4f3f0] p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#42493f]">Valid Term:</span>
                    <span className="font-semibold">Nov 2024 – Nov 2036</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#42493f]">OEM Unit Model:</span>
                    <span className="font-semibold">Solax X3-Hybrid G4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#42493f]">RMA Turnaround:</span>
                    <span className="font-semibold">72-Hour Express Swap</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onShowToast('Opened Solax X3-Hybrid G4 OEM Warranty Policy.')
                }
                className="w-full py-2.5 px-3 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-xs font-semibold text-[#1a1c1a] flex items-center justify-center gap-2 transition-colors"
              >
                <Receipt className="w-4 h-4" aria-hidden="true" />
                <span>View Solax OEM Policy Terms</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#efeeeb]">
                <SolarImage
                  src={HOTLINKED_IMAGES.commissionedSiteAsset}
                  alt="Commissioned solar panel rooftop installation in pristine condition"
                  fallbackLabel="Array SP-IN-2024-5K"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#42493f]">
                  Commissioned Site Asset
                </span>
                <h4 className="text-xs font-bold text-[#1a1c1a]">
                  Array Serial: SP-IN-2024-5K
                </h4>
                <p className="text-[11px] text-[#42493f]">
                  Verified with geo-stamped rooftop drone survey during grid commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Service Ticket Generator & Active Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket Creation Form */}
        <div
          ref={formCardRef}
          className="lg:col-span-5 rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-6 space-y-5"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-[#0e7a66] font-bold">
              Module 11 Ticketing Engine
            </span>
            <h2 className="font-display text-2xl lg:text-3xl uppercase tracking-wide text-[#001601]">
              Raise New Service Ticket
            </h2>
            <p className="text-xs text-[#42493f] mt-1">
              Dispatches certified technician crew under mandated 24-hr DISCOM SLA.
            </p>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="ticket-category"
                className="text-xs font-semibold text-[#1a1c1a] block"
              >
                Issue Category <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs sm:text-sm text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              >
                <option value="Panel Cleaning">
                  Solar Panel Soiling &amp; Deep Cleaning
                </option>
                <option value="Inverter Fault">
                  Inverter Fault / Telemetry Disconnection
                </option>
                <option value="Net Meter Billing Dispute">
                  Net Metering &amp; DISCOM Billing Discrepancy
                </option>
                <option value="Cable Maintenance">
                  Cable Tray, Earthing &amp; Junction Box Check
                </option>
                <option value="Linear Degradation Audit">
                  Linear Degradation / Yield Audit
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#1a1c1a] block">
                Severity Level
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High Priority'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                      severity === lvl
                        ? lvl === 'High Priority'
                          ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]'
                          : 'bg-[#002e03] text-white'
                        : 'bg-[#f4f3f0] text-[#42493f] hover:bg-[#e9e8e5]'
                    }`}
                  >
                    {lvl === 'Low'
                      ? 'Low Priority'
                      : lvl === 'Medium'
                      ? 'Medium'
                      : 'High (24h SLA)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="ticket-capacity"
                  className="text-xs font-semibold text-[#1a1c1a] block"
                >
                  System Capacity
                </label>
                <input
                  id="ticket-capacity"
                  type="text"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="ticket-custname"
                  className="text-xs font-semibold text-[#1a1c1a] block"
                >
                  Customer Name
                </label>
                <input
                  id="ticket-custname"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ticket-desc"
                className="text-xs font-semibold text-[#1a1c1a] block"
              >
                Observation &amp; Symptoms
              </label>
              <textarea
                id="ticket-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe inverter error codes, visual dust layers, tripped MCB breakers, or net-meter discrepancy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>SUBMIT SERVICE REQUEST TICKET</span>
            </button>
          </form>
        </div>

        {/* Active & Resolved Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
                  Real-Time Operational Log
                </span>
                <h3 className="font-display text-2xl uppercase tracking-wide text-[#001601]">
                  Active &amp; Resolved Ticket Queue
                </h3>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-[#002e03] text-white'
                      : 'bg-[#e3e2df] text-[#1a1c1a] hover:bg-[#dbdad7]'
                  }`}
                >
                  All ({tickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('open')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === 'open'
                      ? 'bg-[#002e03] text-white'
                      : 'bg-[#e3e2df] text-[#1a1c1a] hover:bg-[#dbdad7]'
                  }`}
                >
                  Open ({openCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('resolved')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === 'resolved'
                      ? 'bg-[#002e03] text-white'
                      : 'bg-[#e3e2df] text-[#1a1c1a] hover:bg-[#dbdad7]'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f4f3f0] text-[#42493f] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 rounded-l-lg">Ticket ID</th>
                    <th className="py-3 px-3">Issue Type</th>
                    <th className="py-3 px-3">Customer &amp; Cap</th>
                    <th className="py-3 px-3">Technician</th>
                    <th className="py-3 px-3">SLA Clock</th>
                    <th className="py-3 px-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e2df] tabular-nums">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="py-3 px-3 font-mono-tabular font-semibold text-[#001601]">
                        {t.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#1a1c1a]">
                          {t.issueType}
                        </div>
                        <div className="text-[10px] text-[#42493f]">
                          {t.issueSub}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#1a1c1a]">
                          {t.customerName}
                        </div>
                        <div className="text-[10px] text-[#42493f]">
                          {t.capacityLocation}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#bcebc0] text-[#264f30] flex items-center justify-center text-[10px] font-bold">
                            {t.technicianInitials}
                          </span>
                          <span className="font-medium">{t.technician}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {t.status === 'Investigation' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ba1a1a]">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{t.slaClock}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0e7a66]">
                            <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{t.slaClock}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-semibold ${
                            t.status === 'Resolved'
                              ? 'text-[#42493f]'
                              : t.status === 'Investigation'
                              ? 'text-[#245020]'
                              : 'text-[#0e7a66]'
                          }`}
                        >
                          {t.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-xs text-[#42493f]"
                      >
                        No service tickets match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Technician Operation & Replacement Control Banner */}
          <div className="rounded-2xl bg-[#002e03] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-md">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#bdf0b0]">
                Field Dispatch Engine · Geo-Fence: Delhi-NCR Sector
              </p>
              <h4 className="font-display text-2xl uppercase tracking-wide">
                Technician Assignment &amp; Fast-Track Actions
              </h4>
              <p className="text-xs text-white/80">
                Trigger automated WhatsApp flight plan with GPS route and digital sign-off OTP.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    'Emergency 24-Hr SLA Protocol initiated. Nearby crew alerted!'
                  )
                }
                className="px-4 py-3 rounded-xl bg-[#0e7a66] hover:bg-[#3e6846] text-white text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
              >
                DISPATCH EMERGENCY TECH (24-HR SLA)
              </button>
              <button
                type="button"
                onClick={() => setOtpModalOpen(true)}
                className="px-4 py-3 rounded-xl bg-[#ffffff]/15 hover:bg-[#ffffff]/25 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <KeyRound className="w-4 h-4" aria-hidden="true" />
                <span>CLOSE TICKET WITH CUSTOMER OTP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Field Tech Quick Drawer & Spares Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#e9e8e5] shrink-0">
                <SolarImage
                  src={HOTLINKED_IMAGES.techAmitKumar}
                  alt="Amit Kumar, Lead Solar BOS Technician"
                  fallbackLabel="Amit Kumar"
                />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#1a1c1a]">Amit Kumar</h5>
                <p className="text-[10px] text-[#42493f] uppercase">
                  Lead Solar BOS Tech · ID #TK-402
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#0e7a66]">
              En Route
            </span>
          </div>
          <div className="text-xs text-[#42493f] space-y-1 tabular-nums">
            <div className="flex justify-between">
              <span>Active Destination:</span>
              <span className="font-medium text-[#1a1c1a]">
                Vasant Kunj (TCK-8812)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Distance / ETA:</span>
              <span className="font-medium text-[#1a1c1a]">
                4.2 km · 18 min
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setSharePayload({
                title: 'Dispatch Alert · Amit Kumar (#TK-402)',
                recipientName: 'Amit Kumar (Lead Solar BOS Tech)',
                defaultPhone: '+91 98100 10004',
                defaultEmail: 'amit.kumar@sunpower.in',
                subject: 'Urgent Field Dispatch · Vasant Kunj (TCK-8812)',
                message:
                  'Hi Amit Kumar,\n\nPriority field dispatch assigned:\n• Ticket: #TCK-8812 (Marcus Reed · 5 kW Vasant Kunj)\n• ETA Target: 18 min (4.2 km)\n• Checklist: Annual Preventive Maint. & Customer OTP closure.\n\nPlease confirm site arrival.',
                qrValue: 'SUNPOWER|TECH-DISPATCH|TK-402|TCK-8812',
                qrLabel: 'Dispatch TCK-8812',
              })
            }
            className="w-full py-2.5 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-xs font-semibold text-[#1a1c1a] flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>Send WhatsApp / Gmail Alert</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#e9e8e5] shrink-0">
                <SolarImage
                  src={HOTLINKED_IMAGES.techRameshPatel}
                  alt="Ramesh Patel, Net Metering Specialist"
                  fallbackLabel="Ramesh Patel"
                />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#1a1c1a]">
                  Ramesh Patel
                </h5>
                <p className="text-[10px] text-[#42493f] uppercase">
                  Net Metering Specialist · ID #TK-118
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#245020]">
              On Site
            </span>
          </div>
          <div className="text-xs text-[#42493f] space-y-1">
            <div className="flex justify-between">
              <span>Active Destination:</span>
              <span className="font-medium text-[#1a1c1a]">
                DLF Phase 2 (TCK-8774)
              </span>
            </div>
            <div className="flex justify-between">
              <span>DISCOM Escort:</span>
              <span className="font-medium text-[#1a1c1a]">
                DHBVN Officer Present
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setSharePayload({
                title: 'Dispatch Alert · Ramesh Patel (#TK-118)',
                recipientName: 'Ramesh Patel (Net Metering Specialist)',
                defaultPhone: '+91 98100 10018',
                defaultEmail: 'ramesh.patel@sunpower.in',
                subject: 'DISCOM Net-Meter Sync · DLF Phase 2 (TCK-8774)',
                message:
                  'Hi Ramesh Patel,\n\nHigh Priority DISCOM inspection note:\n• Ticket: #TCK-8774 (Deepak Singhania · 10 kW DLF Phase 2)\n• Escort: DHBVN Officer Present\n• Action: Verify BRPL/DHBVN export sync and close with OTP.\n\nSunPower Dispatch Desk',
                qrValue: 'SUNPOWER|TECH-DISPATCH|TK-118|TCK-8774',
                qrLabel: 'Dispatch TCK-8774',
              })
            }
            className="w-full py-2.5 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-xs font-semibold text-[#1a1c1a] flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>Send WhatsApp / Gmail Alert</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#0e7a66] font-bold">
                Fast-Swap Spares Hub
              </span>
              <span className="text-xs font-mono-tabular font-bold text-[#1a1c1a]">
                Gurugram Depot
              </span>
            </div>
            <h5 className="font-display text-xl text-[#001601] uppercase tracking-wide">
              Emergency Component Readiness
            </h5>
            <div className="space-y-1.5 pt-1 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#42493f]">Solax 5kW Inverters:</span>
                <span className="font-semibold text-[#1a1c1a]">
                  8 Units Available
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#42493f]">DC SPD &amp; MCB Spares:</span>
                <span className="font-semibold text-[#1a1c1a]">
                  32 Kits Stocked
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#42493f]">Bi-Facial 545W Panels:</span>
                <span className="font-semibold text-[#1a1c1a]">
                  45 Panels Reserved
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onShowToast('Warehouse dispatch slip #GUR-SP-401 verified.')
            }
            className="w-full py-2.5 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-xs font-semibold text-[#1a1c1a] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4" aria-hidden="true" />
            <span>Check Warehouse Dispatch Slip</span>
          </button>
        </div>
      </div>

      {/* OTP Ticket Closure Modal */}
      {otpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setOtpModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Customer OTP Sign-Off"
        >
          <div
            className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc] p-6 sm:p-8 max-w-md w-full space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#0e7a66]" aria-hidden="true" />
                <h3 className="font-display text-2xl uppercase tracking-wide text-[#001601]">
                  Customer OTP Sign-Off
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                aria-label="Close OTP Sign-Off Modal"
                className="w-8 h-8 rounded-full bg-[#f4f3f0] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-[#42493f]">
              Enter the 4-digit verification code sent to customer phone to authenticate service completion and seal ticket closure.
            </p>

            <div className="flex justify-center gap-3 py-2">
              {closureOtp.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Closure OTP digit ${idx + 1}`}
                  value={val}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(-1);
                    const next = [...closureOtp];
                    next[idx] = clean;
                    setClosureOtp(next);
                    setClosureError(null);
                  }}
                  className="w-12 h-14 rounded-xl bg-[#efeeeb] border border-[#c2c9bc] text-center text-xl font-bold text-[#001601] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              ))}
            </div>

            {closureError && (
              <p className="text-xs font-semibold text-[#ba1a1a] text-center">
                {closureError}
              </p>
            )}

            <div className="bg-[#f4f3f0] p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#42493f]">Ticket Associated:</span>
                <span className="font-semibold text-[#1a1c1a]">
                  {openTicketForClosure?.id} ({openTicketForClosure?.customerName})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#42493f]">DISCOM Telemetry Status:</span>
                <span className="font-semibold text-[#0e7a66]">
                  Synchronized 100%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#efeeeb] hover:bg-[#e3e2df] text-xs font-semibold text-[#1a1c1a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAuthorizeClosure}
                className="flex-1 py-2.5 rounded-xl bg-[#001601] hover:bg-[#002e03] text-xs font-semibold text-white"
              >
                Authorize Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inverter MPPT Telemetry Log Modal */}
      {mpptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setMpptModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Inverter MPPT Telemetry Log"
        >
          <div
            className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc] p-6 max-w-lg w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e3e2df]">
              <h3 className="font-display text-2xl text-[#001601] uppercase">
                Inverter MPPT Event Log
              </h3>
              <button
                type="button"
                onClick={() => setMpptModalOpen(false)}
                aria-label="Close MPPT Log"
                className="w-8 h-8 rounded-lg bg-[#f4f3f0] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono-tabular">
              <div className="p-3 rounded-lg bg-[#f4f3f0]">
                <span className="font-bold text-[#0e7a66]">09:14:22</span> · MPPT-1 Phase-1 voltage normalized (231.4V AC)
              </div>
              <div className="p-3 rounded-lg bg-[#f4f3f0]">
                <span className="font-bold text-[#42493f]">09:13:58</span> · Transient grid swell detected (252.0V AC) — Curtailment engaged
              </div>
              <div className="p-3 rounded-lg bg-[#f4f3f0]">
                <span className="font-bold text-[#001601]">08:00:04</span> · Morning grid synchronization complete (THD 1.2%)
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMpptModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#001601] text-white text-xs font-semibold"
              >
                Close Log
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
