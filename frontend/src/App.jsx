import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RoleSwitcher from './components/RoleSwitcher';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [viewingPublicOnly, setViewingPublicOnly] = useState(false);
  const [currentRole, setCurrentRole] = useState('ADMIN');
  const [currentUser, setCurrentUser] = useState({
    name: 'Vikram Malhotra',
    email: 'admin@sunpower.in',
    role: 'ADMIN'
  });
  const [currentModule, setCurrentModule] = useState('public-website');

  // Shared Data States
  const [leads, setLeads] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bomTemplates, setBomTemplates] = useState([]);
  const [serialUnits, setSerialUnits] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all backend data
  const refreshAllData = async () => {
    try {
      const [
        leadsData,
        surveysData,
        quotesData,
        ordersData,
        invData,
        bomData,
        serialsData,
        installsData,
        ticketsData,
        empsData,
        analyticsData,
      ] = await Promise.all([
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

      setLeads(leadsData);
      setSurveys(surveysData);
      setQuotations(quotesData);
      setOrders(ordersData);
      setInventory(invData);
      setBomTemplates(bomData);
      setSerialUnits(serialsData);
      setInstallations(installsData);
      setTickets(ticketsData);
      setEmployees(empsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching ERP state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentRole(user.role || 'ADMIN');
    setIsAuthenticated(true);
    setViewingPublicOnly(false);

    // Route to most relevant module for persona
    switch (user.role) {
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewingPublicOnly(false);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setCurrentUser(prev => ({
      ...prev,
      role: newRole,
      name: newRole === 'ADMIN' ? 'Vikram Malhotra' :
            newRole === 'SALES' ? 'Pooja Sharma' :
            newRole === 'TECHNICIAN' ? 'Ramesh Sharma' :
            newRole === 'WAREHOUSE' ? 'Gaurav Singhal' :
            newRole === 'SUPPORT' ? 'Neha Kapoor' : 'Arvind Sharma'
    }));

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

  // If user is not authenticated and hasn't clicked "Explore Public Site", display the full Login Gateway
  if (!isAuthenticated && !viewingPublicOnly) {
    return (
      <LoginView 
        onLogin={handleLogin}
        onExplorePublic={() => setViewingPublicOnly(true)}
      />
    );
  }

  // If unauthenticated user chose to explore public website
  if (!isAuthenticated && viewingPublicOnly) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-6 lg:p-8">
        <PublicWebsiteView 
          onNavigate={(mod) => {
            if (mod === 'quotations' || mod === 'customers') {
              setViewingPublicOnly(false); // prompt login
            }
          }}
          onLeadCreated={refreshAllData}
          onSignInClick={() => setViewingPublicOnly(false)}
        />
      </div>
    );
  }

  // Authenticated ERP Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1-Click Role Switcher Top Bar */}
      <RoleSwitcher 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
      />

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-65px)]">
        {/* Left Sidebar with 13 Modules */}
        <Sidebar 
          currentModule={currentModule}
          onModuleSelect={setCurrentModule}
          currentUser={currentUser}
          onLogout={handleLogout}
          stats={analytics}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 motion-safe:animate-ping motion-reduce:opacity-75" />
                <span>Connecting to SQLite database</span>
              </div>
            </div>
          ) : (
            <>
              {currentModule === 'public-website' && (
                <PublicWebsiteView 
                  onNavigate={setCurrentModule} 
                  onLeadCreated={refreshAllData} 
                  onSignInClick={() => setCurrentModule('auth')}
                />
              )}
              {currentModule === 'auth' && (
                <AuthView 
                  currentRole={currentRole} 
                  onRoleChange={handleRoleChange} 
                  currentUser={currentUser}
                  onLoginSuccess={handleLogin}
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
                  employees={employees} 
                  onRefresh={refreshAllData} 
                  onNavigate={setCurrentModule} 
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
    </div>
  );
}
