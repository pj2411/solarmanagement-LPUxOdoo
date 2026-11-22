'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { ScreenId, UserRole } from '@/lib/solar-data';
import { setAuthToken, clearAuthToken } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { PortalDashboardScreen } from '@/components/screens/PortalDashboardScreen';
import { OperationsAnalyticsScreen } from '@/components/screens/OperationsAnalyticsScreen';
import { QuotationEngineScreen } from '@/components/screens/QuotationEngineScreen';
import { SiteSurveyScreen } from '@/components/screens/SiteSurveyScreen';
import { InstallationDispatchScreen } from '@/components/screens/InstallationDispatchScreen';
import { BillingPaymentScreen } from '@/components/screens/BillingPaymentScreen';
import { ServiceWarrantyScreen } from '@/components/screens/ServiceWarrantyScreen';
import { AuthPortalScreen } from '@/components/screens/AuthPortalScreen';

const VALID_SCREENS: ScreenId[] = [
  'portal-dashboard',
  'operations-analytics',
  'quotation-engine',
  'site-survey-engineering',
  'installation-dispatch',
  'billing-payments',
  'service-warranty',
  'auth',
];

const ROLE_PERMITTED_SCREENS: Record<UserRole, ScreenId[]> = {
  Customer: ['portal-dashboard', 'quotation-engine', 'billing-payments', 'service-warranty', 'auth'],
  Engineer: ['site-survey-engineering', 'installation-dispatch', 'service-warranty', 'auth'],
  Technician: ['site-survey-engineering', 'installation-dispatch', 'service-warranty', 'auth'],
  Installer: ['installation-dispatch', 'service-warranty', 'auth'],
  Admin: [
    'operations-analytics',
    'portal-dashboard',
    'quotation-engine',
    'site-survey-engineering',
    'installation-dispatch',
    'billing-payments',
    'service-warranty',
    'auth',
  ],
};

interface SunPowerAppProps {
  initialScreen?: ScreenId;
}

export function SunPowerApp({ initialScreen = 'auth' }: SunPowerAppProps) {
  const [mounted, setMounted] = useState(false);
  // Initial phase MUST be logged-out and show zero operational data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeScreen, setActiveScreen] = useState<ScreenId>(
    VALID_SCREENS.includes(initialScreen) ? initialScreen : 'auth'
  );
  const [activeRole, setActiveRole] = useState<UserRole>('Customer');
  const [userRole, setUserRole] = useState<UserRole>('Customer');
  const [userName, setUserName] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(
    undefined
  );
  const [passwordOverrides, setPasswordOverrides] = useState<
    Record<string, string>
  >({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Handle Google OAuth callback redirect parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const oauthRole = urlParams.get('role');
    const oauthName = urlParams.get('name') || urlParams.get('email');
    if (token) {
      setAuthToken(token);
      const roleMapping: Record<string, UserRole> = {
        ADMIN: 'Admin',
        CUSTOMER: 'Customer',
        SALES: 'Customer',
        TECHNICIAN: 'Engineer',
        WAREHOUSE: 'Installer',
        SUPPORT: 'Admin',
      };
      const resolvedRole: UserRole = (oauthRole && roleMapping[oauthRole.toUpperCase()]) || 'Customer';
      setUserRole(resolvedRole);
      setActiveRole(resolvedRole);
      setUserName(oauthName ? decodeURIComponent(oauthName) : 'Google User');
      setIsAuthenticated(true);
      const targetScreen: ScreenId =
        resolvedRole === 'Engineer' || resolvedRole === 'Technician'
          ? 'site-survey-engineering'
          : resolvedRole === 'Installer'
          ? 'installation-dispatch'
          : resolvedRole === 'Admin'
          ? 'operations-analytics'
          : 'portal-dashboard';
      setActiveScreen(targetScreen);

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('access_token');
      cleanUrl.searchParams.delete('role');
      cleanUrl.searchParams.delete('email');
      cleanUrl.searchParams.delete('name');
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  }, []);

  const handleShowToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const handleNavigate = useCallback(
    (screen: ScreenId, options?: { invoiceId?: string }) => {
      if (options?.invoiceId) {
        setSelectedInvoiceId(options.invoiceId);
      }
      setActiveScreen(screen);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        const url = new URL(window.location.href);
        url.searchParams.set('screen', screen);
        window.history.replaceState({}, '', url.toString());
      }
    },
    []
  );

  const handleRoleChange = useCallback(
    (role: UserRole) => {
      setActiveRole(role);
      const nextDefault: ScreenId =
        role === 'Engineer' || role === 'Technician'
          ? 'site-survey-engineering'
          : role === 'Installer'
          ? 'installation-dispatch'
          : role === 'Admin'
          ? 'operations-analytics'
          : 'portal-dashboard';
      if (!ROLE_PERMITTED_SCREENS[role]?.includes(activeScreen)) {
        setActiveScreen(nextDefault);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('screen', nextDefault);
          window.history.replaceState({}, '', url.toString());
        }
      }
      handleShowToast(`Switched workspace view to ${role} perspective.`);
    },
    [activeScreen, handleShowToast]
  );

  const handleAuthenticated = useCallback(
    ({ role, userName: nextName }: { role: UserRole; userName: string }) => {
      setUserRole(role);
      setActiveRole(role);
      setUserName(nextName);
      setIsAuthenticated(true);
      const defaultScreen: ScreenId =
        role === 'Engineer' || role === 'Technician'
          ? 'site-survey-engineering'
          : role === 'Installer'
          ? 'installation-dispatch'
          : role === 'Admin'
          ? 'operations-analytics'
          : 'portal-dashboard';
      setActiveScreen(defaultScreen);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('screen', defaultScreen);
        window.history.replaceState({}, '', url.toString());
      }
    },
    []
  );

  const handleSignOut = useCallback(() => {
    clearAuthToken();
    setIsAuthenticated(false);
    setUserRole('Customer');
    setActiveRole('Customer');
    setUserName('');
    setActiveScreen('auth');
    handleShowToast('Signed out cleanly. Portal data locked until next login.');
  }, [handleShowToast]);

  const handlePasswordReset = useCallback((userId: string, newPass: string) => {
    setPasswordOverrides((prev) => ({
      ...prev,
      [userId]: newPass,
    }));
  }, []);

  const isScreenAllowed = ROLE_PERMITTED_SCREENS[activeRole]?.includes(activeScreen);
  const defaultScreenForRole: ScreenId = 
    activeRole === 'Engineer' || activeRole === 'Technician'
      ? 'site-survey-engineering'
      : activeRole === 'Installer'
      ? 'installation-dispatch'
      : activeRole === 'Admin'
      ? 'operations-analytics'
      : 'portal-dashboard';

  const effectiveScreen: ScreenId = isAuthenticated 
    ? (isScreenAllowed ? activeScreen : defaultScreenForRole)
    : 'auth';

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#faf9f6]"
        suppressHydrationWarning
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-[#0e7a66] border-t-transparent"
          suppressHydrationWarning
        />
      </div>
    );
  }

  return (
    <AppShell
      activeScreen={effectiveScreen}
      onNavigate={handleNavigate}
      activeRole={activeRole}
      userRole={userRole}
      onRoleChange={handleRoleChange}
      isAuthenticated={isAuthenticated}
      userName={userName}
      onSignOut={handleSignOut}
      onShowToast={handleShowToast}
    >
      {!isAuthenticated || effectiveScreen === 'auth' ? (
        <AuthPortalScreen
          activeRole={activeRole}
          passwordOverrides={passwordOverrides}
          onPasswordReset={handlePasswordReset}
          onAuthenticated={handleAuthenticated}
          onNavigate={handleNavigate}
          onShowToast={handleShowToast}
        />
      ) : (
        <>
          {effectiveScreen === 'portal-dashboard' && (
            <PortalDashboardScreen
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
              activeRole={activeRole}
              userName={userName}
            />
          )}
          {effectiveScreen === 'operations-analytics' && (
            <OperationsAnalyticsScreen
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
            />
          )}
          {effectiveScreen === 'quotation-engine' && (
            <QuotationEngineScreen
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
            />
          )}
          {effectiveScreen === 'site-survey-engineering' && (
            <SiteSurveyScreen
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
            />
          )}
          {effectiveScreen === 'installation-dispatch' && (
            <InstallationDispatchScreen
              onNavigate={handleNavigate}
              onShowToast={handleShowToast}
            />
          )}
          {effectiveScreen === 'billing-payments' && (
            <BillingPaymentScreen
              key={selectedInvoiceId || 'default'}
              initialInvoiceId={selectedInvoiceId}
              onShowToast={handleShowToast}
            />
          )}
          {effectiveScreen === 'service-warranty' && (
            <ServiceWarrantyScreen onShowToast={handleShowToast} />
          )}
        </>
      )}

      {/* Floating Operational Toast */}
      {toastMessage && (
        <div
          id="app-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#141e1c] text-white border border-[#2d3830] rounded-xl px-4 py-3 shadow-lg flex items-start gap-3"
        >
          <CheckCircle2
            className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span className="text-xs font-medium leading-relaxed flex-1">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-white/70 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </AppShell>
  );
}
