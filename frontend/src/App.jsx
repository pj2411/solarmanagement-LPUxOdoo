import React, { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { api } from './api';

// Views
import LoginView from './views/LoginView';
import PublicWebsiteView from './views/PublicWebsiteView';
import AuthView from './views/AuthView';
import CustomerManagementView from './views/CustomerManagementView';
import SiteSurveyView from './views/SiteSurveyView';
import QuotationView from './views/QuotationView';
import OrderPaymentView from './views/OrderPaymentView';
import InventoryView from './views/InventoryView';
import DispatchView from './views/DispatchView';
import InstallationView from './views/InstallationView';
import WarrantyView from './views/WarrantyView';
import HelpdeskView from './views/HelpdeskView';
import EmployeeView from './views/EmployeeView';
import AnalyticsView from './views/AnalyticsView';

// Fallback default datasets to guarantee UI resilience
const DEFAULT_LEADS = [
  {
    id: 1,
    customer_name: 'Arvind Sharma',
    phone: '+91 98101 23456',
    email: 'arvind.sharma@gmail.com',
    address: 'B-42, Sector 15, Noida, Uttar Pradesh 201301',
    capacity_kw: 3.0,
    system_type: 'ON_GRID',
    pipeline_stage: 'INSTALLED',
    monthly_bill_inr: 4200.0,
    subsidy_requested: true
  },
  {
    id: 2,
    customer_name: 'Sunita Rao',
    phone: '+91 98202 88776',
    email: 'sunita.rao@outlook.com',
    address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066',
    capacity_kw: 5.0,
    system_type: 'ON_GRID',
    pipeline_stage: 'WON',
    monthly_bill_inr: 7800.0,
    subsidy_requested: true
  },
  {
    id: 3,
    customer_name: 'Rajesh Mehta',
    phone: '+91 97114 55667',
    email: 'rajesh.mehta@gmail.com',
    address: 'House 88, Model Town, Jalandhar, Punjab 144003',
    capacity_kw: 3.0,
    system_type: 'ON_GRID',
    pipeline_stage: 'SURVEY_SCHEDULED',
    monthly_bill_inr: 3900.0,
    subsidy_requested: true
  }
];

const DEFAULT_SURVEYS = [
  {
    id: 1,
    lead_id: 1,
    technician_id: 6,
    scheduled_date: '2025-05-15',
    roof_direction: 'South-West (210° Azimuth)',
    tilt_angle_deg: 22.5,
    shadow_free_area_sqft: 380.0,
    cable_distance_m: 20.0,
    survey_photo_url: '/photos/survey_roof_default.jpg',
    is_approved: true,
    notes: 'RCC Flat terrace, unshaded South exposure, excellent structural stability.',
    lead: DEFAULT_LEADS[0],
    technician: { id: 6, name: 'Ramesh Sharma', email: 'tech.ramesh.sharma@sunpower.in', role: 'TECHNICIAN' }
  },
  {
    id: 2,
    lead_id: 2,
    technician_id: 8,
    scheduled_date: '2026-11-14',
    roof_direction: 'South (180° Azimuth)',
    tilt_angle_deg: 18.0,
    shadow_free_area_sqft: 650.0,
    cable_distance_m: 32.0,
    survey_photo_url: '/photos/survey_roof_default.jpg',
    is_approved: true,
    notes: 'High-elevation roof. Minimal shadows. Good mounting anchor points.',
    lead: DEFAULT_LEADS[1],
    technician: { id: 8, name: 'Amit Patel', email: 'tech.amit.patel@sunpower.in', role: 'TECHNICIAN' }
  },
  {
    id: 3,
    lead_id: 3,
    technician_id: 9,
    scheduled_date: '2026-11-21',
    roof_direction: 'South (180° Azimuth)',
    tilt_angle_deg: 24.0,
    shadow_free_area_sqft: 340.0,
    cable_distance_m: 18.0,
    survey_photo_url: '/photos/survey_roof_default.jpg',
    is_approved: false, // Pending Approval so Gatekeeper Rule #1 can be verified!
    notes: 'Preliminary check shows good sun access. Water tank may cast minor 4 PM shadow.',
    lead: DEFAULT_LEADS[2],
    technician: { id: 9, name: 'Rajesh Kumar', email: 'tech.rajesh.kumar@sunpower.in', role: 'TECHNICIAN' }
  }
];

import { 
  DEFAULT_INVENTORY, 
  DEFAULT_BOM_TEMPLATES, 
  DEFAULT_ORDERS, 
  DEFAULT_SERIAL_UNITS, 
  DEFAULT_INSTALLATIONS, 
  DEFAULT_TICKETS, 
  DEFAULT_EMPLOYEES, 
  DEFAULT_ANALYTICS 
} from './utils/syntheticData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sunpower_auth') === 'true';
    }
    return false;
  });
  const [currentRole, setCurrentRole] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sunpower_role') || 'ADMIN';
    }
    return 'ADMIN';
  });
  const [currentUser, setCurrentUser] = useState({
    name: 'Vikram Malhotra',
    email: 'admin@sunpower.in',
    role: 'ADMIN'
  });
  const [currentModule, setCurrentModule] = useState('public-website');

  // Shared Data States with robust synthetic defaults for Modules 1-13
  const [leads, setLeads] = useState(DEFAULT_LEADS);
  const [surveys, setSurveys] = useState(DEFAULT_SURVEYS);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [bomTemplates, setBomTemplates] = useState(DEFAULT_BOM_TEMPLATES);
  const [serialUnits, setSerialUnits] = useState(DEFAULT_SERIAL_UNITS);
  const [installations, setInstallations] = useState(DEFAULT_INSTALLATIONS);
  const [tickets, setTickets] = useState(DEFAULT_TICKETS);
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);

  // Fetch all backend data with Promise.allSettled for fault-tolerant resilience
  const refreshAllData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getLeads(),
        api.getSurveys(),
        api.getQuotations(),
        api.getOrders(),
        api.getInventory(),
        api.getBomTemplates(),
        api.getSerials(),
        api.getInstallations(),
        api.getTickets(),
        api.getEmployees(),
        api.getAnalytics(),
      ]);

      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value) && results[0].value.length > 0) {
        setLeads(results[0].value);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value) && results[1].value.length > 0) {
        setSurveys(results[1].value);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
        setQuotations(results[2].value);
      }
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
        setOrders(results[3].value);
      }
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) {
        setInventory(results[4].value);
      }
      if (results[5].status === 'fulfilled' && Array.isArray(results[5].value)) {
        setBomTemplates(results[5].value);
      }
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) {
        setSerialUnits(results[6].value);
      }
      if (results[7].status === 'fulfilled' && Array.isArray(results[7].value)) {
        setInstallations(results[7].value);
      }
      if (results[8].status === 'fulfilled' && Array.isArray(results[8].value)) {
        setTickets(results[8].value);
      }
      if (results[9].status === 'fulfilled' && Array.isArray(results[9].value)) {
        setEmployees(results[9].value);
      }
      if (results[10].status === 'fulfilled' && results[10].value) {
        setAnalytics(results[10].value);
      }
    } catch (err) {
      console.error('Error fetching ERP state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // When role changes, optionally route to the most relevant module
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    const nameMap = {
      ADMIN: 'Vikram Malhotra',
      SALES: 'Pooja Sharma',
      TECHNICIAN: 'Ramesh Sharma',
      WAREHOUSE: 'Gaurav Singhal',
      SUPPORT: 'Neha Kapoor',
      CUSTOMER: 'Arvind Sharma'
    };
    const emailMap = {
      ADMIN: 'admin@sunpower.in',
      SALES: 'sales@sunpower.in',
      TECHNICIAN: 'tech.ramesh.sharma@sunpower.in',
      WAREHOUSE: 'warehouse@sunpower.in',
      SUPPORT: 'support@sunpower.in',
      CUSTOMER: 'arvind.sharma@gmail.com'
    };
    setCurrentUser({
      role: newRole,
      name: nameMap[newRole] || 'Vikram Malhotra',
      email: emailMap[newRole] || 'admin@sunpower.in'
    });

    switch (newRole) {
      case 'CUSTOMER':
        setCurrentModule('customers');
        break;
      case 'SALES':
        setCurrentModule('site-survey');
        break;
      case 'WAREHOUSE':
        setCurrentModule('dispatch');
        break;
      case 'TECHNICIAN':
        setCurrentModule('installations');
        break;
      case 'SUPPORT':
        setCurrentModule('helpdesk');
        break;
      case 'ADMIN':
      default:
        setCurrentModule('analytics');
        break;
    }
  };

  // Detect if standalone public website mode is requested via URL search or hash
  const [isStandalonePublic, setIsStandalonePublic] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'public' || window.location.hash.startsWith('#/public');
    }
    return false;
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setIsStandalonePublic(params.get('view') === 'public' || window.location.hash.startsWith('#/public'));
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sunpower_auth');
    }
  };

  // Standalone Public Website View (Completely isolated without ERP sidebar)
  if (isStandalonePublic) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {/* Sleek Standalone Public Header */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/20 flex-shrink-0">
              <Sun className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-none">
                SunPower Solutions
              </div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-medium mt-1 leading-none">
                India Rooftop Solar EPC
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
            <a href="#about" className="hover:text-amber-400 transition-colors">About</a>
            <a href="#systems" className="hover:text-amber-400 transition-colors">Packages</a>
            <a href="#calculator" className="hover:text-amber-400 transition-colors">Solar Calculator</a>
            <a href="#subsidy" className="hover:text-amber-400 transition-colors">DBT Subsidy</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              Get Free Survey
            </a>
            <button
              type="button"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                if (url.hash.startsWith('#/public')) url.hash = '';
                window.location.href = url.pathname + (url.search ? url.search : '');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
              title="Return to ERP Portal"
            >
              Staff ERP Portal
            </button>
          </div>
        </header>

        {/* Public Content Container */}
        <main className="flex-1 p-4 lg:p-8 bg-square-grid">
          <PublicWebsiteView 
            isStandalone={true}
            onNavigate={(mod) => {
              if (mod === 'quotations') {
                const el = document.getElementById('systems');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
            onLeadCreated={refreshAllData} 
          />
        </main>
      </div>
    );
  }

  // Dedicated Separate Login Page - Completely isolated from main portal
  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={(userData) => {
          const role = userData.role || 'ADMIN';
          setCurrentRole(role);
          setCurrentUser({
            name: userData.name || (role === 'ADMIN' ? 'Vikram Malhotra' : 'Authorized User'),
            email: userData.email || 'admin@sunpower.in',
            role
          });
          setIsAuthenticated(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sunpower_auth', 'true');
            localStorage.setItem('sunpower_role', role);
          }

          // Route to relevant initial view based on role
          refreshAllData();
          switch (role) {
            case 'CUSTOMER':
              setCurrentModule('public-website');
              break;
            case 'SALES':
              setCurrentModule('site-survey');
              break;
            case 'WAREHOUSE':
              setCurrentModule('dispatch');
              break;
            case 'TECHNICIAN':
              setCurrentModule('installations');
              break;
            case 'SUPPORT':
              setCurrentModule('helpdesk');
              break;
            case 'ADMIN':
            default:
              setCurrentModule('analytics');
              break;
          }
        }}
        onExplorePublic={() => {
          setCurrentRole('CUSTOMER');
          setCurrentUser({
            name: 'Arvind Sharma',
            email: 'arvind.sharma@gmail.com',
            role: 'CUSTOMER'
          });
          setCurrentModule('public-website');
          setIsAuthenticated(true);
          refreshAllData();
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar 
        currentModule={currentModule}
        onModuleSelect={setCurrentModule}
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        stats={analytics}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-square-grid">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                Connecting to SQLite Relational Backend...
              </div>
            </div>
          ) : (
            <>
              {currentModule === 'public-website' && (
                <PublicWebsiteView 
                  onNavigate={setCurrentModule} 
                  onLeadCreated={refreshAllData} 
                />
              )}
              {currentModule === 'auth' && (
                <AuthView 
                  currentRole={currentRole} 
                  onRoleChange={handleRoleChange} 
                />
              )}
              {currentModule === 'customers' && (
                <CustomerManagementView 
                  leads={leads} 
                  onRefresh={refreshAllData} 
                  onNavigate={setCurrentModule} 
                />
              )}
              {currentModule === 'site-survey' && (
                <SiteSurveyView 
                  surveys={surveys} 
                  leads={leads}
                  employees={employees} 
                  onRefresh={refreshAllData} 
                  onNavigate={setCurrentModule} 
                  currentRole={currentRole}
                  currentUser={currentUser}
                />
              )}
              {currentModule === 'quotations' && (
                <QuotationView 
                  quotations={quotations} 
                  leads={leads} 
                  surveys={surveys} 
                  onRefresh={refreshAllData} 
                  onNavigate={setCurrentModule} 
                />
              )}
              {currentModule === 'orders' && (
                <OrderPaymentView 
                  orders={orders} 
                  onRefresh={refreshAllData} 
                  onNavigate={setCurrentModule} 
                />
              )}
              {currentModule === 'inventory' && (
                <InventoryView 
                  inventory={inventory} 
                  bomTemplates={bomTemplates} 
                  onRefresh={refreshAllData} 
                />
              )}
              {currentModule === 'dispatch' && (
                <DispatchView 
                  serialUnits={serialUnits} 
                  orders={orders} 
                  inventory={inventory} 
                  onRefresh={refreshAllData} 
                />
              )}
              {currentModule === 'installations' && (
                <InstallationView 
                  installations={installations} 
                  employees={employees} 
                  onRefresh={refreshAllData} 
                />
              )}
              {currentModule === 'warranty' && (
                <WarrantyView 
                  serialUnits={serialUnits} 
                />
              )}
              {currentModule === 'helpdesk' && (
                <HelpdeskView 
                  tickets={tickets} 
                  leads={leads} 
                  serialUnits={serialUnits} 
                  employees={employees} 
                  onRefresh={refreshAllData} 
                />
              )}
              {currentModule === 'employees' && (
                <EmployeeView 
                  employees={employees} 
                  onRefresh={refreshAllData} 
                />
              )}
              {currentModule === 'analytics' && (
                <AnalyticsView 
                  analyticsData={analytics} 
                />
              )}
            </>
          )}
        </main>
    </div>
  );
}
