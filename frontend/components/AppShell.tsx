'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Menu, X, User, LogIn, LogOut, Search } from 'lucide-react';
import type { ScreenId, UserRole } from '@/lib/solar-data';
import type { CommandSearchItem } from '@/lib/solar-logic';
import { ScrollGlobeBackdrop } from '@/components/ui/landing-page';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';

interface AppShellProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId, options?: { invoiceId?: string }) => void;
  activeRole: UserRole;
  userRole?: UserRole;
  onRoleChange: (role: UserRole) => void;
  isAuthenticated: boolean;
  userName: string;
  onSignOut: () => void;
  onShowToast?: (message: string) => void;
  children: React.ReactNode;
}

export function getRoleNavItems(role: UserRole): { id: ScreenId; label: string }[] {
  switch (role) {
    case 'Customer':
      return [
        { id: 'portal-dashboard', label: 'My Solar' },
        { id: 'quotation-engine', label: 'My Proposal' },
        { id: 'billing-payments', label: 'Invoices & Pay' },
        { id: 'service-warranty', label: 'Warranty & Help' },
      ];
    case 'Engineer':
    case 'Technician':
      return [
        { id: 'site-survey-engineering', label: 'Site Feasibility' },
        { id: 'installation-dispatch', label: 'Installations' },
        { id: 'service-warranty', label: 'Service Tickets' },
      ];
    case 'Installer':
      return [
        { id: 'installation-dispatch', label: 'Dispatch & Install' },
        { id: 'service-warranty', label: 'Maintenance' },
      ];
    case 'Admin':
    default:
      return [
        { id: 'operations-analytics', label: 'Analytics & Ops' },
        { id: 'portal-dashboard', label: 'Fleet Overview' },
        { id: 'quotation-engine', label: 'Quotations' },
        { id: 'site-survey-engineering', label: 'Site Survey' },
        { id: 'installation-dispatch', label: 'Dispatch' },
        { id: 'billing-payments', label: 'Billing & Pay' },
        { id: 'service-warranty', label: 'Service & SLA' },
      ];
  }
}

const HEADER_ROLES: UserRole[] = ['Customer', 'Technician', 'Admin'];

export function AppShell({
  activeScreen,
  onNavigate,
  activeRole,
  userRole,
  onRoleChange,
  isAuthenticated,
  userName,
  onSignOut,
  onShowToast,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const roleNavItems = getRoleNavItems(activeRole);
  const isUserAdmin = (userRole ?? activeRole) === 'Admin';

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAuthenticated]);

  const handleNavClick = (screen: ScreenId) => {
    setDrawerOpen(false);
    onNavigate(screen);
  };

  const handleSignOutClick = () => {
    setCommandOpen(false);
    setDrawerOpen(false);
    onSignOut();
  };

  const handleSelectCommandItem = (item: CommandSearchItem) => {
    setCommandOpen(false);
    setDrawerOpen(false);
    if (item.category === 'Billing & Invoice') {
      onNavigate(item.screen, { invoiceId: item.id });
    } else {
      onNavigate(item.screen);
    }
    onShowToast?.(`Opened ${item.category} ${item.id}: ${item.title}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-[#1a1c1a]">
      {/* Fixed Scroll-Reactive Rotating Globe Background */}
      <ScrollGlobeBackdrop />

      {/* Fixed 3-Zone Top Bar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e3e2df]">
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() =>
              handleNavClick(isAuthenticated ? 'portal-dashboard' : 'auth')
            }
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002e03] rounded-lg"
          >
            <span className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-[#002e03] text-white flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 xl:w-5 xl:h-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg xl:text-2xl tracking-wide uppercase text-[#001601] leading-none whitespace-nowrap">
              SunPower Solutions
            </span>
          </button>

          {/* Zone 2: Authenticated Screen Navigation Links */}
          {isAuthenticated ? (
            <nav
              aria-label="Primary Workspace Navigation"
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0"
            >
              {roleNavItems.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-2 xl:px-2.5 py-1.5 text-[11px] xl:text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#002e03] text-white font-semibold'
                        : 'text-[#42493f] hover:text-[#1a1c1a] hover:bg-[#e9e8e5]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden sm:flex items-center text-xs font-medium text-[#42493f]">
              <span>Protected Solar Operations Portal · Sign In Required</span>
            </div>
          )}

          {/* Zone 3: Role Switcher (Admin Only) + Account / Sign-Out + Search */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthenticated ? (
              <>
                {isUserAdmin && (
                  <div
                    className="hidden min-[1400px]:flex items-center bg-[#ffffff] border border-[#c2c9bc]/60 rounded-xl p-0.5 gap-0.5"
                    role="group"
                    aria-label="Workspace Role View"
                  >
                    {HEADER_ROLES.map((role) => {
                      const selected =
                        (activeRole as string) === role ||
                        (role === 'Technician' &&
                          ((activeRole as string) === 'Engineer' ||
                            (activeRole as string) === 'Installer'));
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => onRoleChange(role)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                            selected
                              ? 'bg-[#001601] text-white font-semibold'
                              : 'text-[#1a1c1a] hover:bg-[#e9e8e5]'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleNavClick('auth')}
                  className={`flex items-center gap-1.5 pl-2 pr-2 py-1 rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                    activeScreen === 'auth'
                      ? 'bg-[#002e03] text-white border-[#002e03]'
                      : 'bg-[#ffffff] text-[#1a1c1a] border-[#c2c9bc]/70 hover:border-[#0e7a66]'
                  }`}
                  aria-label={`Account portal for ${userName}`}
                >
                  <span className="hidden 2xl:flex flex-col text-right leading-tight">
                    <span className="text-[11px] font-semibold">
                      {userName}
                    </span>
                    <span className="text-[9px] opacity-80 uppercase font-medium">
                      {activeRole}
                    </span>
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      activeScreen === 'auth'
                        ? 'bg-white text-[#002e03]'
                        : 'bg-[#001601] text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </button>

                <button
                  type="button"
                  id="header-search-trigger"
                  onClick={() => setCommandOpen(true)}
                  aria-label="Search projects, quotations, users, and site surveys (Command+K)"
                  title="Search backend database, orders & invoices (⌘K)"
                  className="h-9 px-3 rounded-xl bg-[#ffffff] border border-[#c2c9bc]/70 hover:border-[#0e7a66] hover:bg-[#f4f3f0] text-[#001601] flex items-center gap-2 shrink-0 transition-all shadow-xs"
                >
                  <Search className="w-4 h-4 text-[#0e7a66] shrink-0" aria-hidden="true" />
                  <span className="hidden md:inline text-xs text-[#555f52] font-medium">
                    Search backend & orders...
                  </span>
                  <span className="hidden xl:inline-flex items-center text-[10px] text-[#0e7a66] font-mono-tabular bg-[#0e7a66]/10 px-1.5 py-0.5 rounded font-semibold">
                    1000+ records
                  </span>
                  <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-[#efeeeb] border border-[#c2c9bc] text-[#42493f] ml-0.5">
                    Ctrl K
                  </kbd>
                </button>

                <button
                  type="button"
                  id="header-signout-btn"
                  onClick={handleSignOutClick}
                  aria-label="Sign out of SunPower Portal"
                  title="Sign Out"
                  className="h-9 px-2.5 rounded-xl bg-[#ffffff] border border-[#c2c9bc]/70 hover:border-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[#001601] flex items-center gap-1.5 text-[11px] font-semibold shrink-0 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#a43c27]" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open Navigation Menu"
                  className="lg:hidden h-9 w-9 rounded-xl bg-[#ffffff] border border-[#c2c9bc] text-[#1a1c1a] flex items-center justify-center hover:bg-[#efeeeb]"
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('auth')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#001601] text-white text-xs font-semibold tracking-wider uppercase whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && (
        <CommandPaletteModal
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          onSelectItem={handleSelectCommandItem}
          activeRole={activeRole}
        />
      )}

      {/* Mobile Slide-Out Navigation Drawer (Authenticated Only) */}
      {isAuthenticated && drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#001601]/50 lg:hidden flex justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="w-[86vw] max-w-sm h-full bg-[#faf9f6] border-l border-[#c2c9bc] p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation Drawer"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e3e2df]">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#002e03] text-white flex items-center justify-center">
                    <Sun className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-display text-xl uppercase tracking-wide text-[#001601]">
                    SunPower Solutions
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close Navigation Menu"
                  className="w-9 h-9 rounded-lg bg-[#efeeeb] flex items-center justify-center text-[#1a1c1a]"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#42493f] px-2 mb-2">
                  My Role Modules ({activeRole})
                </p>
                {roleNavItems.map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#002e03] text-white'
                          : 'bg-[#ffffff] text-[#1a1c1a] border border-[#e3e2df] hover:bg-[#efeeeb]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold bg-[#ffdad6]/50 text-[#93000a] border border-[#ba1a1a]/30"
                >
                  Sign Out ({userName})
                </button>
              </div>
            </div>

            {isUserAdmin && (
              <div className="pt-5 border-t border-[#e3e2df] space-y-3">
                <div className="text-xs font-semibold text-[#42493f]">
                  Active Role View (Admin Only)
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {HEADER_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => onRoleChange(role)}
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        activeRole === role
                          ? 'bg-[#001601] text-white border-[#001601]'
                          : 'bg-[#ffffff] text-[#1a1c1a] border-[#c2c9bc]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full pt-20">{children}</main>

      {/* Clean Solid Footer (Authenticated Only) */}
      {isAuthenticated && activeScreen !== 'auth' && (
        <footer className="relative z-10 w-full bg-[#f4f3f0]/90 pt-12 pb-8 mt-12 border-t border-[#c2c9bc]/60">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#002e03] text-white flex items-center justify-center">
                    <Sun className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-display text-xl uppercase tracking-wider text-[#001601]">
                    SunPower Solutions Pvt Ltd
                  </span>
                </div>
                <p className="text-xs text-[#42493f] leading-relaxed max-w-sm">
                  High-yield residential, commercial, and industrial rooftop solar turnkey infrastructure across India with automated telemetry and tier-1 photovoltaic hardware.
                </p>
                <div className="text-[11px] font-medium text-[#42493f] flex flex-wrap items-center gap-2">
                  <span>MNRE Channel Partner (Class-A)</span>
                  <span aria-hidden="true">·</span>
                  <span>ISO 9001:2015</span>
                  <span aria-hidden="true">·</span>
                  <span>ALMM Certified</span>
                </div>
              </div>

              {/* Operations / Role Quick Links */}
              {activeRole === 'Customer' ? (
                <>
                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      My Solar Hub
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('portal-dashboard')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Rooftop Solar Plant &amp; Generation
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('quotation-engine')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          System Proposal &amp; Specs
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('billing-payments')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Invoices &amp; Online Payment
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Customer Care
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          25-Yr Linear Panel Warranty
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Raise Support Ticket
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Annual Maintenance (AMC)
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : activeRole === 'Engineer' || activeRole === 'Technician' ? (
                <>
                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Field Engineering
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('site-survey-engineering')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Site Feasibility &amp; Shading
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('site-survey-engineering')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          CAD &amp; Single Line Diagram
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('installation-dispatch')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Work Orders &amp; Staging
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Service &amp; Diagnostic
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Diagnostic Tickets &amp; SLA
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Inverter Fault Telemetry
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          25-Yr Performance Guarantee
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : activeRole === 'Installer' ? (
                <>
                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Dispatch &amp; Install
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('installation-dispatch')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Hardware Dispatch &amp; QR Staging
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('installation-dispatch')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Installation Milestones &amp; BoM
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Field Maintenance Checklist
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Hardware &amp; Safety
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('installation-dispatch')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          BOS Serial Unit Custody
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Replacement Dispatches
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Panel Testing Standards
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Operations Core
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('operations-analytics')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Spatial Command &amp; 280 Users
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('quotation-engine')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          BOS Estimation Engine
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('billing-payments')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          UPI / Card / Cash Billing
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                      Warranty &amp; Support
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#42493f]">
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-warranty')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          25-Yr Linear Panel Yield
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('site-survey-engineering')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          LiDAR Shadow Analysis
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavClick('installation-dispatch')}
                          className="hover:text-[#001601] transition-colors"
                        >
                          Dispatch &amp; QR Custody
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              <div>
                <h4 className="font-display text-base tracking-wider uppercase text-[#1a1c1a] mb-2">
                  Statutory &amp; Compliance
                </h4>
                <ul className="space-y-1.5 text-xs text-[#42493f]">
                  <li>National Solar Rooftop Portal</li>
                  <li>CEA Technical Standards</li>
                  <li>CIN: U40106DL2020PTC</li>
                </ul>
              </div>
            </div>

            <div className="pt-5 border-t border-[#c2c9bc]/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#42493f] gap-3">
              <span>
                © 2025 SunPower Solutions Private Limited. Empanelled under Ministry of New and Renewable Energy (MNRE).
              </span>
              <span className="font-medium">Support Line: 1800-SUN-POWR</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
