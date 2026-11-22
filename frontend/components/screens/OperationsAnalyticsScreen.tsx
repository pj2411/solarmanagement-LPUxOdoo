'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Ellipsis,
  Filter,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { ScreenId } from '@/lib/solar-data';
import { formatINR } from '@/lib/solar-logic';
import {
  SEED_USERS,
  filterAndPaginateUsers,
  type SolarUserRecord,
} from '@/lib/solar-users';
import { downloadCsvFile } from '@/lib/pdf-qr-comms';
import { ShareCommsModal, type ShareCommsPayload } from '@/components/ShareCommsModal';

interface OperationsAnalyticsScreenProps {
  onNavigate: (screen: ScreenId, options?: { invoiceId?: string }) => void;
  onShowToast: (message: string) => void;
}

type ViewMode = 'command' | 'trends' | 'metrics' | 'operations' | 'users';
type Period = '7 days' | '30 days' | '90 days';
type WorkStatus = 'Needs review' | 'Scheduled' | 'Running' | 'Exceptions';

interface WorkItem {
  id: string;
  name: string;
  description: string;
  tool: string;
  owner: string;
  status: WorkStatus;
  timestamp: string;
}

const PERIODS: Period[] = ['7 days', '30 days', '90 days'];
const WORK_STATUSES: WorkStatus[] = [
  'Needs review',
  'Scheduled',
  'Running',
  'Exceptions',
];

const INITIAL_WORK_ITEMS: WorkItem[] = [
  {
    id: 'OP-241',
    name: 'MNRE Subsidy Claim #4198',
    description: 'Verify Aadhaar bank seeding & net-meter seal before DBT upload.',
    tool: 'MNRE Portal',
    owner: 'Finance',
    status: 'Needs review',
    timestamp: '10:42 AM',
  },
  {
    id: 'OP-238',
    name: 'Site Survey Dispatch · GK-II',
    description: 'Confirm Er. Marcus Reed LiDAR point cloud clearance.',
    tool: 'Survey GIS',
    owner: 'Engineering',
    status: 'Needs review',
    timestamp: '10:16 AM',
  },
  {
    id: 'OP-235',
    name: 'TOPCon 550W Inventory Restock',
    description: 'Replenish 24 Tier-1 Bifacial panels at Sector-62 Hub.',
    tool: 'Warehouse',
    owner: 'Operations',
    status: 'Scheduled',
    timestamp: '15:00 PM',
  },
  {
    id: 'OP-234',
    name: 'Weekly DISCOM SLA Digest',
    description: 'Compile regional BSES/DHBVN commissioning & net-meter stats.',
    tool: 'Reports',
    owner: 'Analytics',
    status: 'Scheduled',
    timestamp: 'Fri 09:00',
  },
  {
    id: 'OP-232',
    name: 'Sync 142 Customer Invoices',
    description: 'Reconcile UPI QR, Card & Cash milestones across seeded accounts.',
    tool: 'Billing Hub',
    owner: 'Finance',
    status: 'Running',
    timestamp: '09:52 AM',
  },
  {
    id: 'OP-229',
    name: 'Inverter IoT Telemetry Stream',
    description: 'Streaming live DC string voltages from 280 solar households.',
    tool: 'IoT Cloud',
    owner: 'Support',
    status: 'Running',
    timestamp: '09:23 AM',
  },
  {
    id: 'OP-227',
    name: 'Net-Meter Phase Sync Hold',
    description: 'TCK-8774 awaiting DHBVN inspector counter-signature on Phase-2.',
    tool: 'DISCOM',
    owner: 'Field Ops',
    status: 'Exceptions',
    timestamp: '09:06 AM',
  },
  {
    id: 'OP-223',
    name: 'Overdue Milestone Follow-up',
    description: 'Automated WhatsApp & Gmail payment reminder paused for review.',
    tool: 'Comms',
    owner: 'Billing',
    status: 'Exceptions',
    timestamp: '08:41 AM',
  },
];

const RECENT_ACTIVITY = [
  {
    id: 'ACT-108',
    event: 'Quotation SP-QT-2025-4198 PDF & QR generated',
    source: 'Quote Engine',
    status: 'Complete',
    time: '10:38 AM',
  },
  {
    id: 'ACT-107',
    event: 'MNRE DBT Subsidy claim sent to owner review',
    source: 'Subsidy Desk',
    status: 'Needs review',
    time: '10:24 AM',
  },
  {
    id: 'ACT-106',
    event: 'Net-metering commissioning inspection scheduled',
    source: 'DISCOM Sync',
    status: 'Scheduled',
    time: '10:07 AM',
  },
  {
    id: 'ACT-105',
    event: '25-Yr Munich Re Warranty Certificate issued',
    source: 'Warranty Vault',
    status: 'Complete',
    time: '09:51 AM',
  },
  {
    id: 'ACT-104',
    event: 'DHBVN meter calibration exception flagged',
    source: 'Field Dispatch',
    status: 'Exceptions',
    time: '09:06 AM',
  },
] as const;

const ANALYTICS_DATA: Record<
  Period,
  {
    revenueInr: number;
    orders: number;
    surveys: number;
    exceptions: number;
    automation: number;
    revenueChange: string;
    orderChange: string;
    surveyChange: string;
    exceptionChange: string;
    axis: string[];
    collectedLakhs: number[];
    costsLakhs: number[];
    residentialShare: number[];
    tierMix: number[];
  }
> = {
  '7 days': {
    revenueInr: 1845000,
    orders: 31,
    surveys: 54,
    exceptions: 3,
    automation: 304,
    revenueChange: '+6.4%',
    orderChange: '+8.2%',
    surveyChange: '+5.1%',
    exceptionChange: '-12.0%',
    axis: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
    collectedLakhs: [2.1, 2.4, 2.2, 2.9, 2.6, 2.8, 3.45],
    costsLakhs: [1.3, 1.45, 1.28, 1.62, 1.5, 1.58, 1.85],
    residentialShare: [62, 65, 60, 58, 63, 66, 61],
    tierMix: [56, 32, 12],
  },
  '30 days': {
    revenueInr: 7420000,
    orders: 128,
    surveys: 214,
    exceptions: 9,
    automation: 1284,
    revenueChange: '+11.3%',
    orderChange: '+14.0%',
    surveyChange: '+9.4%',
    exceptionChange: '-4.2%',
    axis: ['Oct 19', 'Oct 24', 'Oct 29', 'Nov 3', 'Nov 8', 'Nov 13', 'Nov 17'],
    collectedLakhs: [8.4, 9.6, 8.9, 11.2, 10.4, 11.8, 13.9],
    costsLakhs: [5.6, 6.2, 5.9, 6.8, 6.5, 7.1, 7.9],
    residentialShare: [66, 59, 64, 58, 61, 57, 63],
    tierMix: [58, 30, 12],
  },
  '90 days': {
    revenueInr: 21860000,
    orders: 382,
    surveys: 642,
    exceptions: 18,
    automation: 3562,
    revenueChange: '+16.8%',
    orderChange: '+19.5%',
    surveyChange: '+12.6%',
    exceptionChange: '-7.5%',
    axis: ['Aug 20', 'Sep 4', 'Sep 19', 'Oct 4', 'Oct 19', 'Nov 3', 'Nov 17'],
    collectedLakhs: [24.2, 28.0, 26.8, 31.4, 33.1, 35.8, 39.3],
    costsLakhs: [15.6, 17.8, 17.1, 19.4, 20.5, 21.8, 23.9],
    residentialShare: [64, 62, 59, 55, 58, 63, 60],
    tierMix: [54, 34, 12],
  },
};

const AUTOMATION_BARS = [
  { label: 'Tue', complete: 108, review: 10 },
  { label: 'Wed', complete: 176, review: 11 },
  { label: 'Thu', complete: 138, review: 14 },
  { label: 'Fri', complete: 213, review: 19 },
  { label: 'Sat', complete: 155, review: 12 },
  { label: 'Sun', complete: 161, review: 15 },
  { label: 'Mon', complete: 238, review: 14 },
];

const TIER_LABELS = ['On-Grid', 'Hybrid ESS', 'Commercial'];
const TIER_COLORS = ['#0e7a66', '#002e03', '#996300'];

function buildSmoothCurve(points: Array<[number, number]>): string {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M ${x} ${y}`;
    const [px, py] = points[index - 1];
    const mid = (x + px) / 2;
    return `${path} C ${mid} ${py}, ${mid} ${y}, ${x} ${y}`;
  }, '');
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === 'Complete' || status === 'Running' || status === 'Paid'
      ? 'bg-[#bcebc0]/60 text-[#002e03]'
      : status === 'Needs review' || status === 'Exceptions' || status === 'Overdue'
      ? 'bg-[#ffdad6] text-[#93000a]'
      : status === 'Partial'
      ? 'bg-[#fef3c7] text-[#92400e]'
      : 'bg-[#efeeeb] text-[#42493f]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function OperationsAnalyticsScreen({
  onNavigate,
  onShowToast,
}: OperationsAnalyticsScreenProps) {
  const [view, setView] = useState<ViewMode>('command');
  const [period, setPeriod] = useState<Period>('30 days');
  const [activityQuery, setActivityQuery] = useState('');
  const [activityStatus, setActivityStatus] = useState('All statuses');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);
  const [activeTierSlice, setActiveTierSlice] = useState<number | null>(null);

  // Kanban Operations State
  const [workItems, setWorkItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [laneFilter, setLaneFilter] = useState<WorkStatus | 'All lanes'>('All lanes');
  const [inspectedWork, setInspectedWork] = useState<WorkItem | null>(null);

  // 280 Seeded Users Directory State
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userBillingFilter, setUserBillingFilter] = useState('All');
  const [userPage, setUserPage] = useState(1);

  // Share Modal for User contact
  const [sharePayload, setSharePayload] = useState<ShareCommsPayload | null>(null);

  const stats = ANALYTICS_DATA[period];

  const userAggregates = useMemo(() => {
    const totalUsers = SEED_USERS.length;
    const totalKw = SEED_USERS.reduce((acc, u) => acc + u.systemKw, 0);
    const totalCollected = SEED_USERS.reduce((acc, u) => acc + u.paidAmountInr, 0);
    const totalBilled = SEED_USERS.reduce((acc, u) => acc + u.invoiceAmountInr, 0);
    return { totalUsers, totalKw, totalCollected, totalBilled };
  }, []);

  const paginatedUsers = useMemo(
    () =>
      filterAndPaginateUsers(SEED_USERS, {
        query: userQuery,
        roleFilter: userRoleFilter,
        billingFilter: userBillingFilter,
        page: userPage,
        pageSize: 15,
      }),
    [userQuery, userRoleFilter, userBillingFilter, userPage]
  );

  const filteredActivity = useMemo(() => {
    const q = activityQuery.trim().toLowerCase();
    return RECENT_ACTIVITY.filter((row) => {
      const matchesStatus =
        activityStatus === 'All statuses' || row.status === activityStatus;
      const matchesQ =
        !q ||
        row.event.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q);
      return matchesStatus && matchesQ;
    });
  }, [activityQuery, activityStatus]);

  const handleExportCsv = () => {
    if (view === 'users') {
      downloadCsvFile(
        'sunpower-280-users-directory.csv',
        ['User ID', 'Name', 'Role', 'Email', 'Phone', 'City', 'DISCOM', 'kW', 'Stage', 'Invoice ID', 'Invoice INR', 'Paid INR', 'Billing Status'],
        SEED_USERS.map((u) => [
          u.id,
          u.name,
          u.role,
          u.email,
          u.phone,
          u.city,
          u.discom,
          u.systemKw,
          u.projectStage,
          u.invoiceId,
          u.invoiceAmountInr,
          u.paidAmountInr,
          u.billingStatus,
        ])
      );
      onShowToast('Exported all 280 SunPower user records to CSV.');
      return;
    }

    downloadCsvFile(
      `sunpower-analytics-${period.replace(/\s+/g, '-')}.csv`,
      ['Period', 'Bucket', 'Revenue (INR Lakhs)', 'Operating Costs (INR Lakhs)', 'Orders'],
      stats.axis.map((label, idx) => [
        period,
        label,
        stats.collectedLakhs[idx],
        stats.costsLakhs[idx],
        Math.round(stats.orders / stats.axis.length),
      ])
    );
    onShowToast(`Exported ${period} operational telemetry CSV.`);
  };

  const handleUpdateWorkStatus = (id: string, nextStatus: WorkStatus) => {
    setWorkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    setInspectedWork((prev) => (prev && prev.id === id ? { ...prev, status: nextStatus } : prev));
    onShowToast(`Moved ${id} to "${nextStatus}".`);
  };

  const dockItems: { id: ViewMode; label: string; short: string; icon: React.ReactNode }[] = [
    {
      id: 'command',
      label: 'Command Center',
      short: 'Command',
      icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'trends',
      label: 'Trends',
      short: 'Trends',
      icon: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'metrics',
      label: 'Metrics',
      short: 'Metrics',
      icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'operations',
      label: 'Operations Board',
      short: 'Ops',
      icon: <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'users',
      label: `Users Directory (${userAggregates.totalUsers})`,
      short: 'Users',
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  const viewTitles: Record<ViewMode, { title: string; subtitle: string }> = {
    command: {
      title: 'Solar Command Center',
      subtitle: 'Live revenue, 280-account telemetry, automation capacity, and recent activity.',
    },
    trends: {
      title: 'Financial & Yield Trends',
      subtitle: 'Operating revenue vs execution costs across residential and commercial rooftops.',
    },
    metrics: {
      title: 'Portfolio Metrics',
      subtitle: 'On-grid, Hybrid ESS, and commercial installation breakdowns.',
    },
    operations: {
      title: 'Operations Kanban Queue',
      subtitle: 'Track MNRE approvals, warehouse schedules, telemetry streams, and exceptions.',
    },
    users: {
      title: 'SunPower User & Project Directory',
      subtitle: 'Search, inspect, contact, or settle invoices across all 280 seeded accounts.',
    },
  };

  // Revenue Spline Chart calculations
  const plotW = 600;
  const plotH = 190;
  const maxVal = Math.max(...stats.collectedLakhs, ...stats.costsLakhs) * 1.15;
  const toPoints = (arr: number[]): Array<[number, number]> =>
    arr.map((v, i) => [
      (i * plotW) / Math.max(1, arr.length - 1),
      plotH - (v / maxVal) * plotH,
    ]);
  const revPts = toPoints(stats.collectedLakhs);
  const costPts = toPoints(stats.costsLakhs);
  const revCurve = buildSmoothCurve(revPts);
  const costCurve = buildSmoothCurve(costPts);

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 pb-24 lg:pb-10">
      <div className="relative lg:pl-20">
        {/* Floating Side Dock (Desktop) — Light-first Glassmorphic Accent */}
        <aside
          aria-label="Analytics Workspace Views"
          className="hidden lg:flex flex-col gap-1.5 fixed left-4 xl:left-8 top-32 z-30 p-2 rounded-3xl bg-[#ffffff]/88 backdrop-blur-md border border-[#c2c9bc] shadow-[0_12px_36px_rgba(0,22,1,0.12)]"
        >
          {dockItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#42493f] hover:bg-[#efeeeb] hover:text-[#001601]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="ops-dock-active"
                    className="absolute inset-0 rounded-2xl bg-[#002e03]"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Glass Stage Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-[#ffffff]/86 backdrop-blur-md border border-[#c2c9bc]/80 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6"
        >
          {/* Top View Header + Period Switcher + Export */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#e3e2df]">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#0e7a66]">
                SunPower Spatial Intelligence · {userAggregates.totalUsers} Active Accounts ·{' '}
                {userAggregates.totalKw.toFixed(0)} kWp Managed
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-[#001601] uppercase leading-none tracking-wide">
                {viewTitles[view].title}
              </h1>
              <p className="text-xs sm:text-sm text-[#42493f]">
                {viewTitles[view].subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Switcher Pills inside Stage for clarity */}
              <div className="flex items-center gap-1 bg-[#f4f3f0] border border-[#c2c9bc]/70 p-1 rounded-xl overflow-x-auto">
                {dockItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      view === item.id
                        ? 'bg-[#001601] text-white'
                        : 'text-[#42493f] hover:text-[#1a1c1a]'
                    }`}
                  >
                    {item.short}
                  </button>
                ))}
              </div>

              <div
                className="inline-flex items-center bg-[#f4f3f0] border border-[#c2c9bc]/70 p-1 rounded-xl"
                role="group"
                aria-label="Reporting period"
              >
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={period === p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      period === p
                        ? 'bg-[#0e7a66] text-white'
                        : 'text-[#42493f] hover:text-[#1a1c1a]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-[#002e03] hover:bg-[#001601] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: COMMAND CENTER */}
          {view === 'command' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Total Revenue Card */}
                <div className="lg:col-span-4 rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#42493f]">
                        Settled Portfolio Revenue
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#efeeeb] text-[10px] font-bold text-[#001601]">
                        INR
                      </span>
                    </div>
                    <div className="font-display text-4xl sm:text-5xl text-[#001601] tabular-nums mt-2 leading-none">
                      {formatINR(userAggregates.totalCollected + stats.revenueInr)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#bcebc0]/70 text-[#002e03] font-bold">
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        {stats.revenueChange}
                      </span>
                      <span className="text-[#42493f]">vs prior {period}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setView('trends')}
                      className="py-2.5 px-3 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>View Trends</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('billing-payments')}
                      className="py-2.5 px-3 rounded-xl bg-[#ffffff] hover:bg-[#efeeeb] border border-[#c2c9bc] text-[#001601] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Collect Dues</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e3e2df] text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-[#42493f] block">On-Grid</span>
                      <strong className="text-[#001601]">
                        {formatINR(stats.revenueInr * 0.68)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#42493f] block">Hybrid ESS</span>
                      <strong className="text-[#001601]">
                        {formatINR(stats.revenueInr * 0.21)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#42493f] block">AMC / SLA</span>
                      <strong className="text-[#001601]">
                        {formatINR(stats.revenueInr * 0.11)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 4 KPI Summary Grid */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#002e03] text-white p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#bcebc0]">
                        Telemetry Syncs
                      </span>
                      <Zap className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl tabular-nums mt-2">
                      {stats.automation.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-[#bcebc0] font-medium">
                      +9.6% vs prior {period}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#42493f]">
                        Seeded Accounts
                      </span>
                      <Users className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl text-[#001601] tabular-nums mt-2">
                      {userAggregates.totalUsers}
                    </div>
                    <button
                      type="button"
                      onClick={() => setView('users')}
                      className="text-[11px] text-[#0e7a66] font-semibold text-left hover:underline"
                    >
                      Open 280 User Directory →
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#42493f]">
                        SLA Exceptions
                      </span>
                      <ArrowDownRight className="w-4 h-4 text-[#a43c27]" aria-hidden="true" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl text-[#a43c27] tabular-nums mt-2">
                      {stats.exceptions}
                    </div>
                    <div className="text-[11px] text-[#42493f]">
                      {stats.exceptionChange} vs prior
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#42493f]">
                        Active Capacity
                      </span>
                      <ListChecks className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl text-[#001601] tabular-nums mt-2">
                      {userAggregates.totalKw.toFixed(0)} kW
                    </div>
                    <div className="text-[11px] text-[#0e7a66] font-semibold">
                      Across 10 Indian Cities
                    </div>
                  </div>
                </div>

                {/* Stacked Bar Chart: Automation Activity */}
                <div className="lg:col-span-4 rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#001601]">
                        Dispatch &amp; Automation Activity
                      </h2>
                      <p className="text-[11px] text-[#42493f]">
                        Completed vs Owner Review · Last 7 days
                      </p>
                    </div>
                    {hoveredBar !== null && (
                      <span className="text-[11px] font-mono-tabular font-bold text-[#0e7a66]">
                        {AUTOMATION_BARS[hoveredBar].label}:{' '}
                        {AUTOMATION_BARS[hoveredBar].complete +
                          AUTOMATION_BARS[hoveredBar].review}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2 h-36 items-end pt-4 border-b border-[#e3e2df]">
                    {AUTOMATION_BARS.map((bar, idx) => {
                      const total = bar.complete + bar.review;
                      const heightPct = (total / 270) * 100;
                      const reviewPct = (bar.review / total) * 100;
                      return (
                        <button
                          key={bar.label}
                          type="button"
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                          onClick={() => setHoveredBar(idx)}
                          className="h-full flex flex-col items-center justify-end group focus:outline-none"
                          aria-label={`${bar.label}: ${bar.complete} complete, ${bar.review} review`}
                        >
                          <div
                            className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col transition-opacity"
                            style={{ height: `${heightPct}%` }}
                          >
                            <div
                              className="w-full bg-[#0e7a66]"
                              style={{ height: `${reviewPct}%`, minHeight: 3 }}
                            />
                            <div className="w-full flex-1 bg-[#001601]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-7 gap-2 pt-1.5 text-center text-[10px] text-[#42493f] font-mono-tabular">
                    {AUTOMATION_BARS.map((b) => (
                      <span key={b.label}>{b.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Split: Capacity & Approvals + Recent Activity Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#001601]">
                        Monthly Execution Capacity
                      </h3>
                      <span className="text-xs font-mono-tabular font-bold text-[#0e7a66]">
                        58.4%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#e3e2df] overflow-hidden">
                      <div className="h-full bg-[#0e7a66] rounded-full w-[58.4%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#42493f]">
                      <span>
                        <strong className="text-[#001601]">1,284</strong> dispatches used
                      </span>
                      <span>2,200 monthly target</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-[#bcebc0] text-[#002e03] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#001601]">
                          Owner Approvals Queued
                        </h3>
                        <p className="text-[11px] text-[#42493f]">
                          {workItems.filter((w) => w.status === 'Needs review').length}{' '}
                          items waiting in Operations
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView('operations')}
                      aria-label="Open Operations Board"
                      className="w-9 h-9 rounded-xl bg-[#001601] text-white flex items-center justify-center shrink-0 hover:bg-[#002e03]"
                    >
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Recent Activity Table */}
                <div className="lg:col-span-8 rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#001601]">
                      Recent Operational Activity
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search
                          className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#42493f]"
                          aria-hidden="true"
                        />
                        <input
                          type="search"
                          value={activityQuery}
                          onChange={(e) => setActivityQuery(e.target.value)}
                          placeholder="Search activity..."
                          aria-label="Search recent activity"
                          className="pl-8 pr-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#c2c9bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                        />
                      </div>
                      <select
                        aria-label="Filter activity status"
                        value={activityStatus}
                        onChange={(e) => setActivityStatus(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#ffffff] border border-[#c2c9bc] text-xs font-medium"
                      >
                        {['All statuses', 'Complete', 'Needs review', 'Scheduled', 'Exceptions'].map(
                          (st) => (
                            <option key={st}>{st}</option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#e3e2df] text-[10px] uppercase tracking-wider text-[#42493f]">
                          <th className="py-2.5 px-3">Activity</th>
                          <th className="py-2.5 px-3">Module</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e3e2df]">
                        {filteredActivity.map((item) => (
                          <tr key={item.id} className="hover:bg-[#ffffff]">
                            <td className="py-2.5 px-3 font-semibold text-[#1a1c1a]">
                              {item.event}
                            </td>
                            <td className="py-2.5 px-3 text-[#42493f]">
                              {item.source}
                            </td>
                            <td className="py-2.5 px-3">
                              <StatusPill status={item.status} />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono-tabular text-[#42493f]">
                              {item.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2 & 3: TRENDS & METRICS */}
          {(view === 'trends' || view === 'metrics') && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-[#002e03] text-white p-4">
                  <span className="text-[11px] uppercase font-semibold text-[#bcebc0]">
                    Period Revenue
                  </span>
                  <div className="font-display text-3xl mt-1 tabular-nums">
                    {formatINR(stats.revenueInr)}
                  </div>
                  <span className="text-[11px] text-[#bcebc0]">
                    {stats.revenueChange} vs prior
                  </span>
                </div>
                <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4">
                  <span className="text-[11px] uppercase font-semibold text-[#42493f]">
                    Work Orders
                  </span>
                  <div className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    {stats.orders}
                  </div>
                  <span className="text-[11px] text-[#0e7a66] font-semibold">
                    {stats.orderChange} growth
                  </span>
                </div>
                <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4">
                  <span className="text-[11px] uppercase font-semibold text-[#42493f]">
                    Site Surveys
                  </span>
                  <div className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    {stats.surveys}
                  </div>
                  <span className="text-[11px] text-[#0e7a66] font-semibold">
                    {stats.surveyChange} LiDAR completed
                  </span>
                </div>
                <div className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-4">
                  <span className="text-[11px] uppercase font-semibold text-[#42493f]">
                    Operating Margin
                  </span>
                  <div className="font-display text-3xl text-[#001601] mt-1 tabular-nums">
                    36.8%
                  </div>
                  <span className="text-[11px] text-[#42493f]">
                    After BOS &amp; EPC costs
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Main Chart Card */}
                <div className="lg:col-span-8 rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-[#001601]">
                        {view === 'trends'
                          ? 'Revenue vs Execution Costs (₹ Lakhs)'
                          : 'System Revenue Split (Residential vs Commercial)'}
                      </h2>
                      <p className="text-[11px] text-[#42493f]">
                        Hover or select any checkpoint across {period}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0e7a66]" />
                        {view === 'trends' ? 'Revenue' : 'Residential'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#001601]" />
                        {view === 'trends' ? 'Execution Cost' : 'Commercial'}
                      </span>
                    </div>
                  </div>

                  {view === 'trends' ? (
                    <div className="relative">
                      <svg
                        viewBox={`0 0 ${plotW} ${plotH}`}
                        className="w-full h-52 overflow-visible"
                        aria-label="Revenue vs Operating Costs Line Chart"
                      >
                        {[0.25, 0.5, 0.75, 1].map((f) => (
                          <line
                            key={f}
                            x1={0}
                            x2={plotW}
                            y1={plotH * f}
                            y2={plotH * f}
                            stroke="#e3e2df"
                            strokeDasharray="3 4"
                          />
                        ))}
                        <path
                          d={revCurve}
                          fill="none"
                          stroke="#0e7a66"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d={costCurve}
                          fill="none"
                          stroke="#001601"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {revPts.map(([x, y], idx) => (
                          <g key={stats.axis[idx]}>
                            <circle
                              cx={x}
                              cy={y}
                              r={hoveredLinePoint === idx ? 6 : 4}
                              fill="#0e7a66"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredLinePoint(idx)}
                              onClick={() => setHoveredLinePoint(idx)}
                            />
                            <circle
                              cx={costPts[idx][0]}
                              cy={costPts[idx][1]}
                              r={hoveredLinePoint === idx ? 5 : 3.5}
                              fill="#001601"
                            />
                          </g>
                        ))}
                      </svg>
                      <div className="flex justify-between text-[11px] text-[#42493f] font-mono-tabular mt-2">
                        {stats.axis.map((lbl, idx) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setHoveredLinePoint(idx)}
                            className={`px-1.5 py-0.5 rounded ${
                              hoveredLinePoint === idx
                                ? 'bg-[#001601] text-white'
                                : ''
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                      {hoveredLinePoint !== null && (
                        <div className="mt-3 p-3 rounded-xl bg-[#ffffff] border border-[#c2c9bc] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#001601]">
                            Checkpoint: {stats.axis[hoveredLinePoint]}
                          </span>
                          <span className="font-mono-tabular text-[#0e7a66] font-bold">
                            Revenue: ₹{stats.collectedLakhs[hoveredLinePoint]}L
                          </span>
                          <span className="font-mono-tabular text-[#001601] font-semibold">
                            Costs: ₹{stats.costsLakhs[hoveredLinePoint]}L
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-3 h-48 items-end pt-4 border-b border-[#e3e2df]">
                        {stats.axis.map((lbl, idx) => {
                          const total = stats.collectedLakhs[idx];
                          const resPct = stats.residentialShare[idx];
                          const hPct = (total / maxVal) * 100;
                          return (
                            <div
                              key={lbl}
                              className="h-full flex flex-col items-center justify-end"
                            >
                              <div
                                className="w-full max-w-[34px] rounded-t-lg overflow-hidden flex flex-col"
                                style={{ height: `${hPct}%` }}
                              >
                                <div
                                  className="w-full bg-[#001601]"
                                  style={{ height: `${100 - resPct}%` }}
                                />
                                <div className="w-full flex-1 bg-[#0e7a66]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-7 gap-3 text-center text-[11px] font-mono-tabular text-[#42493f]">
                        {stats.axis.map((lbl) => (
                          <span key={lbl}>{lbl}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* System Tier Mix Ring */}
                <div className="lg:col-span-4 rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-5 flex flex-col justify-between space-y-4">
                  <h2 className="text-sm font-bold text-[#001601]">
                    System Architecture Mix
                  </h2>
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 124 124" className="w-full h-full -rotate-90">
                      <circle
                        cx="62"
                        cy="62"
                        r="47"
                        fill="none"
                        stroke="#e3e2df"
                        strokeWidth="14"
                      />
                      {stats.tierMix.map((pct, i) => {
                        const offset = stats.tierMix
                          .slice(0, i)
                          .reduce((s, v) => s + v, 0);
                        return (
                          <circle
                            key={TIER_LABELS[i]}
                            cx="62"
                            cy="62"
                            r="47"
                            pathLength={100}
                            fill="none"
                            stroke={TIER_COLORS[i]}
                            strokeWidth="14"
                            strokeDasharray={`${Math.max(0, pct - 1.5)} 100`}
                            strokeDashoffset={-offset}
                            opacity={
                              activeTierSlice !== null && activeTierSlice !== i
                                ? 0.35
                                : 1
                            }
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-display text-2xl text-[#001601] leading-none">
                        {activeTierSlice === null
                          ? `${stats.orders}`
                          : `${stats.tierMix[activeTierSlice]}%`}
                      </span>
                      <span className="text-[10px] text-[#42493f] font-semibold mt-0.5">
                        {activeTierSlice === null
                          ? 'Deployments'
                          : TIER_LABELS[activeTierSlice]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {stats.tierMix.map((pct, i) => (
                      <button
                        key={TIER_LABELS[i]}
                        type="button"
                        onClick={() =>
                          setActiveTierSlice(activeTierSlice === i ? null : i)
                        }
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeTierSlice === i
                            ? 'bg-[#ffffff] border border-[#0e7a66]'
                            : 'hover:bg-[#ffffff]'
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium text-[#1a1c1a]">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: TIER_COLORS[i] }}
                          />
                          {TIER_LABELS[i]}
                        </span>
                        <strong className="font-mono-tabular text-[#001601]">
                          {pct}%
                        </strong>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: OPERATIONS KANBAN BOARD */}
          {view === 'operations' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#42493f]">
                  <span className="font-bold text-[#001601]">
                    {workItems.length} Active Queue Items
                  </span>
                  <span>·</span>
                  <span>
                    Click any card to inspect details or advance stage
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5 text-[#0e7a66]" aria-hidden="true" />
                  <select
                    aria-label="Filter operations lanes"
                    value={laneFilter}
                    onChange={(e) =>
                      setLaneFilter(e.target.value as WorkStatus | 'All lanes')
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#faf9f6] border border-[#c2c9bc] text-xs"
                  >
                    {['All lanes', ...WORK_STATUSES].map((lane) => (
                      <option key={lane}>{lane}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div
                className={`grid gap-4 ${
                  laneFilter === 'All lanes'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {(laneFilter === 'All lanes' ? WORK_STATUSES : [laneFilter]).map(
                  (lane) => {
                    const items = workItems.filter((w) => w.status === lane);
                    return (
                      <section
                        key={lane}
                        aria-label={lane}
                        className="rounded-2xl bg-[#faf9f6] border border-[#c2c9bc]/70 p-3.5 space-y-3"
                      >
                        <header className="flex items-center justify-between pb-2 border-b border-[#e3e2df]">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#001601] flex items-center gap-1.5">
                            {lane === 'Exceptions' ? (
                              <TriangleAlert
                                className="w-3.5 h-3.5 text-[#a43c27]"
                                aria-hidden="true"
                              />
                            ) : lane === 'Running' ? (
                              <Zap
                                className="w-3.5 h-3.5 text-[#0e7a66]"
                                aria-hidden="true"
                              />
                            ) : (
                              <Clock3
                                className="w-3.5 h-3.5 text-[#42493f]"
                                aria-hidden="true"
                              />
                            )}
                            {lane}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#efeeeb] text-[10px] font-bold text-[#1a1c1a]">
                            {items.length}
                          </span>
                        </header>

                        <div className="space-y-2.5">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setInspectedWork(item)}
                              className="w-full text-left p-3.5 rounded-xl bg-[#ffffff] hover:border-[#0e7a66] border border-[#e3e2df] space-y-2 transition-colors shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <strong className="text-xs font-bold text-[#001601]">
                                  {item.name}
                                </strong>
                                <Ellipsis
                                  className="w-4 h-4 text-[#72796e] shrink-0"
                                  aria-hidden="true"
                                />
                              </div>
                              <p className="text-[11px] text-[#42493f] leading-relaxed">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#42493f] pt-1">
                                <span>
                                  {item.tool} · {item.owner}
                                </span>
                                <span>{item.timestamp}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: 280 SEEDED USERS DIRECTORY */}
          {view === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#faf9f6] border border-[#e3e2df] p-3.5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#42493f]"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={userQuery}
                      onChange={(e) => {
                        setUserQuery(e.target.value);
                        setUserPage(1);
                      }}
                      placeholder="Search 280 users by name, ID, email, phone, city, or invoice..."
                      aria-label="Search 280 users"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#ffffff] border border-[#c2c9bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                    />
                  </div>

                  <select
                    aria-label="Filter by role"
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#c2c9bc] text-xs font-medium"
                  >
                    {['All', 'Customer', 'Engineer', 'Installer', 'Admin'].map(
                      (r) => (
                        <option key={r} value={r}>
                          Role: {r}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    aria-label="Filter by billing status"
                    value={userBillingFilter}
                    onChange={(e) => {
                      setUserBillingFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#c2c9bc] text-xs font-medium"
                  >
                    {['All', 'Paid', 'Partial', 'Pending', 'Overdue'].map((b) => (
                      <option key={b} value={b}>
                        Billing: {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs font-mono-tabular font-semibold text-[#001601]">
                  Showing {paginatedUsers.items.length} of{' '}
                  {paginatedUsers.totalCount} users (Total Seeded:{' '}
                  {userAggregates.totalUsers})
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#e3e2df] bg-[#ffffff]">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#f4f3f0] text-[#42493f] uppercase text-[10px] tracking-wider border-b border-[#e3e2df]">
                      <th className="py-3 px-3">User ID</th>
                      <th className="py-3 px-3">Name &amp; Contact</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">City / DISCOM</th>
                      <th className="py-3 px-3">System</th>
                      <th className="py-3 px-3">Invoice / Paid</th>
                      <th className="py-3 px-3">Billing</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e2df] tabular-nums">
                    {paginatedUsers.items.map((u: SolarUserRecord) => (
                      <tr key={u.id} className="hover:bg-[#faf9f6]">
                        <td className="py-3 px-3 font-mono-tabular font-bold text-[#001601]">
                          {u.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1a1c1a]">{u.name}</div>
                          <div className="text-[11px] text-[#42493f]">
                            {u.email} · {u.phone}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#002e03]">
                          {u.role}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#1a1c1a]">{u.city}</div>
                          <div className="text-[10px] text-[#42493f]">{u.discom}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#0e7a66]">
                          {u.systemKw} kW · {u.projectStage}
                        </td>
                        <td className="py-3 px-3 font-mono-tabular">
                          <div className="font-bold text-[#001601]">
                            {formatINR(u.invoiceAmountInr)}
                          </div>
                          <div className="text-[10px] text-[#42493f]">
                            Paid: {formatINR(u.paidAmountInr)} ({u.invoiceId})
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusPill status={u.billingStatus} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onNavigate('billing-payments', {
                                  invoiceId: u.invoiceId,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#001601] hover:bg-[#002e03] text-white text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" aria-hidden="true" />
                              <span>Pay</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSharePayload({
                                  title: `Account Alert · ${u.id}`,
                                  recipientName: u.name,
                                  defaultPhone: u.phone,
                                  defaultEmail: u.email,
                                  subject: `SunPower Solar Update · ${u.invoiceId} (${u.systemKw}kW)`,
                                  message: `Hello ${u.name},\n\nYour ${u.systemKw}kW Solar Project (${u.id}) in ${u.city} (${u.discom}) is currently at stage: ${u.projectStage}.\nInvoice ${u.invoiceId}: Total ${formatINR(u.invoiceAmountInr)} | Paid ${formatINR(u.paidAmountInr)} (${u.billingStatus}).\n\nRegards,\nSunPower Solutions`,
                                  qrValue: `SUNPOWER|USER|${u.id}|INV:${u.invoiceId}|BAL:${u.invoiceAmountInr - u.paidAmountInr}`,
                                  qrLabel: `${u.id} · ${u.invoiceId}`,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 text-[#0e7a66]" aria-hidden="true" />
                              <span>Contact</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-[#42493f] font-mono-tabular">
                  Page {paginatedUsers.currentPage} of {paginatedUsers.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={paginatedUsers.currentPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#f4f3f0] border border-[#c2c9bc] text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    disabled={paginatedUsers.currentPage >= paginatedUsers.totalPages}
                    onClick={() =>
                      setUserPage((p) =>
                        Math.min(paginatedUsers.totalPages, p + 1)
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#f4f3f0] border border-[#c2c9bc] text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Floating Dock (Mobile) */}
        <nav
          aria-label="Mobile Analytics Views"
          className="lg:hidden fixed bottom-3 inset-x-3 z-30 bg-[#ffffff]/92 backdrop-blur-md border border-[#c2c9bc] rounded-2xl p-1.5 shadow-lg grid grid-cols-5 gap-1"
        >
          {dockItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${
                  active
                    ? 'bg-[#002e03] text-white'
                    : 'text-[#42493f] hover:bg-[#efeeeb]'
                }`}
              >
                {item.icon}
                <span className="truncate max-w-full">{item.short}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Work Item Detail & Status Transition Modal */}
      {inspectedWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
          onClick={() => setInspectedWork(null)}
          role="dialog"
          aria-modal="true"
          aria-label={inspectedWork.name}
        >
          <div
            className="w-full max-w-md bg-[#ffffff] border border-[#c2c9bc] rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono-tabular font-bold text-[#0e7a66]">
                  {inspectedWork.id} · {inspectedWork.tool}
                </span>
                <h3 className="font-display text-2xl text-[#001601] uppercase mt-0.5">
                  {inspectedWork.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedWork(null)}
                aria-label="Close work detail"
                className="w-8 h-8 rounded-lg bg-[#f4f3f0] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#42493f] leading-relaxed">
              {inspectedWork.description}
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs bg-[#f4f3f0] p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-[#42493f] block">Owner</span>
                <strong className="text-[#001601]">{inspectedWork.owner}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#42493f] block">Time</span>
                <strong className="text-[#001601]">{inspectedWork.timestamp}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#42493f] block">Lane</span>
                <strong className="text-[#0e7a66]">{inspectedWork.status}</strong>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#42493f] block mb-2">
                Move Queue Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                {WORK_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateWorkStatus(inspectedWork.id, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                      inspectedWork.status === st
                        ? 'bg-[#001601] text-white border-[#001601]'
                        : 'bg-[#faf9f6] text-[#1a1c1a] border-[#c2c9bc] hover:bg-[#efeeeb]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
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
