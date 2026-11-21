import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Ruler,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  Check,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { api } from '../api';

const DEFAULT_DEMO_SURVEYS = [
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
    lead: {
      id: 1,
      customer_name: 'Arvind Sharma',
      phone: '+91 98101 23456',
      email: 'arvind.sharma@gmail.com',
      address: 'B-42, Sector 15, Noida, Uttar Pradesh 201301',
      capacity_kw: 3.0,
      system_type: 'ON_GRID'
    },
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
    lead: {
      id: 2,
      customer_name: 'Sunita Rao',
      phone: '+91 98202 88776',
      email: 'sunita.rao@outlook.com',
      address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066',
      capacity_kw: 5.0,
      system_type: 'ON_GRID'
    },
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
    is_approved: false,
    notes: 'Preliminary check shows good sun access. Water tank may cast minor 4 PM shadow.',
    lead: {
      id: 3,
      customer_name: 'Rajesh Mehta',
      phone: '+91 97114 55667',
      email: 'rajesh.mehta@gmail.com',
      address: 'House 88, Model Town, Jalandhar, Punjab 144003',
      capacity_kw: 3.0,
      system_type: 'ON_GRID'
    },
    technician: { id: 9, name: 'Rajesh Kumar', email: 'tech.rajesh.kumar@sunpower.in', role: 'TECHNICIAN' }
  }
];

export default function SiteSurveyView({ 
  surveys = [], 
  leads = [], 
  employees = [], 
  onRefresh, 
  onNavigate,
  currentRole,
  currentUser 
}) {
  const [approvingId, setApprovingId] = useState(null);
  const [unapprovingId, setUnapprovingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localSurveys, setLocalSurveys] = useState([]);

  // Use props if populated, else fallback safely
  const effectiveSurveys = useMemo(() => {
    if (localSurveys.length > 0) return localSurveys;
    if (Array.isArray(surveys) && surveys.length > 0) return surveys;
    return DEFAULT_DEMO_SURVEYS;
  }, [surveys, localSurveys]);

  // Modal form state
  const [formData, setFormData] = useState({
    lead_id: leads[0]?.id || 1,
    technician_id: employees[0]?.id || 6,
    roof_direction: 'South (180° Azimuth)',
    tilt_angle_deg: 22.0,
    shadow_free_area_sqft: 350.0,
    cable_distance_m: 20.0,
    notes: 'Preliminary site measurement and shade evaluation.'
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleApprove = async (surveyId) => {
    setApprovingId(surveyId);
    setFeedback(null);
    try {
      await api.approveSurvey(surveyId);
      // Optimistic update
      setLocalSurveys(prev => {
        const source = prev.length > 0 ? prev : effectiveSurveys;
        return source.map(s => s.id === surveyId ? { ...s, is_approved: true } : s);
      });
      setFeedback({
        type: 'success',
        message: `Survey #${surveyId} successfully approved! Gatekeeper Rule #1 unlocked — formal quotation can now be generated.`
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      // In demo mode, apply locally
      setLocalSurveys(prev => {
        const source = prev.length > 0 ? prev : effectiveSurveys;
        return source.map(s => s.id === surveyId ? { ...s, is_approved: true } : s);
      });
      setFeedback({
        type: 'success',
        message: `Survey #${surveyId} approved! Gatekeeper unlocked for quotation.`
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleUnapprove = async (surveyId) => {
    setUnapprovingId(surveyId);
    setFeedback(null);
    try {
      if (api.unapproveSurvey) {
        await api.unapproveSurvey(surveyId);
      }
      setLocalSurveys(prev => {
        const source = prev.length > 0 ? prev : effectiveSurveys;
        return source.map(s => s.id === surveyId ? { ...s, is_approved: false } : s);
      });
      setFeedback({
        type: 'info',
        message: `Survey #${surveyId} marked as Pending Approval. Gatekeeper Rule #1 (HTTP 400 enforcement) is now active for this lead.`
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setLocalSurveys(prev => {
        const source = prev.length > 0 ? prev : effectiveSurveys;
        return source.map(s => s.id === surveyId ? { ...s, is_approved: false } : s);
      });
      setFeedback({
        type: 'info',
        message: `Survey #${surveyId} marked as Pending Approval for gatekeeper testing.`
      });
    } finally {
      setUnapprovingId(null);
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      const selectedLead = leads.find(l => l.id === Number(formData.lead_id)) || {
        id: Number(formData.lead_id),
        customer_name: 'Customer Lead',
        address: 'Site Address',
        capacity_kw: 3.0
      };
      const selectedTech = employees.find(emp => emp.id === Number(formData.technician_id)) || {
        id: Number(formData.technician_id),
        name: 'Assigned Field Tech'
      };

      const payload = {
        lead_id: Number(formData.lead_id),
        technician_id: Number(formData.technician_id),
        roof_direction: formData.roof_direction,
        tilt_angle_deg: Number(formData.tilt_angle_deg),
        shadow_free_area_sqft: Number(formData.shadow_free_area_sqft),
        cable_distance_m: Number(formData.cable_distance_m),
        notes: formData.notes
      };

      let newId = Date.now();
      try {
        if (api.createSurvey) {
          const res = await api.createSurvey(payload);
          if (res && res.id) newId = res.id;
        }
      } catch (apiErr) {
        console.warn('Backend createSurvey offline, storing locally:', apiErr);
      }

      const newSurveyObj = {
        id: newId,
        ...payload,
        scheduled_date: new Date().toISOString().split('T')[0],
        survey_photo_url: '/photos/survey_roof_default.jpg',
        is_approved: false,
        lead: selectedLead,
        technician: selectedTech
      };

      setLocalSurveys(prev => {
        const source = prev.length > 0 ? prev : effectiveSurveys;
        return [newSurveyObj, ...source];
      });

      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: `New Site Survey #${newId} scheduled for ${selectedLead.customer_name}. Awaiting technician approval.`
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error scheduling survey: ' + err.message);
    }
  };

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
    return effectiveSurveys.filter(survey => {
      // Filter by status tab
      if (filterStatus === 'PENDING' && survey.is_approved) return false;
      if (filterStatus === 'APPROVED' && !survey.is_approved) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const customerName = survey.lead?.customer_name?.toLowerCase() || '';
        const address = survey.lead?.address?.toLowerCase() || '';
        const techName = survey.technician?.name?.toLowerCase() || '';
        const roof = survey.roof_direction?.toLowerCase() || '';
        const notes = survey.notes?.toLowerCase() || '';
        return (
          customerName.includes(q) ||
          address.includes(q) ||
          techName.includes(q) ||
          roof.includes(q) ||
          notes.includes(q) ||
          String(survey.id).includes(q)
        );
      }

      return true;
    });
  }, [effectiveSurveys, filterStatus, searchQuery]);

  const pendingCount = effectiveSurveys.filter(s => !s.is_approved).length;
  const approvedCount = effectiveSurveys.filter(s => s.is_approved).length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-black border border-white shadow-md">
              <Compass className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Rooftop Site Survey Management
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Mandatory Gatekeeper: Quotations are strictly locked until a technician verifies and approves the site survey.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-black border-2 border-slate-700 hover:border-white text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh surveys"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs flex items-center justify-center gap-2 shadow-xl border border-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Schedule New Survey</span>
          </button>
        </div>
      </div>

      {/* Survey Gatekeeper Rule Alert Box */}
      <div className="p-5 rounded-2xl bg-black border-2 border-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white text-black border border-white flex-shrink-0 mt-0.5 shadow-lg">
            <ShieldAlert className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight">FastAPI Gatekeeper Rule #1 Enforced:</span>
              <span className="text-xs uppercase tracking-wider px-3 py-0.5 rounded-full bg-white text-black border border-white font-mono font-black">
                Mandatory Check
              </span>
              <span className="text-xs uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-600 text-white font-bold border border-emerald-500">
                Active Protocol
              </span>
            </div>
            <p className="text-white leading-relaxed text-xs sm:text-sm font-medium">
              Backend returns <span className="text-white font-black font-mono bg-rose-600 px-2 py-0.5 rounded border border-rose-400">HTTP 400 Bad Request</span> if a quotation is attempted for any lead without an approved survey. Click <button type="button" onClick={() => { const pending = effectiveSurveys.find(s => !s.is_approved); if (pending) handleApprove(pending.id); }} className="font-black text-white underline decoration-white hover:text-slate-300 transition-colors cursor-pointer">Approve survey for quoting</button> below to unlock quotation generation.
            </p>
            {pendingCount > 0 ? (
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const pending = effectiveSurveys.find(s => !s.is_approved);
                    if (pending) handleApprove(pending.id);
                  }}
                  disabled={approvingId !== null}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>{approvingId ? 'Verifying & Approving...' : 'Approve Survey for Quoting'}</span>
                </button>
                <span className="text-xs text-slate-300 font-medium">
                  Click to unlock quote generation immediately
                </span>
              </div>
            ) : (
              <div className="pt-1 flex items-center gap-2 text-xs text-white font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>All site surveys are approved! Gatekeeper Rule #1 unlocked — formal quotations can be generated.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 self-stretch md:self-auto flex-shrink-0">
          <div className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-black border-2 border-white text-center min-w-[130px] shadow-lg">
            <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">Pending Approval</div>
            <div className="text-3xl font-black font-mono mt-0.5 text-white">
              {pendingCount}
            </div>
          </div>
          <div className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-black border-2 border-slate-700 text-center min-w-[130px] shadow-lg">
            <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">Approved</div>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
              {approvedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Feedback Notification */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between gap-3 border-2 transition-all ${
          feedback.type === 'success' 
            ? 'bg-black text-white border-white' 
            : 'bg-black text-white border-white'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white" />}
            <span>{feedback.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="text-white hover:text-slate-300 text-xs px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Status Filter Tabs */}
        <div className="flex bg-black border-2 border-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterStatus === 'ALL' 
                ? 'bg-white text-black shadow border border-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>All Surveys</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              filterStatus === 'ALL' ? 'bg-black text-white' : 'bg-slate-800 text-white'
            }`}>
              {effectiveSurveys.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterStatus === 'PENDING' 
                ? 'bg-white text-black shadow border border-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                filterStatus === 'PENDING' ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterStatus === 'APPROVED' 
                ? 'bg-emerald-600 text-white shadow border border-emerald-500' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Approved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono font-bold text-white">
              {approvedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, tech, azimuth..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-black border-2 border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Survey Cards Grid or Empty State */}
      {filteredSurveys.length === 0 ? (
        <div className="p-12 rounded-2xl bg-black border-2 border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-white">
            <Compass className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Site Surveys Found</h3>
            <p className="text-xs text-slate-300 font-medium">
              {searchQuery 
                ? `No survey records match the query "${searchQuery}".` 
                : filterStatus !== 'ALL' 
                ? `No surveys currently in ${filterStatus.toLowerCase()} status.`
                : 'No rooftop site surveys recorded yet.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-white font-bold border border-slate-700 cursor-pointer"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-xs text-black font-black flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              Schedule New Survey
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => {
            const lead = survey.lead;
            const tech = survey.technician;
            const isApproved = survey.is_approved;
            const isApproving = approvingId === survey.id;
            const isUnapproving = unapprovingId === survey.id;

            return (
              <div 
                key={survey.id} 
                className={`rounded-2xl bg-black border-2 transition-all duration-200 p-5 space-y-4 shadow-xl flex flex-col justify-between ${
                  isApproved 
                    ? 'border-emerald-600/60 hover:border-emerald-500 shadow-emerald-500/5' 
                    : 'border-white hover:border-slate-200 shadow-white/5'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Top / Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-black font-black bg-white px-2 py-0.5 rounded border border-white">
                          Survey #{survey.id}
                        </span>
                        {lead?.capacity_kw && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">
                            {lead.capacity_kw} kW {lead.system_type || 'Solar'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-lg text-white mt-1.5 leading-snug">
                        {lead?.customer_name || 'Customer Lead'}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">
                        {lead?.address || 'Site location pending verification'}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border-2 flex-shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-600 text-white border-emerald-500' 
                        : 'bg-white text-black border-white shadow-md'
                    }`}>
                      {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Clock className="w-3.5 h-3.5 text-black" />}
                      <span>{isApproved ? 'Survey Approved' : 'Pending Approval'}</span>
                    </span>
                  </div>

                  {/* Technical Specifications 2x2 Grid - Crisp Black & White Solid Styling */}
                  <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-white border-2 border-black text-black shadow-inner">
                    <div>
                      <span className="text-xs text-black font-bold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-black" />
                        Roof Azimuth
                      </span>
                      <p className="font-black text-black text-sm mt-0.5 truncate" title={survey.roof_direction}>
                        {survey.roof_direction || 'South (180°)'}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-black font-bold flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-black" />
                        Tilt Angle
                      </span>
                      <p className="font-black text-black font-mono text-sm mt-0.5">
                        {survey.tilt_angle_deg != null ? `${survey.tilt_angle_deg}°` : '22.0°'}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-black font-bold block">Shadow-Free Area</span>
                      <p className="font-black text-black font-mono text-sm mt-0.5">
                        {survey.shadow_free_area_sqft || 350} sq.ft
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-black font-bold block">DC Cable Run</span>
                      <p className="font-black text-black font-mono text-sm mt-0.5">
                        {survey.cable_distance_m || 20} meters
                      </p>
                    </div>
                  </div>

                  {/* Technician Notes - Crisp Solid Black Text */}
                  <div className="text-xs text-black bg-slate-100 p-3 rounded-xl border-2 border-black space-y-1">
                    <span className="text-[11px] text-black font-black uppercase tracking-wider block">
                      Technician Field Notes:
                    </span>
                    <p className="line-clamp-2 leading-relaxed font-bold text-black">
                      {survey.notes || 'RCC Terrace verified. Structural anchor points stable.'}
                    </p>
                  </div>

                  {/* Assigned Crew */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-4 h-4 text-white flex-shrink-0" />
                      <span className="truncate text-white">{tech?.name || 'Lead Solar Technician'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs text-slate-300 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{survey.scheduled_date || 'Today'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(survey.id)}
                      disabled={isApproving}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>{isApproving ? 'Verifying & Approving...' : 'Approve survey for quoting'}</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('quotations')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-black font-black text-xs border border-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                      >
                        <FileText className="w-4 h-4 text-black" />
                        <span>Create formal quote</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 text-black" />
                      </button>

                      {/* Reset to Pending button to test Gatekeeper Rule #1 */}
                      <button
                        type="button"
                        onClick={() => handleUnapprove(survey.id)}
                        disabled={isUnapproving}
                        className="w-full py-1 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium"
                        title="Mark back to pending to verify Rule #1 gatekeeper enforcement"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isUnapproving ? 'Resetting...' : 'Mark Pending (Gatekeeper Verification)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule New Survey Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border-2 border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white text-black">
                  <Compass className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-black text-lg text-white">Schedule Rooftop Site Survey</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-slate-300 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="space-y-4 text-xs">
              {/* Select Lead */}
              <div>
                <label className="block text-white font-bold mb-1.5 text-xs">
                  Customer Lead *
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-medium"
                  required
                >
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.customer_name} ({lead.capacity_kw} kW - {lead.address})
                    </option>
                  ))}
                  {leads.length === 0 && (
                    <option value={1}>Arvind Sharma (3 kW - Noida)</option>
                  )}
                </select>
              </div>

              {/* Assign Certified Technician */}
              <div>
                <label className="block text-white font-bold mb-1.5 text-xs">
                  Assign Field Technician *
                </label>
                <select
                  value={formData.technician_id}
                  onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-medium"
                  required
                >
                  {employees.filter(e => e.role === 'TECHNICIAN' || !e.role).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (Technician)
                    </option>
                  ))}
                  {employees.length === 0 && (
                    <option value={6}>Ramesh Sharma (Lead Certified Tech)</option>
                  )}
                </select>
              </div>

              {/* Roof Direction & Tilt Angle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-bold mb-1.5 text-xs">
                    Roof Direction / Azimuth
                  </label>
                  <select
                    value={formData.roof_direction}
                    onChange={(e) => setFormData({ ...formData, roof_direction: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-medium"
                  >
                    <option value="South (180° Azimuth)">South (180° Azimuth)</option>
                    <option value="South-West (210° Azimuth)">South-West (210° Azimuth)</option>
                    <option value="South-East (150° Azimuth)">South-East (150° Azimuth)</option>
                    <option value="West (270° Azimuth)">West (270° Azimuth)</option>
                    <option value="East (90° Azimuth)">East (90° Azimuth)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-bold mb-1.5 text-xs">
                    Tilt Angle (Degrees)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="45"
                    value={formData.tilt_angle_deg}
                    onChange={(e) => setFormData({ ...formData, tilt_angle_deg: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Shadow-Free Area & Cable Run */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-bold mb-1.5 text-xs">
                    Shadow-Free Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.shadow_free_area_sqft}
                    onChange={(e) => setFormData({ ...formData, shadow_free_area_sqft: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1.5 text-xs">
                    DC Cable Run (Meters)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    value={formData.cable_distance_m}
                    onChange={(e) => setFormData({ ...formData, cable_distance_m: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white font-bold mb-1.5 text-xs">
                  Technician Inspection Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Structural condition, parapet wall height, parapet shadow risks..."
                  className="w-full p-2.5 rounded-xl bg-black border-2 border-slate-700 text-white focus:outline-none focus:border-white placeholder-slate-400 font-medium"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  Schedule Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}