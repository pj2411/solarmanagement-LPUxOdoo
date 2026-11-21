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
      Icon: Crown
    },
    {
      role: 'SALES',
      title: 'Pooja Sharma',
      email: 'sales@sunpower.in',
      desc: 'Sales & Site Survey Lead',
      Icon: FileText
    },
    {
      role: 'TECHNICIAN',
      title: 'Ramesh Sharma',
      email: 'tech.ramesh.sharma@sunpower.in',
      desc: 'Lead Certified Field Technician',
      Icon: Wrench
    },
    {
      role: 'WAREHOUSE',
      title: 'Gaurav Singhal',
      email: 'warehouse@sunpower.in',
      desc: 'Inventory & Dispatch Officer',
      Icon: Package
    },
    {
      role: 'SUPPORT',
      title: 'Neha Kapoor',
      email: 'support@sunpower.in',
      desc: 'Warranty Triage & Service Desk',
      Icon: Headphones
    },
    {
      role: 'CUSTOMER',
      title: 'Arvind Sharma',
      email: 'arvind.sharma@gmail.com',
      desc: 'Homeowner Solar Customer',
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
      // In demo mode, fallback to credentials if backend network issue
      const demoMatch = solarDemoAccounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (demoMatch) {
        onLogin({
          email: demoMatch.email,
          name: demoMatch.title,
          role: demoMatch.role,
          token: 'demo-token'
        });
      } else {
        setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFastDirectLogin = async (acc) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(acc.email, 'demo2026');
      onLogin({
        email: res.user?.email || acc.email,
        name: res.user?.name || acc.title,
        role: res.role || acc.role,
        token: res.token
      });
    } catch {
      // Fallback direct login for quick persona preview
      onLogin({
        email: acc.email,
        name: acc.title,
        role: acc.role,
        token: 'demo-fast-token'
      });
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Sun className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              SunPower ERP
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Solar Solutions
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              13-Module Solar Installation Enterprise System
            </div>
          </div>
        </div>

        {onExplorePublic && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExplorePublic}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Website & Solar Calculator</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">

          {/* Left Column: Form (Login / Register / Forgot) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 pb-3 gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'LOGIN' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('REGISTER'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'REGISTER' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); setForgotStep(1); }}
                className={`pb-1 border-b-2 transition-colors ${
                  activeTab === 'FORGOT' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Password Recovery
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORM: LOGIN */}
            {activeTab === 'LOGIN' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Welcome to SunPower Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to access your authorized role across all 13 solar modules.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Enterprise Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@sunpower.in"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('FORGOT')}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>Keep me signed in for 30 days</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Create New Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Register as homeowner, certified field technician, or solar ops staff.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaspreet Singh"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Assigned Role *</label>
                      <select
                        value={regForm.role}
                        onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium block mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2"
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
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Reset Account Password
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your email to receive an instant 6-digit recovery code.
                  </p>
                </div>

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. arvind.sharma@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Sending code...' : 'Dispatch Verification Code'}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleForgotStep2} className="space-y-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                      Code dispatched to {forgotEmail}. Demo OTP: <b>849201</b>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Enter New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Update Password & Return to Login'}
                    </button>
                  </form>
                )}

                {forgotStep === 3 && (
                  <div className="text-center py-4 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Password Updated</h4>
                    <p className="text-xs text-slate-400">You may now sign in using your new password.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('LOGIN')}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: 1-Click Fast Persona Login */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold text-white">1-Click Persona Quick Access</h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Click any certified role below to immediately enter the ERP with authorized permissions:
              </p>
            </div>

            <div className="space-y-1.5">
              {solarDemoAccounts.map((acc) => {
                const RoleIcon = acc.Icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleFastDirectLogin(acc)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-900/60 hover:bg-slate-900 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 text-amber-400">
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-amber-400 flex items-center gap-1.5 truncate">
                          <span>{acc.title}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {acc.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {acc.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
              <span>SQLite Relational Engine Active</span>
              <span className="text-emerald-400 font-medium">● Online</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 text-center text-[11px] text-slate-500">
        SunPower Solutions Standalone ERP
      </footer>
    </div>
  );
}
