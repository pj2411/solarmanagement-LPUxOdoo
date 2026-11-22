import type { ScreenId, ServiceTicket } from './solar-data';
import { SEED_USERS } from './solar-users';
import { BACKEND_DATA } from './backend-records';

export type SubsidyScheme = 'pmsuryaghar' | 'commercial' | 'nosubsidy';
export type RoofArchitecture = 'rcc' | 'tinshed' | 'tiled';
export type GridType = 'ongrid' | 'hybrid';

export interface SolarCalculatorInput {
  monthlyBillInr: number;
  scheme: SubsidyScheme;
  roofType: RoofArchitecture;
  gridType: GridType;
}

export interface SolarCalculatorResult {
  recommendedKw: number;
  roofAreaSqFt: number;
  grossCost: number;
  subsidyAmount: number;
  netCost: number;
  annualSavings: number;
  paybackYears: string;
  lifetimeSavings: number;
  co2OffsetTonnes: string;
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function calculateSolarMetrics(
  input: SolarCalculatorInput
): SolarCalculatorResult {
  const bill = Math.max(500, Math.round(input.monthlyBillInr));
  let kw = bill / 1300;
  if (kw < 1.0) kw = 1.0;
  if (kw > 15.0) kw = 15.0;
  const recommendedKw = parseFloat(kw.toFixed(1));

  const roofFactor = input.roofType === 'tiled' ? 100 : 90;
  const roofAreaSqFt = Math.round(recommendedKw * roofFactor);

  let grossCost = Math.round(recommendedKw * 65000);
  if (input.gridType === 'hybrid') {
    grossCost += Math.round(recommendedKw * 35000);
  }

  let subsidyAmount = 0;
  if (input.scheme === 'pmsuryaghar') {
    subsidyAmount =
      recommendedKw <= 2.0 ? Math.round(30000 * recommendedKw) : 78000;
  } else if (input.scheme === 'commercial') {
    subsidyAmount = Math.round(grossCost * 0.4);
  }

  const netCost = Math.max(grossCost - subsidyAmount, 20000);
  const annualSavings = Math.round(bill * 12 * 0.9);
  const rawPayback = netCost / annualSavings;
  const paybackYears = Math.max(2.2, rawPayback).toFixed(1);
  const lifetimeSavings = Math.round(annualSavings * 25);
  const co2OffsetTonnes = (recommendedKw * 24.2).toFixed(1);

  return {
    recommendedKw,
    roofAreaSqFt,
    grossCost,
    subsidyAmount,
    netCost,
    annualSavings,
    paybackYears,
    lifetimeSavings,
    co2OffsetTonnes,
  };
}

export interface QuotationBOMItem {
  id: string;
  title: string;
  spec: string;
  unitPrice: number;
  qtyLabel: string;
  total: number;
  icon: string;
}

export interface QuotationBreakdown {
  kw: number;
  label: string;
  onGridPanelCount: string;
  onGridInverter: string;
  estMonthlyUnits: string;
  annualSavings: string;
  onGridGross: number;
  subsidy: number;
  stateCessExemption: number;
  onGridNet: number;
  hybridGross: number;
  hybridBattery: string;
  hybridInverter: string;
  hybridSafeHarborCredit: number;
  hybridNet: number;
  stateDiscomRebate: number;
  subsidyNetInvest: number;
  bomItems: QuotationBOMItem[];
}

export interface PresetConfig {
  kw: number;
  label: string;
  onGridPanelCount: string;
  onGridInverter: string;
  estMonthlyUnits: string;
  annualSavings: string;
  onGridGross: number;
  subsidy: number;
  hybridGross: number;
  hybridBattery: string;
  hybridInverter: string;
  pvQty: number;
  inverterPrice: number;
}

export const PRESET_QUOTES: Record<number, PresetConfig> = {
  1: {
    kw: 1,
    label: '1 kW Mono PERC',
    onGridPanelCount: '2x Tier-1 Bifacial TopCon (550Wp)',
    onGridInverter: 'Havells 1.5kW Single-Phase',
    estMonthlyUnits: '~120 - 140 Units (kWh)',
    annualSavings: '₹10,800 / yr',
    onGridGross: 68000,
    subsidy: 30000,
    hybridGross: 142000,
    hybridBattery: '5.1 kWh LiFePO4 Module',
    hybridInverter: 'Growatt 3kW Hybrid Inverter',
    pvQty: 2,
    inverterPrice: 14500,
  },
  2: {
    kw: 2,
    label: '2 kW High-Yield',
    onGridPanelCount: '4x Tier-1 Bifacial TopCon (550Wp)',
    onGridInverter: 'Havells / Solis 2.5kW On-Grid',
    estMonthlyUnits: '~240 - 270 Units (kWh)',
    annualSavings: '₹21,600 / yr',
    onGridGross: 134000,
    subsidy: 60000,
    hybridGross: 248000,
    hybridBattery: '7.5 kWh LiFePO4 Module',
    hybridInverter: 'Deye 3.6kW Hybrid Inverter',
    pvQty: 4,
    inverterPrice: 24500,
  },
  3: {
    kw: 3,
    label: '3 kW EcoSync (Recommended)',
    onGridPanelCount: '6x Tier-1 Bifacial TopCon (550Wp)',
    onGridInverter: 'SolarEdge / Havells 3.3kW On-Grid',
    estMonthlyUnits: '~360 - 410 Units (kWh)',
    annualSavings: '₹32,400 / yr',
    onGridGross: 189500,
    subsidy: 78000,
    hybridGross: 345000,
    hybridBattery: '10.2 kWh LiFePO4 Module',
    hybridInverter: 'Deye 5kW High-Voltage Hybrid',
    pvQty: 6,
    inverterPrice: 38000,
  },
  4: {
    kw: 4,
    label: '4 kW PeakPro',
    onGridPanelCount: '8x Tier-1 Bifacial TopCon (550Wp)',
    onGridInverter: 'SolarEdge 4.2kW Dual MPPT',
    estMonthlyUnits: '~480 - 540 Units (kWh)',
    annualSavings: '₹43,200 / yr',
    onGridGross: 242000,
    subsidy: 78000,
    hybridGross: 420000,
    hybridBattery: '12.5 kWh LiFePO4 Module',
    hybridInverter: 'GoodWe 5kW Hybrid Inverter',
    pvQty: 8,
    inverterPrice: 46500,
  },
  5: {
    kw: 5,
    label: '5 kW MasterPower Enterprise',
    onGridPanelCount: '10x Tier-1 Bifacial TopCon (550Wp)',
    onGridInverter: 'Sungrow / SolarEdge 5kW 3-Phase',
    estMonthlyUnits: '~600 - 680 Units (kWh)',
    annualSavings: '₹54,000 / yr',
    onGridGross: 298000,
    subsidy: 78000,
    hybridGross: 498000,
    hybridBattery: '15.3 kWh LiFePO4 Module',
    hybridInverter: 'Solis 6kW High-Voltage Hybrid',
    pvQty: 10,
    inverterPrice: 58000,
  },
};

export function calculateQuotationBOM(kwInput: number): QuotationBreakdown {
  const kw = Math.max(1, Math.min(100, kwInput));
  const preset = PRESET_QUOTES[kw];

  const stateCessExemption = 3500;
  const hybridSafeHarborCredit = 12000;
  const stateDiscomRebate = 7200;

  if (preset) {
    const pvTotal = preset.pvQty * 16500;
    const rackingTotal = preset.pvQty * 3500;
    const bosBase = Math.max(8000, preset.onGridGross - pvTotal - rackingTotal - preset.inverterPrice - 20000);
    const onGridNet = Math.max(0, preset.onGridGross - preset.subsidy - stateCessExemption);
    const hybridNet = Math.max(0, preset.hybridGross - preset.subsidy - hybridSafeHarborCredit);
    const subsidyNetInvest = Math.max(0, onGridNet - stateDiscomRebate + stateCessExemption);

    return {
      kw: preset.kw,
      label: preset.label,
      onGridPanelCount: preset.onGridPanelCount,
      onGridInverter: preset.onGridInverter,
      estMonthlyUnits: preset.estMonthlyUnits,
      annualSavings: preset.annualSavings,
      onGridGross: preset.onGridGross,
      subsidy: preset.subsidy,
      stateCessExemption,
      onGridNet,
      hybridGross: preset.hybridGross,
      hybridBattery: preset.hybridBattery,
      hybridInverter: preset.hybridInverter,
      hybridSafeHarborCredit,
      hybridNet,
      stateDiscomRebate,
      subsidyNetInvest,
      bomItems: [
        {
          id: 'pv-modules',
          title: 'Bifacial Monocrystalline PV Modules',
          spec: '550Wp Tier-1 TOPCon, 144 Half-cut cells, ALMM Listed',
          unitPrice: 16500,
          qtyLabel: `${preset.pvQty} Nos`,
          total: pvTotal,
          icon: 'solar_power',
        },
        {
          id: 'string-inverter',
          title: 'Grid-Tied String Solar Inverter',
          spec: `${preset.onGridInverter}, Dual MPPT, WiFi Web Telemetry, IP65`,
          unitPrice: preset.inverterPrice,
          qtyLabel: '1 Set',
          total: preset.inverterPrice,
          icon: 'power_input',
        },
        {
          id: 'mounting-structure',
          title: 'Elevated Racking & Mounting Structure',
          spec: 'Anodized Aluminum 6005-T5, SS304 Hardware, 160 km/h wind proof',
          unitPrice: 3500,
          qtyLabel: `${preset.pvQty} Panels`,
          total: rackingTotal,
          icon: 'grid_view',
        },
        {
          id: 'bos-protection',
          title: 'Protection Balance of System (BOS)',
          spec: 'ACDB & DCDB with Type-II SPD, MCB, 4sq.mm solar DC cable (35m)',
          unitPrice: bosBase,
          qtyLabel: '1 Lot',
          total: bosBase,
          icon: 'flash_on',
        },
        {
          id: 'earthing',
          title: 'Chemical Earthing & Lightning Arrestor',
          spec: 'Copper-bonded 3m electrode kit (3 nos) + ESE Early Streamer Arrester',
          unitPrice: 8000,
          qtyLabel: '1 Set',
          total: 8000,
          icon: 'security',
        },
        {
          id: 'discom-liaison',
          title: 'DISCOM Net Metering Liaison & Approvals',
          spec: 'Sanction feasibility, CEIG certification, Bi-directional meter install',
          unitPrice: 6000,
          qtyLabel: '1 Job',
          total: 6000,
          icon: 'handshake',
        },
        {
          id: 'turnkey-install',
          title: 'Turnkey Installation & Commissioning',
          spec: 'Civil anchor grouting, electrical wiring, commissioning & safety test',
          unitPrice: 6000,
          qtyLabel: '1 Job',
          total: 6000,
          icon: 'construction',
        },
      ],
    };
  }

  const pvQty = Math.ceil((kw * 1000) / 550);
  const onGridGross = Math.round(kw * 58000);
  const subsidy = kw <= 1 ? 30000 : kw <= 2 ? 60000 : 78000;
  const hybridGross = Math.round(onGridGross * 1.75);
  const onGridNet = Math.max(0, onGridGross - subsidy - stateCessExemption);
  const hybridNet = Math.max(0, hybridGross - subsidy - hybridSafeHarborCredit);
  const subsidyNetInvest = Math.max(0, onGridNet - stateDiscomRebate + stateCessExemption);

  const pvTotal = pvQty * 16500;
  const rackingTotal = pvQty * 3500;
  const inverterPrice = Math.round(kw * 11500);
  const fixedItemsTotal = 8000 + 6000 + 6000;
  const bosPrice = Math.max(9500, onGridGross - pvTotal - rackingTotal - inverterPrice - fixedItemsTotal);

  return {
    kw,
    label: `${kw} kW Custom Engineered Array`,
    onGridPanelCount: `${pvQty}x Tier-1 Bifacial TopCon (550Wp)`,
    onGridInverter: `Industrial Class ${kw}kW On-Grid Dual MPPT`,
    estMonthlyUnits: `~${Math.round(kw * 125)} - ${Math.round(kw * 140)} Units (kWh)`,
    annualSavings: `${formatINR(Math.round(kw * 125 * 12 * 7.5))} / yr`,
    onGridGross,
    subsidy,
    stateCessExemption,
    onGridNet,
    hybridGross,
    hybridBattery: `${(kw * 3.3).toFixed(1)} kWh LiFePO4 Module`,
    hybridInverter: `${kw}kW Multi-Mode Storage Inverter`,
    hybridSafeHarborCredit,
    hybridNet,
    stateDiscomRebate,
    subsidyNetInvest,
    bomItems: [
      {
        id: 'pv-modules',
        title: 'Bifacial Monocrystalline PV Modules',
        spec: '550Wp Tier-1 TOPCon, 144 Half-cut cells, ALMM Listed',
        unitPrice: 16500,
        qtyLabel: `${pvQty} Nos`,
        total: pvTotal,
        icon: 'solar_power',
      },
      {
        id: 'string-inverter',
        title: 'Grid-Tied String Solar Inverter',
        spec: `Industrial Class ${kw}kW Dual MPPT, WiFi Telemetry, IP65`,
        unitPrice: inverterPrice,
        qtyLabel: '1 Set',
        total: inverterPrice,
        icon: 'power_input',
      },
      {
        id: 'mounting-structure',
        title: 'Elevated Racking & Mounting Structure',
        spec: 'Anodized Aluminum 6005-T5, SS304 Hardware, 160 km/h wind proof',
        unitPrice: 3500,
        qtyLabel: `${pvQty} Panels`,
        total: rackingTotal,
        icon: 'grid_view',
      },
      {
        id: 'bos-protection',
        title: 'Protection Balance of System (BOS)',
        spec: 'ACDB & DCDB with Type-II SPD, MCB, Heavy-duty solar DC cable',
        unitPrice: bosPrice,
        qtyLabel: '1 Lot',
        total: bosPrice,
        icon: 'flash_on',
      },
      {
        id: 'earthing',
        title: 'Chemical Earthing & Lightning Arrestor',
        spec: 'Copper-bonded 3m electrode kit (3 nos) + ESE Early Streamer Arrester',
        unitPrice: 8000,
        qtyLabel: '1 Set',
        total: 8000,
        icon: 'security',
      },
      {
        id: 'discom-liaison',
        title: 'DISCOM Net Metering Liaison & Approvals',
        spec: 'Sanction feasibility, CEIG certification, Bi-directional meter install',
        unitPrice: 6000,
        qtyLabel: '1 Job',
        total: 6000,
        icon: 'handshake',
      },
      {
        id: 'turnkey-install',
        title: 'Turnkey Installation & Commissioning',
        spec: 'Civil anchor grouting, electrical wiring, commissioning & safety test',
        unitPrice: 6000,
        qtyLabel: '1 Job',
        total: 6000,
        icon: 'construction',
      },
    ],
  };
}

export type TicketFilter = 'all' | 'open' | 'resolved';

export function filterServiceTickets(
  tickets: ServiceTicket[],
  filter: TicketFilter
): ServiceTicket[] {
  if (filter === 'all') return tickets;
  if (filter === 'resolved') {
    return tickets.filter((t) => t.status === 'Resolved');
  }
  return tickets.filter((t) => t.status !== 'Resolved');
}

export function createServiceTicket(params: {
  category: string;
  severity: 'Low' | 'Medium' | 'High Priority';
  capacity: string;
  customerName: string;
  description: string;
  ticketNumber: number;
}): ServiceTicket {
  return {
    id: `#TCK-${params.ticketNumber}`,
    issueType: params.category,
    issueSub: params.description.trim()
      ? params.description.trim().slice(0, 48)
      : 'Direct Customer Portal Entry',
    customerName: params.customerName.trim() || 'Customer',
    capacityLocation: `${params.capacity.trim() || '5 kW'} · Just Now`,
    technician: 'Auto-Assigning',
    technicianInitials: 'AA',
    slaClock: params.severity === 'High Priority' ? '12h 00m left' : '23h 59m left',
    status: 'Dispatched',
    statusLabel: 'Technician Dispatched',
    severity: params.severity,
  };
}

export function closeServiceTicketWithOtp(
  tickets: ServiceTicket[],
  ticketId: string,
  otpDigits: string[]
): { ok: boolean; error?: string; tickets: ServiceTicket[] } {
  const joined = otpDigits.join('').trim();
  if (!/^\d{4}$/.test(joined)) {
    return {
      ok: false,
      error: 'Please enter all 4 numeric digits of the customer handover OTP.',
      tickets,
    };
  }

  return {
    ok: true,
    tickets: tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: 'Resolved',
            statusLabel: 'Resolved & Closed',
            slaClock: 'Completed (OTP Verified)',
          }
        : t
    ),
  };
}

export function validateHandover(params: {
  otpDigits: string[];
  hasSignature: boolean;
}): { ok: boolean; error?: string } {
  const otp = params.otpDigits.join('').trim();
  if (!/^\d{4}$/.test(otp)) {
    return {
      ok: false,
      error: 'Enter the complete 4-digit customer handshake OTP before commissioning.',
    };
  }
  if (!params.hasSignature) {
    return {
      ok: false,
      error: 'Customer digital signature is required to issue the 25-Year Warranty.',
    };
  }
  return { ok: true };
}

export type CommandSearchCategory =
  | 'Project'
  | 'Quotation'
  | 'Site Survey'
  | 'Service & Warranty'
  | 'Billing & Invoice'
  | 'User Directory';

export interface CommandSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: CommandSearchCategory;
  screen: Exclude<ScreenId, 'auth'>;
  statusTag: string;
}

export const COMMAND_PALETTE_ITEMS: CommandSearchItem[] = [
  {
    id: '#SWP-2025-IND-884',
    title: 'Sharma Residence · 5kW Rooftop Dispatch',
    subtitle: 'Work Order · Marcus Reed Crew · 62% Complete',
    category: 'Project',
    screen: 'installation-dispatch',
    statusTag: 'Active Mount',
  },
  {
    id: 'SUN-2025-9842',
    title: 'Sector 62 · 3kW EcoSync Pro Turnkey',
    subtitle: 'Order & Net-Metering Tracking · DISCOM Sync',
    category: 'Project',
    screen: 'portal-dashboard',
    statusTag: 'In Transit',
  },
  {
    id: 'SP-IN-2024-5K',
    title: 'Vasant Kunj · 5kW Commissioned Rooftop Asset',
    subtitle: '25-Yr Warranty Vault · Munich Re Insured',
    category: 'Project',
    screen: 'service-warranty',
    statusTag: '99.4% Health',
  },
  {
    id: 'SP-QT-2025-4198',
    title: 'Rajesh Sharma · 3kW EcoSync BOM Quotation',
    subtitle: 'On-Grid ₹1,89,500 Gross · ₹78,000 MNRE Subsidy',
    category: 'Quotation',
    screen: 'quotation-engine',
    statusTag: 'Valid 14d',
  },
  {
    id: 'SP-QT-2025-4210',
    title: 'Deepak Singhania · 5kW MasterPower Enterprise Quote',
    subtitle: '10x 550Wp TOPCon · ₹2,98,000 Gross Estimate',
    category: 'Quotation',
    screen: 'quotation-engine',
    statusTag: 'Approved',
  },
  {
    id: 'SP-QT-2025-4225',
    title: 'Sunil Verma · 5kW SolarVault Hybrid Quote',
    subtitle: '15.3 kWh LiFePO4 + 6kW Hybrid Inverter',
    category: 'Quotation',
    screen: 'quotation-engine',
    statusTag: 'Draft BOM',
  },
  {
    id: '#DL-2025-0849',
    title: 'Sharma Residence · Greater Kailash-II Survey',
    subtitle: 'Lead Surveyor: Er. Marcus Reed · 480 sq.ft Usable',
    category: 'Site Survey',
    screen: 'site-survey-engineering',
    statusTag: 'LiDAR Verified',
  },
  {
    id: '#HR-2025-0912',
    title: 'Deepak Singhania · DLF Phase 2 Shadow Audit',
    subtitle: '10 kW Commercial Microgrid · South 180° Azimuth',
    category: 'Site Survey',
    screen: 'site-survey-engineering',
    statusTag: 'Sign-Off Ready',
  },
  {
    id: '#UP-2025-0781',
    title: 'Sarah Jenkins · Noida Sector 62 Roof Inspection',
    subtitle: '3 kW RCC Concrete Slab · 2.8 Ω Earthing Verified',
    category: 'Site Survey',
    screen: 'site-survey-engineering',
    statusTag: 'Completed',
  },
  {
    id: '#TCK-8812',
    title: 'Marcus Reed · 5 kW Annual Preventive Maint.',
    subtitle: 'Assigned: Amit Kumar · Vasant Kunj · 4h 18m SLA',
    category: 'Service & Warranty',
    screen: 'service-warranty',
    statusTag: 'Dispatched',
  },
  {
    id: '#TCK-8774',
    title: 'Deepak Singhania · 10 kW Net Meter Discrepancy',
    subtitle: 'Assigned: Ramesh Patel · DLF Phase 2',
    category: 'Service & Warranty',
    screen: 'service-warranty',
    statusTag: 'High Priority',
  },
  {
    id: 'SP-INV-2025-4198',
    title: 'Rajesh Sharma · Milestone Billing & UPI/Card/Cash',
    subtitle: '3kW EcoSync Pro · ₹83,000 Balance Due',
    category: 'Billing & Invoice',
    screen: 'billing-payments',
    statusTag: 'Partial',
  },
];

export function buildBackendSearchItems(liveOverride?: {
  orders?: any[];
  leads?: any[];
  quotations?: any[];
  surveys?: any[];
  installations?: any[];
  inventory?: any[];
  tickets?: any[];
  warranties?: any[];
}): CommandSearchItem[] {
  const items: CommandSearchItem[] = [];

  const orders = liveOverride?.orders || (BACKEND_DATA.orders as any[]) || [];
  const leads = liveOverride?.leads || (BACKEND_DATA.leads as any[]) || [];
  const quotations = liveOverride?.quotations || (BACKEND_DATA.quotations as any[]) || [];
  const surveys = liveOverride?.surveys || (BACKEND_DATA.surveys as any[]) || [];
  const installations = liveOverride?.installations || (BACKEND_DATA.installations as any[]) || [];
  const inventory = liveOverride?.inventory || (BACKEND_DATA.inventory as any[]) || [];
  const tickets = liveOverride?.tickets || (BACKEND_DATA.tickets as any[]) || [];
  const warranties = liveOverride?.warranties || (BACKEND_DATA.warranties as any[]) || [];

  // 1. Backend Orders (223 records) -> Dual mapped for Billing & Project tracking
  for (const o of orders) {
    const orderNo = o.order_number || `SP-ORD-2025-${o.id}`;
    const totalAmt = Number(o.total_amount_inr || o.total_amount || 0);
    const balAmt = Number(o.balance_due_inr || o.balance_amount || 0);
    const paidAmt = Number(o.advance_paid_inr || o.paid_amount || 0);

    // Billing & Invoice entry (Directly clickable to Billing & Payments screen)
    items.push({
      id: orderNo,
      title: `${o.customer_name} · ${o.capacity_kw}kW ${o.system_type || 'Solar System'}`,
      subtitle: `${o.address || 'Site Address'} · ₹${totalAmt.toLocaleString('en-IN')} (Due: ₹${balAmt.toLocaleString('en-IN')}) · ${o.customer_phone || ''}`,
      category: 'Billing & Invoice',
      screen: 'billing-payments',
      statusTag: `${o.status || 'CONFIRMED'} (${o.payment_status || 'ADVANCE_PAID'})`,
    });

    // Project entry (Order Tracking)
    items.push({
      id: orderNo,
      title: `${o.customer_name} · ${o.capacity_kw}kW Grid Project #${o.id}`,
      subtitle: `${o.address || 'India'} · Paid ₹${paidAmt.toLocaleString('en-IN')} · Subsidy: ${o.subsidy_status || 'APPLIED'}`,
      category: 'Project',
      screen: 'billing-payments',
      statusTag: o.status || 'CONFIRMED',
    });
  }

  // 2. Backend CRM Leads (38 records)
  for (const l of leads) {
    items.push({
      id: `SP-LD-${String(l.id).padStart(4, '0')}`,
      title: `${l.customer_name} · ${l.capacity_kw || 5}kW Lead Inquiry`,
      subtitle: `${l.city || l.address || 'India'} · Bill: ₹${(l.monthly_bill_inr || 0).toLocaleString('en-IN')}/mo · ${l.phone || ''}`,
      category: 'Quotation',
      screen: 'quotation-engine',
      statusTag: l.pipeline_stage || 'NEW',
    });
  }

  // 3. Backend Quotations (30 records)
  for (const q of quotations) {
    const qNo = q.quotation_number || `SP-QT-2025-${5000 + q.id}`;
    const total = Number(q.total || q.grand_total_inr || q.subtotal || 0);
    const subsidy = Number(q.subsidy_estimate || 78000);
    items.push({
      id: qNo,
      title: `${q.lead?.customer_name || 'Client'} · ${q.capacity_kw || 5}kW ${q.system_type || 'Solar'} BOM Quote`,
      subtitle: `Gross: ₹${total.toLocaleString('en-IN')} (Subsidy ₹${subsidy.toLocaleString('en-IN')})`,
      category: 'Quotation',
      screen: 'quotation-engine',
      statusTag: q.status || 'SENT',
    });
  }

  // 4. Backend Site Surveys (32 records)
  for (const s of surveys) {
    items.push({
      id: `#SURV-${3000 + s.id}`,
      title: `${s.lead?.customer_name || 'Site Survey'} · Feasibility Assessment`,
      subtitle: `${s.roof_direction || 'South'} Facing · ${s.tilt_angle_deg || 28}° Tilt · ${s.shadow_free_area_sqft || 425} sq.ft Shadow-Free`,
      category: 'Site Survey',
      screen: 'site-survey-engineering',
      statusTag: 'LiDAR Verified',
    });
  }

  // 5. Backend Installations (18 records)
  for (const inst of installations) {
    items.push({
      id: `#INST-${9000 + inst.id}`,
      title: `${inst.customer_name || 'Client'} · ${inst.system_kw || 5}kW Field Dispatch`,
      subtitle: `Order #${inst.order?.order_number || inst.order_id || inst.id} · Tech: ${inst.technician?.name || 'Field Crew'} · Date: ${inst.scheduled_date || 'Active'}`,
      category: 'Project',
      screen: 'installation-dispatch',
      statusTag: `${inst.status || 'IN_PROGRESS'} (${inst.progress_pct || 100}%)`,
    });
  }

  // 6. Backend Inventory (9 items)
  for (const inv of inventory) {
    items.push({
      id: inv.sku,
      title: `${inv.name} (${inv.category})`,
      subtitle: `In Stock: ${inv.stock_qty} ${inv.unit || 'pcs'} · Unit Price: ₹${(inv.selling_price_inr || inv.unit_price || 0).toLocaleString('en-IN')}`,
      category: 'Project',
      screen: 'operations-analytics',
      statusTag: inv.status || 'IN_STOCK',
    });
  }

  // 7. Backend Tickets (19 records)
  for (const t of tickets) {
    items.push({
      id: t.ticket_number || `#TCK-${t.id}`,
      title: `${t.customer_name || 'Client'} · ${t.subject || 'Support Ticket'}`,
      subtitle: `Ticket #${t.ticket_number || t.id} · Fault: ${t.fault_code || 'Standard SLA'} · Order Ref #${t.order_id || 'N/A'}`,
      category: 'Service & Warranty',
      screen: 'service-warranty',
      statusTag: t.status || 'OPEN',
    });
  }

  // 8. Backend Warranties (15 records)
  for (const w of warranties) {
    items.push({
      id: `WAR-2026-${1000 + w.id}`,
      title: `25-Year Performance Warranty Vault #${w.id}`,
      subtitle: `Valid: ${w.start_date || '2026-10-08'} to ${w.expiry_date || '2046-06-25'} (${Math.round((w.duration_months || 240) / 12)} Yrs Coverage)`,
      category: 'Service & Warranty',
      screen: 'service-warranty',
      statusTag: w.status || 'ACTIVE',
    });
  }

  // 9. Seed Users & User Directory (280 records)
  for (const u of SEED_USERS) {
    items.push({
      id: u.id,
      title: `${u.name} (${u.role})`,
      subtitle: `${u.email} · ${u.phone} · ${u.city} (${u.systemKw}kW)`,
      category: 'User Directory',
      screen: 'operations-analytics',
      statusTag: u.projectStage,
    });
    items.push({
      id: u.invoiceId,
      title: `${u.name} · ${u.systemKw}kW Billing Record`,
      subtitle: `${u.city} (${u.discom}) · Total ₹${u.invoiceAmountInr.toLocaleString('en-IN')} (Paid ₹${u.paidAmountInr.toLocaleString('en-IN')})`,
      category: 'Billing & Invoice',
      screen: 'billing-payments',
      statusTag: u.billingStatus,
    });
  }

  return items;
}

export const INITIAL_ALL_SEARCH_ITEMS: CommandSearchItem[] = [
  ...COMMAND_PALETTE_ITEMS,
  ...buildBackendSearchItems(),
];

export function searchCommandPalette(
  query: string,
  category: CommandSearchCategory | 'All' = 'All',
  pool: CommandSearchItem[] = INITIAL_ALL_SEARCH_ITEMS
): CommandSearchItem[] {
  const normalized = query.trim().toLowerCase();

  const filtered = pool.filter((item) => {
    if (category !== 'All' && item.category !== category) {
      return false;
    }
    if (!normalized) return true;
    return (
      item.id.toLowerCase().includes(normalized) ||
      item.title.toLowerCase().includes(normalized) ||
      item.subtitle.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      item.statusTag.toLowerCase().includes(normalized)
    );
  });

  // If query is empty, return top 30 representative items
  if (!normalized) {
    return filtered.slice(0, 30);
  }

  // If query is present, return up to 100 matching items
  return filtered.slice(0, 100);
}
