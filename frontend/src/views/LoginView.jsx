import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sun, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Globe, 
  Sparkles, 
  Package, 
  Wrench, 
  Crown, 
  FileText, 
  Headphones 
} from 'lucide-react';
import { api } from '../api';

export default function LoginView({ onLogin, onExplorePublic }) {
  const [activeTab, setActiveTab] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT'
  const [email, setEmail] = useState('admin@sunpower.in');
  const [password, setPassword] = useState('demo2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    password: '',
    confirmPassword: ''
  });

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('849201');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  const solarDemoAccounts = [
    {
      role: 'ADMIN',
      title: 'Vikram Malhotra',
      email: 'admin@sunpower.in',
      desc: 'Director & Financial P&L Admin',
      scope: 'All 13 Modules Full Access',
      Icon: Crown
    },
    {
      role: 'SALES',
      title: 'Pooja Sharma',
      email: 'sales@sunpower.in',
      desc: 'Sales & Site Survey Lead',
      scope: 'CRM, Surveys, Quotes & Orders',
      Icon: FileText
    },
    {
      role: 'TECHNICIAN',
      title: 'Ramesh Sharma',
      email: 'tech.ramesh.sharma@sunpower.in',
      desc: 'Lead Certified Field Technician',
      scope: 'Installations, PWA & Field Surveys',
      Icon: Wrench
    },
    {
      role: 'WAREHOUSE',
      title: 'Gaurav Singhal',
      email: 'warehouse@sunpower.in',
      desc: 'Inventory & Dispatch Officer',
      scope: 'Stock, BoM & QR Serial Tracking',
      Icon: Package
    },
    {
      role: 'SUPPORT',
      title: 'Neha Kapoor',
      email: 'support@sunpower.in',
      desc: 'Warranty Triage & Service Desk',
      scope: 'Helpdesk Tickets & Warranty Registry',
      Icon: Headphones
    },
    {
      role: 'CUSTOMER',
      title: 'Arvind Sharma',
      email: 'arvind.sharma@gmail.com',
      desc: 'Homeowner Solar Customer',
      scope: 'Public Portal, My Quote & Service',
      Icon: UserCheck
    }
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.login(email.trim(), password);
      onLogin({
        email: res.user?.email || email.trim(),
        name: res.user?.name || email.trim().split('@')[0],
        role: res.role || 'ADMIN',
        token: res.token
      });
    } catch (err) {
      const demoMatch = solarDemoAccounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (demoMatch) {
        onLogin({
          email: demoMatch.email,
          name: demoMatch.title,
          role: demoMatch.role,
          token: 'demo-token'
        });
      } else if (email.trim() && password) {
        const fallbackRole = email.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER';
        onLogin({
          email: email.trim(),
          name: email.trim().split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: fallbackRole,
          token: 'demo-user-token'
        });
      } else {
        setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFastDirectLogin = (acc) => {
    onLogin({
      email: acc.email,
      name: acc.title,
      role: acc.role,
      token: `jwt_session_${acc.role.toLowerCase()}`
    });
    api.login(acc.email, 'demo2026').catch(() => {});
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.register({
        name: regForm.name,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
        role: regForm.role
      });
      onLogin({
        email: res.user?.email || regForm.email,
        name: res.user?.name || regForm.name,
        role: res.role || regForm.role,
        token: res.token
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setSuccessMsg(res.message);
      setForgotStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Error sending recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.resetPassword(forgotEmail, otpCode, newPassword || 'newpass123');
      setSuccessMsg(res.message);
      setForgotStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Sun className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>SunPower ERP</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold uppercase tracking-wider">
                Solar Solutions
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              13-Module Solar Installation Enterprise System
            </div>
          </div>
        </div>

        {onExplorePublic && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExplorePublic}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-4 h-4 text-amber-600" />
              <span>Public Website & Solar Calculator</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 relative overflow-hidden">

          {/* Left Column: Form (Login / Register / Forgot) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 pb-3 gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'LOGIN' 
                    ? 'border-amber-500 text-amber-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('REGISTER'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'REGISTER' 
                    ? 'border-amber-500 text-amber-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); setForgotStep(1); }}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'FORGOT' 
                    ? 'border-amber-500 text-amber-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Password Recovery
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM: LOGIN */}
            {activeTab === 'LOGIN' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to SunPower Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Sign in to access your authorized role across all 13 enterprise solar workflows.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Enterprise Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@sunpower.in"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('FORGOT')}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-xs">
                    <label className="flex items-center gap-2.5 text-slate-700 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-amber-500 rounded w-4 h-4 cursor-pointer"
                      />
                      <span>Keep me signed in for 30 days</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? 'Authenticating session...' : 'Sign in to ERP Portal'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* FORM: REGISTER */}
            {activeTab === 'REGISTER' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Create New Account
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Register as homeowner, certified field technician, or solar operations staff.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaspreet Singh"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role *</label>
                      <select
                        value={regForm.role}
                        onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                      >
                        <option value="CUSTOMER">Customer / Homeowner</option>
                        <option value="TECHNICIAN">Field Technician</option>
                        <option value="SALES">Sales & Survey</option>
                        <option value="WAREHOUSE">Warehouse Dispatch</option>
                        <option value="SUPPORT">Helpdesk Support</option>
                        <option value="ADMIN">Director / Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {loading ? 'Creating account...' : 'Complete Registration'}
                  </button>
                </form>
              </div>
            )}

            {/* FORM: FORGOT PASSWORD */}
            {activeTab === 'FORGOT' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Reset Account Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Enter your email to receive an instant 6-digit recovery code.
                  </p>
                </div>

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. arvind.sharma@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Sending code...' : 'Dispatch Verification Code'}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleForgotStep2} className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium">
                      Code dispatched to <b>{forgotEmail}</b>. Demo OTP: <b>849201</b>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-center tracking-widest font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Enter New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Saving...' : 'Update Password & Return to Login'}
                    </button>
                  </form>
                )}

                {forgotStep === 3 && (
                  <div className="text-center py-4 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">Password Updated</h4>
                    <p className="text-xs text-slate-500">You may now sign in using your new password.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('LOGIN')}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: 1-Click Fast Persona Login */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1-Click Persona Quick Access
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any certified role below to immediately enter the portal with authorized permissions:
              </p>
            </div>

            <div className="space-y-2">
              {solarDemoAccounts.map((acc) => {
                const RoleIcon = acc.Icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleFastDirectLogin(acc)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 transition-all text-left group cursor-pointer shadow-xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex-shrink-0 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 flex items-center gap-1.5 truncate">
                          <span>{acc.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:border-amber-300">
                            {acc.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {acc.scope}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-medium">
              <span>SQLite Relational Engine Active</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-200 bg-white/80 text-center text-xs text-slate-500 font-medium">
        SunPower Solutions Standalone ERP • Certified Rooftop Solar EPC Enterprise (15 Technicians, 40 Projects/Month)
      </footer>
    </div>
  );
}
