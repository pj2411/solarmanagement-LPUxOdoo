'use client';

import React, { useState } from 'react';
import {
  History,
  SlidersHorizontal,
  PlusCircle,
  MapPin,
  Zap,
  Phone,
  LocateFixed,
  Compass,
  Building2,
  Sun,
  Cable,
  CheckCircle2,
  Camera,
  ZoomIn,
  UploadCloud,
  FileText,
  Truck,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  HOTLINKED_IMAGES,
  SURVEY_PHOTOS,
  type ScreenId,
} from '@/lib/solar-data';
import { downloadSurveyReportPdf } from '@/lib/pdf-qr-comms';
import { SolarImage } from '@/components/SolarImage';
import { SignaturePad } from '@/components/SignaturePad';

interface SiteSurveyScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

export function SiteSurveyScreen({
  onNavigate,
  onShowToast,
}: SiteSurveyScreenProps) {
  const [checklist, setChecklist] = useState([
    {
      id: 'load',
      title: 'Structural Load Verified',
      desc: 'Roof dead & live load capacity confirmed >25 kg/m². Structural stability cert valid.',
      meta: 'Stress safety factor: 1.85',
      checked: true,
    },
    {
      id: 'earthing',
      title: 'Earthing Resistance Qualified',
      desc: 'Soil pit resistivity testing logged earthing resistance <5 ohms (Recorded: 2.8 Ω).',
      meta: 'IS 3043:2018 Compliant',
      checked: true,
    },
    {
      id: 'sync',
      title: 'DISCOM Grid Synchronization',
      desc: 'Feed-in voltage balance OK (230V ± 4%), Phase harmony checked, zero reverse creepage.',
      meta: 'CEA Standards Schedule-I',
      checked: true,
    },
  ]);

  const [zoomedPhoto, setZoomedPhoto] = useState<{
    title: string;
    meta: string;
    src: string;
    alt: string;
  } | null>(null);
  const [surveyApproved, setSurveyApproved] = useState(false);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedCount = checklist.filter((c) => c.checked).length;

  const handleApproveToDispatch = () => {
    setSurveyApproved(true);
    onShowToast(
      'Survey #DL-2025-0849 approved and transferred to Dispatch & Installation.'
    );
    setTimeout(() => {
      onNavigate('installation-dispatch');
    }, 650);
  };

  return (
    <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* Top Action & Title Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0e7a66] mb-1">
            Technical Operations Desk · Module 04
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#001601] tracking-wide uppercase leading-none text-balance">
            Site Survey &amp; Roof Engineering Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#42493f] max-w-2xl mt-1">
            Survey scheduling, technician assignment, 3D roof inspection, shadow analysis, and structural sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onShowToast('Loaded 14 historical rooftop survey logs.')}
            className="px-4 py-2 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <History className="w-4 h-4" aria-hidden="true" />
            <span>Survey Logs</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onShowToast('LiDAR point cloud calibrated to 2.4mm / px precision.')
            }
            className="px-4 py-2 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Calibrate LiDAR</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('portal-dashboard')}
            className="px-4 py-2 rounded-lg bg-[#002e03] hover:bg-[#001601] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>New Survey Order</span>
          </button>
        </div>
      </div>

      {/* Active Survey Status Banner */}
      <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#42493f]">
            <span className="font-semibold text-[#0e7a66]">
              Survey In Progress · Scheduled Today 11:30 AM
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">SITE-ID: #DL-2025-0849</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#1a1c1a]">
              Solar Rooftop Tier-A
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#001601] tracking-wide uppercase">
            Sharma Residence · 5kW On-Grid Rooftop
          </h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#42493f]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
              Plot 44-B, Greater Kailash-II, New Delhi
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
              BSES Rajdhani Power Limited · Sanction: 7.5 kW
            </span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#f4f3f0] border border-[#e3e2df] p-3.5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e3e2df] shrink-0">
              <SolarImage
                src={HOTLINKED_IMAGES.surveyMarcusPortrait}
                alt="Portrait of Er. Marcus Reed, Senior Solar Engineer"
                fallbackLabel="Er. Marcus Reed"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1a1c1a]">
                Er. Marcus Reed
              </div>
              <div className="text-[11px] text-[#42493f] font-medium">
                Senior Solar Engineer · Lic #SE-9941
              </div>
              <div className="text-[10px] text-[#0e7a66] font-semibold">
                Tele-GIS Active · 400m from site
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onShowToast('Dialing Er. Marcus Reed (+91 98100-12345)...')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#001601] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#002e03] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Direct Call</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onShowToast('GPS Ping locked at 28.5355° N, 77.2410° E.')
              }
              className="px-3.5 py-2 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
              <span>GPS Ping</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Engineering Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* COLUMN 1: Roof Geometry & Orientation */}
        <div className="flex flex-col rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4 justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#bcebc0] text-[#264f30] flex items-center justify-center">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#42493f] block">
                    Spatial Metrics
                  </span>
                  <h3 className="font-display text-xl text-[#001601] uppercase leading-none">
                    Roof Geometry &amp; Orientation
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#0e7a66]">
                Optimal Tier
              </span>
            </div>

            {/* Compass Visual Module */}
            <div className="p-4 rounded-xl bg-[#f4f3f0] flex flex-col items-center justify-center relative">
              <div className="w-40 h-40 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 160 160" aria-hidden="true">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#c2c9bc"
                    strokeDasharray="3 3"
                    strokeWidth="2"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="54"
                    fill="none"
                    stroke="#e3e2df"
                    strokeWidth="1"
                  />
                  <text
                    x="80"
                    y="27"
                    textAnchor="middle"
                    className="text-[9px] fill-[#42493f] font-bold"
                  >
                    N
                  </text>
                  <text
                    x="135"
                    y="83"
                    textAnchor="middle"
                    className="text-[9px] fill-[#42493f] font-bold"
                  >
                    E
                  </text>
                  <text
                    x="80"
                    y="137"
                    textAnchor="middle"
                    className="text-[10px] fill-[#001601] font-bold"
                  >
                    S (180°)
                  </text>
                  <text
                    x="25"
                    y="83"
                    textAnchor="middle"
                    className="text-[9px] fill-[#42493f] font-bold"
                  >
                    W
                  </text>
                  <line
                    x1="80"
                    y1="80"
                    x2="80"
                    y2="132"
                    stroke="#0e7a66"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                  <circle cx="80" cy="80" r="5" fill="#0e7a66" />
                  <polygon points="80,141 76,132 84,132" fill="#0e7a66" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-mono-tabular font-bold text-[#001601]">
                    180° SOUTH
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#0e7a66] font-semibold">
                    Max Insolation
                  </span>
                </div>
              </div>
              <div className="w-full flex items-center justify-between text-[11px] text-[#42493f] pt-2 tabular-nums">
                <span>
                  Declination: <strong className="text-[#1a1c1a]">+0.42° E</strong>
                </span>
                <span>
                  Noon Irradiance:{' '}
                  <strong className="text-[#1a1c1a]">942 W/m²</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 tabular-nums">
              <div className="p-3 rounded-lg bg-[#f4f3f0]">
                <span className="text-[11px] font-medium text-[#42493f]">
                  Roof Pitch / Tilt
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl text-[#001601] leading-none">
                    24°
                  </span>
                  <span className="text-[10px] font-semibold text-[#0e7a66]">
                    Optimal Lat
                  </span>
                </div>
                <span className="text-[10px] text-[#42493f] mt-1 block">
                  Elevated strut kit recommended
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#f4f3f0]">
                <span className="text-[11px] font-medium text-[#42493f]">
                  Usable Shadow-Free
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-2xl text-[#001601] leading-none">
                    480
                  </span>
                  <span className="text-xs font-semibold text-[#1a1c1a]">
                    sq ft
                  </span>
                </div>
                <span className="text-[10px] text-[#42493f] mt-1 block">
                  73.8% of 650 sq ft total
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#f4f3f0] flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#0e7a66] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="text-xs font-semibold text-[#1a1c1a] block">
                  Roof Material &amp; Construction
                </span>
                <p className="text-[11px] text-[#42493f] leading-relaxed mt-0.5">
                  RCC Flat Concrete Slab with 3.5 ft peripheral parapet wall. Anchor tensile test qualified for 140 km/h wind shear.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-[#42493f] mb-1.5 tabular-nums">
              <span>Module Capacity Allowance</span>
              <span className="font-bold text-[#1a1c1a]">
                12 Panels (550W Mono-PERC)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e9e8e5] overflow-hidden">
              <div className="h-full bg-[#0e7a66] rounded-full w-[83%]" />
            </div>
          </div>
        </div>

        {/* COLUMN 2: Shadow & Cable Calculations */}
        <div className="flex flex-col rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4 justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#bcebc0] text-[#264f30] flex items-center justify-center">
                  <Sun className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#42493f] block">
                    Loss &amp; Routing Model
                  </span>
                  <h3 className="font-display text-xl text-[#001601] uppercase leading-none">
                    Shadow &amp; Cable Calculations
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#42493f]">
                LiDAR Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f4f3f0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1a1c1a]">
                  Near-Shade Obstacle Mapping
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                  12% Morning Loss
                </span>
              </div>
              <p className="text-[11px] text-[#42493f] leading-relaxed">
                East water tank masonry housing (Height: 2.1m) casts dynamic shadow between 07:00 AM - 09:15 AM during winter solstice.
              </p>

              <div className="pt-1">
                <div className="flex justify-between text-[10px] font-mono-tabular text-[#42493f] mb-1">
                  <span>06:00</span>
                  <span className="text-[#0e7a66] font-bold">Peak Yield Zone</span>
                  <span>18:00</span>
                </div>
                <svg
                  className="w-full h-12"
                  preserveAspectRatio="none"
                  viewBox="0 0 300 48"
                  aria-hidden="true"
                >
                  <path
                    d="M 0 46 Q 40 40, 80 28 Q 150 4, 220 28 Q 260 40, 300 46 L 300 48 L 0 48 Z"
                    fill="#bcebc0"
                    fillOpacity="0.45"
                  />
                  <path
                    d="M 0 46 Q 40 40, 80 28 Q 150 4, 220 28 Q 260 40, 300 46"
                    fill="none"
                    stroke="#0e7a66"
                    strokeWidth="2"
                  />
                  <rect
                    fill="#42493f"
                    fillOpacity="0.14"
                    height="26"
                    rx="2"
                    width="60"
                    x="18"
                    y="22"
                  />
                  <line
                    stroke="#ba1a1a"
                    strokeOpacity="0.6"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                    x1="78"
                    x2="78"
                    y1="12"
                    y2="48"
                  />
                </svg>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f4f3f0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1a1c1a] flex items-center gap-1.5">
                  <Cable className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                  <span>AC/DC Cable Routing to Main LT</span>
                </span>
                <span className="text-xs font-mono-tabular font-bold text-[#001601]">
                  32 Meters
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#efeeeb]">
                  <span className="text-[10px] text-[#42493f] block uppercase">
                    Recommended Core
                  </span>
                  <strong>16 sq mm Multi-Strand</strong>
                  <span className="block text-[10px] text-[#0e7a66]">
                    Electrolytic Copper
                  </span>
                </div>
                <div className="p-2 rounded bg-[#efeeeb]">
                  <span className="text-[10px] text-[#42493f] block uppercase">
                    Voltage Drop Est.
                  </span>
                  <strong className="tabular-nums">0.84% Total</strong>
                  <span className="block text-[10px] text-[#0e7a66]">
                    &lt; 2.0% MNRE limit
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f4f3f0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1a1c1a]">
                  Earthing Pit Feasibility
                </span>
                <span className="text-[10px] font-bold text-[#0e7a66]">
                  Feasible · North Yard
                </span>
              </div>
              <p className="text-[11px] text-[#42493f] leading-relaxed">
                Dual chemical electrode pits required (Solar Array Lightning Arrester + AC/DC Surge DB earthing). Soil resistivity: 24 Ω-m.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#efeeeb] flex items-center justify-between text-xs">
            <span className="font-medium text-[#1a1c1a] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
              <span>Inverter Location Sanctioned</span>
            </span>
            <span className="font-mono-tabular font-bold text-[#0e7a66]">
              North-West Alcove
            </span>
          </div>
        </div>

        {/* COLUMN 3: Field Photos & Drone Scan Gallery */}
        <div className="flex flex-col rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-5 space-y-4 justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#bcebc0] text-[#264f30] flex items-center justify-center">
                  <Camera className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#42493f] block">
                    Photogrammetry &amp; Evidence
                  </span>
                  <h3 className="font-display text-xl text-[#001601] uppercase leading-none">
                    Field Photos &amp; Drone Gallery
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono-tabular font-semibold text-[#0e7a66]">
                4 / 4 Captured
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SURVEY_PHOTOS.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setZoomedPhoto(photo)}
                  className="group relative rounded-xl overflow-hidden bg-[#e3e2df] aspect-[4/3] text-left focus-visible:outline-2 focus-visible:outline-[#002e03]"
                >
                  <SolarImage
                    src={photo.src}
                    alt={photo.alt}
                    fallbackLabel={photo.title}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#001601]/85 p-2 text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-wider block">
                      {photo.title}
                    </span>
                    <span className="text-[9px] text-white/80 font-mono-tabular block truncate">
                      {photo.meta}
                    </span>
                  </div>
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#ffffff]/90 flex items-center justify-center text-[#001601]">
                    <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[#f4f3f0] flex items-center justify-between text-xs">
              <span className="text-[#42493f]">
                LiDAR Point Cloud Resolution
              </span>
              <span className="font-bold text-[#1a1c1a] font-mono-tabular">
                2.4mm / px
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onShowToast(
                'Photogrammetry upload queue ready for .LAS / .OBJ drone scans.'
              )
            }
            className="w-full py-2.5 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4" aria-hidden="true" />
            <span>Upload Field Photo / 3D Scan (.LAS, .OBJ)</span>
          </button>
        </div>
      </div>

      {/* Survey Approval & Engineering Handover */}
      <div className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc]/70 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e3e2df]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e7a66] block">
              Compliance &amp; Quality Gateway
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#001601] tracking-wide uppercase leading-none">
              Survey Approval &amp; Engineering Handover
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="font-semibold text-[#0e7a66]">
              {completedCount} of {checklist.length} Cleared
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#42493f]">
              DISCOM FORM: B-11
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-display text-lg text-[#001601] uppercase tracking-wide">
            Pre-Dispatch Technical Sign-off Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#f4f3f0] hover:bg-[#efeeeb] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 w-4 h-4 accent-[#002e03]"
                />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#1a1c1a] block">
                    {item.title}
                  </span>
                  <p className="text-[11px] text-[#42493f] leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="block text-[10px] font-mono-tabular text-[#0e7a66] font-semibold">
                    {item.meta}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e3e2df]">
            <SignaturePad
              label="Field Engineer e-Signature"
              metaRight="Auth Key: #ENG-9941"
              footerLeft="Name: Er. Marcus Reed"
              footerRight="Accreditation: MNRE / Skill India"
              defaultSigned
              defaultPath="engineer"
              heightClass="h-28"
            />
          </div>
          <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e3e2df]">
            <SignaturePad
              label="Customer / Site Owner Consent"
              metaRight="OTP Verified (+91-XXXXX-1234)"
              footerLeft="Name: Vipin Sharma (Co-Owner)"
              footerRight="Property Sanction: Residential GK-II"
              strokeColor="#0e7a66"
              defaultSigned
              defaultPath="customer"
              heightClass="h-28"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#e3e2df]">
          <div className="flex items-center gap-2 text-xs text-[#42493f]">
            <ShieldCheck className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            <span>
              All data encrypted under DISCOM Technical Architecture Protocol 2025.
            </span>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                await downloadSurveyReportPdf({
                  siteId: '#DL-2025-0849',
                  projectTitle: 'Sharma Residence · 5kW On-Grid Rooftop',
                  address: 'Plot 44-B, Greater Kailash-II, New Delhi',
                  engineerName: 'Er. Marcus Reed (Lic #SE-9941)',
                  checklist,
                });
                onShowToast(
                  'Engineering Survey Report DL-2025-0849 PDF with QR proof downloaded.'
                );
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#e9e8e5] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Generate Engineering Survey Report</span>
            </button>
            <button
              type="button"
              onClick={handleApproveToDispatch}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#002e03] hover:bg-[#001601] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>
                {surveyApproved
                  ? 'Approved & Scheduled for Dispatch'
                  : 'Approve & Move to Dispatch & Installation'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/70"
          onClick={() => setZoomedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={zoomedPhoto.title}
        >
          <div
            className="bg-[#ffffff] rounded-2xl max-w-2xl w-full overflow-hidden border border-[#c2c9bc]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e3e2df]">
              <div>
                <h4 className="font-display text-xl text-[#001601]">
                  {zoomedPhoto.title}
                </h4>
                <p className="text-xs font-mono-tabular text-[#42493f]">
                  {zoomedPhoto.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedPhoto(null)}
                aria-label="Close photo preview"
                className="w-8 h-8 rounded-lg bg-[#f4f3f0] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-[16/10] bg-[#e3e2df]">
              <SolarImage
                src={zoomedPhoto.src}
                alt={zoomedPhoto.alt}
                fallbackLabel={zoomedPhoto.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
