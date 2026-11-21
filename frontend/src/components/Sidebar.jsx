import React, { useState } from 'react';
import {
  Globe,
  Lock,
  Users,
  Compass,
  FileSpreadsheet,
  ReceiptText,
  Package,
  QrCode,
  HardHat,
  ShieldCheck,
  Headphones,
  UserCheck,
  BarChart3,
  Sun,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const MODULES = [
  { 
    id: 'public-website', 
    label: '1. Public Website', 
    icon: Globe, 
    badge: 'Calculator',
    subItems: ['Home Page', 'About Company', 'Solar Products', 'On-Grid Systems', 'Off-Grid Systems', 'Solar Savings Calculator', 'Subsidy Information', 'Contact & Enquiry'] 
  },
  { 
    id: 'auth', 
    label: '2. Authentication', 
    icon: Lock, 
    subItems: ['Login', 'Registration', 'Forgot Password', 'Role-Based Authentication'] 
  },
  { 
    id: 'customers', 
    label: '3. Customer Management', 
    icon: Users, 
    badge: 'CRM',
    subItems: ['Customer Registration', 'Customer Profile', 'Customer Enquiries', 'Enquiry Follow-up', 'Customer History', 'Customer Portal'] 
  },
  { 
    id: 'site-survey', 
    label: '4. Site Survey Management', 
    icon: Compass, 
    gatekeeper: true,
    subItems: ['Survey Scheduling', 'Technician Assignment', 'Roof Inspection', 'Roof Direction & Tilt', 'Shadow-Free Area', 'Cable Distance', 'Survey Photographs', 'Survey Approval'] 
  },
  { 
    id: 'quotations', 
    label: '5. Quotation Management', 
    icon: FileSpreadsheet, 
    subItems: ['Solar System Selection (1-5 kW)', 'On-Grid Quotation', 'Off-Grid Quotation', 'Component Price Calculation', 'Installation Charges', 'Quotation PDF', 'Customer Approval'] 
  },
  { 
    id: 'orders', 
    label: '6. Order & Payment Management', 
    icon: ReceiptText, 
    subItems: ['Order Creation', 'Order Confirmation', 'Advance Payment', 'Full Payment', 'Payment Tracking', 'Invoice Generation'] 
  },
  { 
    id: 'inventory', 
    label: '7. Inventory Management', 
    icon: Package, 
    subItems: ['Solar Panels', 'Inverters', 'Batteries', 'Mounting Structures', 'Wires & Connectors', 'Safety Equipment', 'Stock Management', 'Automatic BOM Generation', 'Low Stock Alerts'] 
  },
  { 
    id: 'dispatch', 
    label: '8. Dispatch & Serial Tracking', 
    icon: QrCode, 
    subItems: ['Material Packing', 'Product Dispatch', 'QR / Barcode Scanning', 'Serial Number Registration', 'Customer-Product Mapping', 'Delivery Confirmation'] 
  },
  { 
    id: 'installations', 
    label: '9. Installation Management', 
    icon: HardHat, 
    subItems: ['Installation Scheduling', 'Technician Assignment', 'Installation Progress', 'Start & Finish Time', 'Installation Photographs', 'System Testing', 'Customer Digital Signature', 'Installation Completion'] 
  },
  { 
    id: 'warranty', 
    label: '10. Warranty Management', 
    icon: ShieldCheck, 
    subItems: ['Warranty Registration', 'Product Serial Number', 'Warranty Start Date', 'Warranty Expiry Date', 'Warranty Status', 'Warranty Notifications'] 
  },
  { 
    id: 'helpdesk', 
    label: '11. Service & Maintenance', 
    icon: Headphones, 
    badge: 'Zero-Click',
    subItems: ['Customer Complaints', 'Service Ticket Generation', 'Fault Code Management', 'Warranty Verification', 'Technician Assignment', 'Repair Management', 'Replacement Management', 'Ticket Closure'] 
  },
  { 
    id: 'employees', 
    label: '12. Employee Management', 
    icon: UserCheck, 
    subItems: ['Employee Registration', 'Technician Profiles', 'Attendance', 'Work Scheduling', 'Leave Management', 'Salary Management'] 
  },
  { 
    id: 'analytics', 
    label: '13. Admin & Financial Analytics', 
    icon: BarChart3, 
    badge: 'Live P&L',
    subItems: ['Admin Dashboard', 'Total Revenue', 'Total Expenses', 'Profit & Loss', 'Project-Wise Profit', 'Pending Payments', 'Inventory Valuation', 'Government Subsidy Tracking', 'Employee Payments', 'Monthly Reports'] 
  },
];

export default function Sidebar({
  currentModule,
  onModuleSelect,
  currentUser,
  onLogout,
  stats
}) {
  const [expandedModule, setExpandedModule] = useState(currentModule);

  const handleModuleClick = (modId) => {
    onModuleSelect(modId);
    setExpandedModule(prev => prev === modId ? null : modId);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
            <Sun className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              SunPower ERP
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 leading-none truncate">
              Solar Installation Suite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
        <div className="text-[10px] font-semibold text-slate-400 px-3 py-1">
          13 Enterprise Modules
        </div>

        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentModule === mod.id;
          const isExpanded = expandedModule === mod.id;

          let badgeText = mod.badge;
          let badgeColor = 'bg-slate-800 text-slate-300';

          if (mod.id === 'inventory' && stats?.low_stock_items_count > 0) {
            badgeText = `${stats.low_stock_items_count} Low`;
            badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
          }
          if (mod.id === 'helpdesk' && stats?.tickets_summary?.open > 0) {
            badgeText = `${stats.tickets_summary.open} Open`;
            badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
          }

          return (
            <div key={mod.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleModuleClick(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{mod.label}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {badgeText && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${badgeColor}`}>
                      {badgeText}
                    </span>
                  )}
                  {mod.subItems && (
                    isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )
                  )}
                </div>
              </button>

              {/* Collapsible Blueprint Sub-Features */}
              {isExpanded && mod.subItems && (
                <div className="pl-7 pr-2 py-1 space-y-1 border-l-2 border-slate-800 ml-4 my-1">
                  {mod.subItems.map((sub, idx) => (
                    <div 
                      key={idx}
                      className="text-[11px] text-slate-400 hover:text-amber-300 cursor-pointer py-0.5 truncate flex items-center gap-1.5 transition-colors"
                      onClick={() => onModuleSelect(mod.id)}
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Authenticated User Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {currentUser?.name ? currentUser.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {currentUser?.name || 'Authorized User'}
              </div>
              <div className="text-[10px] text-amber-400 font-mono truncate leading-tight">
                {currentUser?.role || 'ADMIN'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Sign out of ERP session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
