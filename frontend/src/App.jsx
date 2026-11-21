import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { api } from './api';
import { Moon, Sun, Bell } from 'lucide-react';

// Views
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
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
  const [currentUser, setCurrentUser] = useState({
    name: 'Vikram Malhotra',
    email: 'admin@sunpower.in',
    role: 'ADMIN'
  });
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);

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

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

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
    setIsAuthenticated(true);
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRoleChange = (newRole) => {
    setCurrentUser(prev => ({
      ...prev,
      role: newRole,
      name: newRole === 'ADMIN' ? 'Vikram Malhotra' :
            newRole === 'SALES' ? 'Pooja Sharma' :
            newRole === 'TECHNICIAN' ? 'Ramesh Sharma' :
            newRole === 'WAREHOUSE' ? 'Gaurav Singhal' :
            newRole === 'SUPPORT' ? 'Neha Kapoor' : 'Arvind Sharma'
    }));
  };

  // If user is not authenticated, display the Login Page
  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={handleLogin}
        isDark={isDark}
        onToggleDark={toggleTheme}
      />
    );
  }

  // Active breadcrumb title
  const moduleLabelMap = {
    'dashboard': 'DASHBOARD',
    'inventory': 'STOCK',
    'dispatch': 'MOVE HISTORY',
    'orders': 'RECEIPTS',
    'delivery': 'DELIVERY',
    'installations': 'TRANSFERS',
    'adjustments': 'ADJUSTMENTS',
    'quotations': 'PRODUCTS',
    'warehouses': 'WAREHOUSES',
    'site-survey': 'LOCATIONS',
    'customers': 'SUPPLIERS',
    'reorder-rules': 'REORDER RULES',
    'warranty': 'WARRANTY REGISTRY',
    'helpdesk': 'SERVICE HELPDESK',
    'analytics': 'EXECUTIVE P&L',
    'public-website': 'CUSTOMER PORTAL',
    'auth': 'AUTHENTICATION'
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-[#0E0F12] text-[#18181B] dark:text-[#FAFAFA] flex flex-col font-sans transition-colors">
      <div className="flex-1 flex overflow-hidden h-screen">
        {/* Full-Height Left Sidebar - No nested hamburger menus */}
        <Sidebar 
          currentModule={currentModule}
          onModuleSelect={setCurrentModule}
          currentUser={currentUser}
          onLogout={handleLogout}
          onRoleChange={handleRoleChange}
          stats={analytics}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Minimalist Top Breadcrumb Bar - No bulky persona banners */}
          <header className="h-14 px-6 border-b border-[#E8E8E5] dark:border-[#272A34] bg-white dark:bg-[#15171C] flex items-center justify-between flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA]">
              <span>SUNPOWER ERP</span>
              <span className="text-[#A1A1AA]">/</span>
              <span className="font-bold text-[#18181B] dark:text-[#FAFAFA]">
                {moduleLabelMap[currentModule] || currentModule.toUpperCase()}
              </span>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                type="button"
                className="w-8 h-8 rounded-lg border border-[#E8E8E5] dark:border-[#272A34] bg-[#FBFBFA] dark:bg-[#1C1E24] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white flex items-center justify-center transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-[#E8E8E5] dark:border-[#272A34] bg-[#FBFBFA] dark:bg-[#1C1E24] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white flex items-center justify-center transition-colors relative"
                title="Notifications"
                onClick={() => alert(`Active alerts: ${analytics?.low_stock_items_count || 0} items low on stock.`)}
              >
                <Bell className="w-4 h-4" />
                {analytics?.low_stock_items_count > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C53B3B]" />
                )}
              </button>
            </div>
          </header>

          {/* Main Content View */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F9F9F8] dark:bg-[#0E0F12]">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-[#71717A] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C53B3B] animate-ping" />
                  <span>Connecting to operational database...</span>
                </div>
              </div>
            ) : (
              <>
                {currentModule === 'dashboard' && (
                  <DashboardView 
                    inventory={inventory}
                    orders={orders}
                    serialUnits={serialUnits}
                    installations={installations}
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

                {currentModule === 'orders' && (
                  <OrderPaymentView 
                    orders={orders} 
                    onRefresh={refreshAllData} 
                    onNavigate={setCurrentModule} 
                  />
                )}

                {currentModule === 'delivery' && (
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

                {currentModule === 'adjustments' && (
                  <InventoryView 
                    inventory={inventory} 
                    bomTemplates={bomTemplates} 
                    onRefresh={refreshAllData} 
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

                {currentModule === 'warehouses' && (
                  <InventoryView 
                    inventory={inventory} 
                    bomTemplates={bomTemplates} 
                    onRefresh={refreshAllData} 
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

                {currentModule === 'customers' && (
                  <CustomerManagementView 
                    leads={leads} 
                    onRefresh={refreshAllData} 
                    onNavigate={setCurrentModule} 
                  />
                )}

                {currentModule === 'reorder-rules' && (
                  <InventoryView 
                    inventory={inventory} 
                    bomTemplates={bomTemplates} 
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

                {currentModule === 'analytics' && (
                  <AnalyticsView 
                    analyticsData={analytics} 
                  />
                )}

                {currentModule === 'public-website' && (
                  <PublicWebsiteView 
                    onNavigate={setCurrentModule} 
                    onLeadCreated={refreshAllData} 
                  />
                )}

                {currentModule === 'auth' && (
                  <AuthView 
                    currentRole={currentUser.role} 
                    onRoleChange={handleRoleChange} 
                    currentUser={currentUser}
                    onLoginSuccess={handleLogin}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
