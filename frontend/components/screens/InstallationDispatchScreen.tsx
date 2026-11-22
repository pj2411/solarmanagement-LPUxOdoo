'use client';

import React, { useRef, useState } from 'react';
import {
  Download,
  QrCode,
  Check,
  RefreshCw,
  Clock,
  Lock,
  Truck,
  ShieldCheck,
  Cpu,
  Barcode,
  ClipboardCheck,
  Camera,
  UploadCloud,
  Gavel,
  Award,
  X,
} from 'lucide-react';
import {
  HOTLINKED_IMAGES,
  INITIAL_HARDWARE_REGISTRY,
  INSTALLATION_PROGRESS_PHOTOS,
  type HardwareRegistryItem,
  type ScreenId,
} from '@/lib/solar-data';
import { validateHandover } from '@/lib/solar-logic';
import { downloadDispatchDossierPdf } from '@/lib/pdf-qr-comms';
import { SolarImage } from '@/components/SolarImage';
import { SignaturePad } from '@/components/SignaturePad';
import { QrCodeDisplay } from '@/components/QrCodeDisplay';

interface InstallationDispatchScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

const PIPELINE_STEPS = [
  {
    num: '01',
    title: 'Material Packing',
    sub: 'Hub QA Verified',
  },
  {
    num: '02',
    title: 'Dispatch & In-Transit',
    sub: 'Gate Out Sec-62',
  },
  {
    num: '03',
    title: 'Rooftop Mounting & Racking',
    sub: 'Wind clamp torque active',
  },
  {
    num: '04',
    title: 'Inverter & Cabling',
    sub: 'DC strings & conduits',
  },
  {
    num: '05',
    title: 'Net-Metering & Sync',
    sub: 'DISCOM inspector sync',
  },
];

export function InstallationDispatchScreen({
  onNavigate,
  onShowToast,
}: InstallationDispatchScreenProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(2); // 0-indexed: Step 03 active
  const [hardware, setHardware] = useState<HardwareRegistryItem[]>(
    INITIAL_HARDWARE_REGISTRY
  );
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrScanInput, setQrScanInput] = useState('PAN-882201');

  const [qualityTasks, setQualityTasks] = useState([
    {
      id: 'qt-1',
      title: 'Racking clamping at 160 km/h wind shear rating',
      badge: 'Torqued 14Nm',
      desc: 'M10 stainless steel anodized clamp sets anchored to RCC footing.',
      done: true,
    },
    {
      id: 'qt-2',
      title: 'DC polarity & MC4 crimping validation',
      badge: 'Polarity Pass',
      desc: 'String 1 (+/-) verified with Fluke PV clamp meter. No reverse bias detected.',
      done: true,
    },
    {
      id: 'qt-3',
      title: 'Inverter dual grounding & lightning arrestor test',
      badge: 'In Progress',
      desc: 'Copper chemical earthing pit resistance target < 2.0 Ω. Megger measurement queued.',
      done: false,
    },
  ]);

  const [otpDigits, setOtpDigits] = useState<string[]>(['7', '4', '9', '']);
  const [hasSignature, setHasSignature] = useState(true);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [commissioned, setCommissioned] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const completedTasks = qualityTasks.filter((t) => t.done).length;
  const progressPct = commissioned
    ? 100
    : Math.min(95, 22 + activeStepIdx * 20);

  const toggleQualityTask = (id: string) => {
    setQualityTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    setHandoverError(null);
    if (clean && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleScanSerial = (e: React.FormEvent) => {
    e.preventDefault();
    const serial = qrScanInput.trim().toUpperCase();
    if (!serial) return;
    setHardware((prev) => [
      {
        id: `hw-${Date.now()}`,
        spec: '1x Auxiliary DC Combiner Box',
        subSpec: 'IP66 Polycarbonate String Fuse Enclosure',
        serialRange: serial,
        verification: 'QR Verified (1/1)',
        verifIcon: 'qr_code',
        qualityGate: 'Thermal Pass',
        status: 'Staged On-Roof',
        verified: true,
      },
      ...prev,
    ]);
    setQrModalOpen(false);
    setQrScanInput('');
    onShowToast(`Hardware serial ${serial} scanned and added to Registry.`);
  };

  const handleCommissionSubmit = () => {
    const check = validateHandover({ otpDigits, hasSignature });
    if (!check.ok) {
      setHandoverError(check.error || 'Verification incomplete.');
      return;
    }
    setHandoverError(null);
    setCommissioned(true);
    setActiveStepIdx(4);
    onShowToast(
      'Commissioning complete! 25-Year Linear Performance Warranty issued.'
    );
  };

  const renderVerifIcon = (icon: string) => {
    switch (icon) {
      case 'qr_code':
        return <QrCode className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      case 'cpu':
        return <Cpu className="w-4 h-4 text-[#001601]" aria-hidden="true" />;
      case 'barcode':
        return <Barcode className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
      default:
        return (
          <Check className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
        );
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 space-y-10">
      {/* Top Workbench Header & Project Snapshot */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#42493f]">
            <span className="font-semibold uppercase tracking-wider text-[#0e7a66]">
              Execution Phase · Modules 08 &amp; 09
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular font-medium">
              Work Order #SWP-2025-IND-884
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#001601] tracking-wide uppercase leading-none text-balance">
            Installation Workbench &amp; Dispatch Tracking
          </h1>
          <p className="text-sm sm:text-base text-[#42493f] max-w-3xl">
            Material packaging, serial QR scanning, milestone scheduling, and technician digital sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={async () => {
              await downloadDispatchDossierPdf({
                workOrderId: '#SWP-2025-IND-884',
                waybill: 'WB-99218-DL',
                hardware,
                completedTasks,
                totalTasks: qualityTasks.length,
              });
              onShowToast('Dispatch Dossier PDF (WB-99218-DL) with QR downloaded.');
            }}
            className="px-4 py-2.5 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Dispatch Dossier (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#002e03] hover:bg-[#001601] text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" aria-hidden="true" />
            <span>Launch QR Scanner</span>
          </button>
        </div>
      </section>

      {/* Milestone Execution Bar (5-Step Visual Pipeline) */}
      <section className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
            Live Commissioning Pipeline
          </span>
          <span className="text-xs font-bold text-[#0e7a66] tabular-nums">
            Overall Progress: {progressPct}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = commissioned || idx < activeStepIdx;
            const isActive = !commissioned && idx === activeStepIdx;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`text-left rounded-xl p-4 flex flex-col justify-between space-y-3 border-t-4 transition-colors ${
                  isCompleted
                    ? 'bg-[#f4f3f0] border-t-[#001601] border border-[#e3e2df]'
                    : isActive
                    ? 'bg-[#ffffff] border-t-[#0e7a66] border border-[#0e7a66]'
                    : 'bg-[#f4f3f0] border-t-[#c2c9bc] border border-[#e3e2df] opacity-85'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-display text-2xl leading-none ${
                      isActive
                        ? 'text-[#0e7a66]'
                        : isCompleted
                        ? 'text-[#001601]'
                        : 'text-[#42493f]'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-[#001601] text-white'
                        : isActive
                        ? 'bg-[#bcebc0] text-[#264f30]'
                        : 'bg-[#e9e8e5] text-[#42493f]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : isActive ? (
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : idx === 3 ? (
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1a1c1a]">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-[#42493f] mt-0.5">
                    {step.sub}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isCompleted
                      ? 'text-[#001601]'
                      : isActive
                      ? 'text-[#0e7a66]'
                      : 'text-[#42493f]'
                  }`}
                >
                  {isCompleted
                    ? 'Completed'
                    : isActive
                    ? 'Active Now'
                    : idx === 3
                    ? 'Pending'
                    : 'Scheduled'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION A: Dispatch & Hardware Serial Number Registry */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
              Module 08 · Warehouse Logistics
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#001601] uppercase">
              Dispatch &amp; Hardware Serial Number Registry
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#0e7a66]">
            Dispatched from Hub Sector-62 · Delivery Confirmed at Site
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f4f3f0] rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#002e03] text-white flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs font-bold text-[#1a1c1a]">
                  Consignment Waybill: WB-99218-DL
                </div>
                <div className="text-[11px] text-[#42493f]">
                  Carrier: SunPower Fleet Van #07 · Transit Temp: 27°C Normal
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-mono-tabular text-[#1a1c1a]">
                GPS Ping: 28.5355° N, 77.3910° E
              </span>
              <span className="font-semibold text-[#002e03]">
                Unloaded 08:35 AM
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#efeeeb] text-[#42493f] uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Component Spec</th>
                  <th className="py-3 px-4">Serial / Batch ID</th>
                  <th className="py-3 px-4">Telemetry / Verif.</th>
                  <th className="py-3 px-4">Quality Gate</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e2df]">
                {hardware.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1a1c1a] text-sm">
                        {item.spec}
                      </div>
                      <div className="text-[11px] text-[#42493f]">
                        {item.subSpec}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular font-medium text-[#001601]">
                      {item.serialRange}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[11px] text-[#0e7a66]">
                        {renderVerifIcon(item.verifIcon)}
                        <span>{item.verification}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-semibold text-[#42493f]">
                      {item.qualityGate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[11px] text-[#264f30]">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION B: Installation Scheduling & Crew Assignment */}
      <section className="space-y-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
            Module 09 · Field Deployment
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-[#001601] uppercase">
            Installation Scheduling &amp; Crew Assignment
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols */}
          <div className="lg:col-span-7 space-y-5">
            {/* Crew Lead Card */}
            <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#e9e8e5] shrink-0">
                  <SolarImage
                    src={HOTLINKED_IMAGES.crewLeadMarcus}
                    alt="Portrait of Marcus Reed, Lead EPC Installer"
                    fallbackLabel="Marcus Reed"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-[#001601] leading-none">
                      Marcus Reed
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e7a66]">
                      · Lead EPC Installer
                    </span>
                  </div>
                  <p className="text-xs text-[#42493f] mt-1">
                    Crew: +3 Certified Technicians (P. Kumar, D. Varma, S. Alam)
                  </p>
                  <p className="text-[11px] text-[#42493f] flex items-center gap-1 font-medium mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#001601]" aria-hidden="true" />
                    <span>NABCEP Certified · Fall Protection Level 3</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e3e2df]">
                <span className="text-xs text-[#42493f] block">Shift Window</span>
                <span className="font-display text-lg text-[#001601] tabular-nums">
                  08:00 — 16:30 IST
                </span>
                <span className="text-[11px] text-[#0e7a66] font-semibold block">
                  Live On-Site · Sector 49
                </span>
              </div>
            </div>

            {/* Engineering Quality Checklist */}
            <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#001601]" aria-hidden="true" />
                  <h4 className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
                    Today&apos;s Engineering Quality Checklist
                  </h4>
                </div>
                <span className="text-xs font-semibold text-[#0e7a66] tabular-nums">
                  {completedTasks} of {qualityTasks.length} Completed
                </span>
              </div>

              <div className="space-y-2.5">
                {qualityTasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-colors ${
                      task.done
                        ? 'bg-[#f4f3f0]'
                        : 'bg-[#faf9f6] border border-[#c2c9bc]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleQualityTask(task.id)}
                      className="mt-0.5 h-4 w-4 accent-[#002e03]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            task.done
                              ? 'line-through text-[#42493f]'
                              : 'text-[#001601]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#0e7a66] whitespace-nowrap">
                          {task.done ? 'Verified' : task.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#42493f] mt-0.5">
                        {task.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Live Installation Photo Feed */}
            <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#001601]" aria-hidden="true" />
                  <h4 className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
                    Live Site Progress Photo Feed (4 Milestones)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast('Geo-tagged installation shot queued for upload.')
                  }
                  className="text-xs font-semibold text-[#001601] hover:underline flex items-center gap-1"
                >
                  <UploadCloud className="w-4 h-4" aria-hidden="true" />
                  <span>Upload Geo-Tagged Shot</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INSTALLATION_PROGRESS_PHOTOS.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative rounded-xl overflow-hidden bg-[#e9e8e5] aspect-square"
                  >
                    <SolarImage
                      src={photo.src}
                      alt={photo.alt}
                      fallbackLabel={photo.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#001601]/85 p-2 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider block">
                        {photo.title}
                      </span>
                      <span className="text-[9px] text-white/80 font-mono-tabular block truncate">
                        {photo.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#42493f] font-bold">
                    Fluke Telemetry Link
                  </span>
                  <h3 className="font-display text-2xl text-[#001601]">
                    Voltage &amp; Electrical Sanction
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#0e7a66]">
                  Calibrated Instrument
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 tabular-nums">
                <div className="bg-[#f4f3f0] rounded-xl p-3 text-center">
                  <span className="text-[10px] font-semibold text-[#42493f] uppercase block">
                    Voc Open Circuit
                  </span>
                  <span className="font-display text-3xl text-[#001601] leading-tight">
                    412<span className="text-sm">V</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#0e7a66] block mt-0.5">
                    ±1.4% Target
                  </span>
                </div>
                <div className="bg-[#f4f3f0] rounded-xl p-3 text-center">
                  <span className="text-[10px] font-semibold text-[#42493f] uppercase block">
                    Isc Short Circuit
                  </span>
                  <span className="font-display text-3xl text-[#001601] leading-tight">
                    11.2<span className="text-sm">A</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#0e7a66] block mt-0.5">
                    Peak STC Sync
                  </span>
                </div>
                <div className="bg-[#f4f3f0] rounded-xl p-3 text-center">
                  <span className="text-[10px] font-semibold text-[#42493f] uppercase block">
                    Insulation R
                  </span>
                  <span className="font-display text-3xl text-[#0e7a66] leading-tight">
                    25<span className="text-sm">MΩ</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#264f30] block mt-0.5">
                    Pass &gt;1MΩ
                  </span>
                </div>
              </div>

              <div className="bg-[#f4f3f0] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1a1c1a]">
                    String 1 Voltage Curve (PV Simulation)
                  </span>
                  <span className="font-mono-tabular text-[#001601] font-bold">
                    Stable @ 398.4 VDC
                  </span>
                </div>
                <svg
                  className="w-full h-14 text-[#0e7a66]"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 320 60"
                  aria-hidden="true"
                >
                  <path
                    d="M0,45 Q30,42 60,35 T120,28 T180,24 T240,22 T300,20 L320,20 L320,60 L0,60 Z"
                    fill="#bcebc0"
                    fillOpacity="0.4"
                  />
                  <path
                    d="M0,45 Q30,42 60,35 T120,28 T180,24 T240,22 T300,20 L320,20"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="240" cy="22" r="3.5" fill="#002e03" />
                  <circle cx="300" cy="20" r="3.5" fill="#0e7a66" />
                </svg>
                <div className="flex items-center justify-between text-[10px] text-[#42493f] font-mono-tabular">
                  <span>08:00 Cold Voc</span>
                  <span>Peak 980 W/m²</span>
                  <span>14:00 Stable</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="text-[#42493f] font-medium">
                    Earth Pit Resistance Reading
                  </span>
                  <span className="font-semibold text-[#001601]">
                    1.34 Ω (Threshold: &lt; 2.0 Ω)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e9e8e5] overflow-hidden">
                  <div className="h-full bg-[#0e7a66] rounded-full w-[67%]" />
                </div>
              </div>
            </div>

            <div className="bg-[#efeeeb] border border-[#c2c9bc]/60 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#001601] font-semibold text-xs">
                <Gavel className="w-4 h-4" aria-hidden="true" />
                <span>DISCOM Net-Metering Liaison</span>
              </div>
              <p className="text-xs text-[#42493f] leading-relaxed">
                Official synchronisation inspection scheduled with Executive Engineer, PV Division for tomorrow at 10:30 AM. Smart meter telemetry provisioning token generated.
              </p>
              <div className="text-[11px] font-mono-tabular text-[#1a1c1a] font-medium pt-1">
                Token: DS-2025-NETMTR-99824-OK
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: Completion & Digital Handover */}
      <section className="bg-[#ffffff] border border-[#c2c9bc]/70 rounded-2xl p-6 space-y-6">
        <div className="border-b border-[#e3e2df] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#42493f] font-semibold">
              Handover Protocol · Quality Sign-Off
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#001601] uppercase">
              Completion &amp; Digital Handover
            </h2>
          </div>
          <span className="text-xs text-[#42493f] font-medium">
            Cryptographically Signed Handshake
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* OTP Handshake */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <span className="font-display text-lg text-[#001601] uppercase block">
                Customer Handshake OTP
              </span>
              <p className="text-xs text-[#42493f]">
                Enter the 4-digit code SMS-dispatched to customer terminal (+91 98712-XXXXX).
              </p>
            </div>
            <div className="flex items-center gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Handover OTP digit ${idx + 1}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  placeholder="•"
                  className="w-14 h-14 text-center font-display text-3xl bg-[#efeeeb] border border-[#c2c9bc] text-[#001601] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#42493f]">Expires in 04:12 min</span>
              <button
                type="button"
                onClick={() => onShowToast('Fresh handover OTP sent via SMS.')}
                className="text-[#001601] font-semibold hover:underline"
              >
                Resend OTP via SMS
              </button>
            </div>
            {handoverError && (
              <p className="text-xs font-semibold text-[#ba1a1a]" role="alert">
                {handoverError}
              </p>
            )}
          </div>

          {/* Digital Signature Pad */}
          <div className="lg:col-span-7">
            <SignaturePad
              label="Customer Digital Signature"
              subtitle="Sign using stylus or finger to acknowledge mechanical completion"
              defaultSigned
              defaultPath="handover"
              onSignatureChange={setHasSignature}
              heightClass="h-32"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e3e2df]">
          <div className="flex items-center gap-2 text-xs text-[#42493f]">
            <ShieldCheck className="w-5 h-5 text-[#0e7a66] shrink-0" aria-hidden="true" />
            <span>
              By submitting, you certify that MNRE Annexure-II commissioning guidelines have been fully complied with.
            </span>
          </div>

          {!commissioned ? (
            <button
              type="button"
              onClick={handleCommissionSubmit}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#002e03] hover:bg-[#001601] text-white font-display text-xl uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap"
            >
              <Award className="w-5 h-5 text-[#bcebc0]" aria-hidden="true" />
              <span>Submit Commissioning &amp; Issue 25-Year Warranty</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('service-warranty')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white font-display text-xl uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              <span>Warranty Issued · View in Warranty Vault</span>
            </button>
          )}
        </div>
      </section>

      {/* QR Scanner Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setQrModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Hardware Serial QR Scanner"
        >
          <div
            className="bg-[#ffffff] border border-[#c2c9bc] rounded-2xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0e7a66]" aria-hidden="true" />
                <h3 className="font-display text-2xl text-[#001601] uppercase">
                  Serial QR Scanner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                aria-label="Close QR Scanner"
                className="w-8 h-8 rounded-lg bg-[#f4f3f0] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#42493f]">
              Scan or enter the manufacturer serial barcode on the PV module, inverter, or DC combiner box to verify custody and generate a printable QR asset tag.
            </p>
            <form onSubmit={handleScanSerial} className="space-y-4">
              <div>
                <label
                  htmlFor="qr-serial-input"
                  className="block text-xs font-semibold text-[#1a1c1a] mb-1"
                >
                  Hardware Serial / Batch ID
                </label>
                <input
                  id="qr-serial-input"
                  type="text"
                  required
                  value={qrScanInput}
                  onChange={(e) => setQrScanInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] font-mono-tabular text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              </div>
              {qrScanInput.trim() && (
                <div className="flex justify-center py-2 bg-[#faf9f6] rounded-xl border border-[#e3e2df]">
                  <QrCodeDisplay
                    value={`SUNPOWER|HW|${qrScanInput.trim().toUpperCase()}|WB-99218-DL`}
                    size={132}
                    caption={`Serial Tag: ${qrScanInput.trim().toUpperCase()}`}
                    downloadName={`${qrScanInput.trim().toUpperCase()}-QR.png`}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#efeeeb] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#002e03] text-white text-xs font-semibold"
                >
                  Verify &amp; Log Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
