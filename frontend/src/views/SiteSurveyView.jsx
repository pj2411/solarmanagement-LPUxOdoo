import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  User, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Ruler
} from 'lucide-react';
import { api } from '../api';

export default function SiteSurveyView({ surveys, employees, onRefresh, onNavigate }) {
  const [approvingId, setApprovingId] = useState(null);

  const handleApprove = async (surveyId) => {
    setApprovingId(surveyId);
    try {
      await api.approveSurvey(surveyId);
      onRefresh();
    } catch (err) {
      alert('Error approving survey: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            Rooftop Site Survey Management
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory Gatekeeper: Quotations are strictly locked until a technician verifies and approves the site survey.
          </p>
        </div>
      </div>

      {/* Survey Gatekeeper Rule Alert Box */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300">FastAPI Gatekeeper Rule #1 Enforced:</div>
          <p className="text-slate-300">
            Backend will return <span className="font-mono text-amber-400 font-bold">HTTP 400 Bad Request</span> if a quotation is attempted for any lead without an approved survey. Click <span className="font-bold text-white">"Approve Survey"</span> below to unlock quotation generation.
          </p>
        </div>
      </div>

      {/* Survey Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => {
          const lead = survey.lead;
          const tech = survey.technician;
          const isApproved = survey.is_approved;

          return (
            <div 
              key={survey.id} 
              className={`rounded-xl bg-slate-900 border transition-all p-5 space-y-4 shadow-lg ${
                isApproved ? 'border-emerald-500/40' : 'border-amber-500/40 bg-slate-900/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Survey #{survey.id}</span>
                  <h3 className="font-bold text-base text-white">{lead?.customer_name || 'Customer'}</h3>
                  <p className="text-xs text-slate-400">{lead?.address}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${
                  isApproved 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                }`}>
                  {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {isApproved ? 'Survey Approved' : 'Pending Approval'}
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Roof Direction</span>
                  <p className="font-semibold text-white">{survey.roof_direction}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Tilt Angle</span>
                  <p className="font-semibold text-amber-400 font-mono">{survey.tilt_angle_deg}°</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Shadow-Free Area</span>
                  <p className="font-semibold text-white font-mono">{survey.shadow_free_area_sqft} sq.ft</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Cable Run</span>
                  <p className="font-semibold text-white font-mono">{survey.cable_distance_m} meters</p>
                </div>
              </div>

              {/* Technician Notes */}
              <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Technician Notes:</span>
                {survey.notes || 'No remarks recorded.'}
              </div>

              {/* Assigned Crew */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tech?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>{survey.scheduled_date || 'Today'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                {!isApproved ? (
                  <button
                    onClick={() => handleApprove(survey.id)}
                    disabled={approvingId === survey.id}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {approvingId === survey.id ? 'Approving...' : 'Approve Survey & Unlock Quoting'}
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('quotations')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    Proceed to Generate Quote <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
