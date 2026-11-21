import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';

export default function CustomerManagementView({ leads, onRefresh, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('LEADS'); // 'LEADS' or 'PORTAL'
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || 1);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.phone.includes(searchTerm) ||
                          l.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || l.pipeline_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleUpdateNotes = async (id, newNotes) => {
    try {
      await api.updateLead(id, { follow_up_notes: newNotes });
      onRefresh();
    } catch (err) {
      alert('Error updating note: ' + err.message);
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'NEW': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'FOLLOW_UP': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SURVEY_SCHEDULED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'SURVEY_APPROVED': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'QUOTED': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'WON': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INSTALLED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Customer Relationship & Portal Management
          </h2>
          <p className="text-xs text-slate-400">
            Track prospective leads through survey, quote, installation, and homeowner portal.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('LEADS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'LEADS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leads Pipeline Directory
          </button>
          <button
            onClick={() => setActiveTab('PORTAL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'PORTAL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Self-Service Portal View
          </button>
        </div>
      </div>

      {activeTab === 'LEADS' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Pipeline Stages</option>
                <option value="NEW">NEW</option>
                <option value="FOLLOW_UP">FOLLOW_UP</option>
                <option value="SURVEY_SCHEDULED">SURVEY_SCHEDULED</option>
                <option value="SURVEY_APPROVED">SURVEY_APPROVED</option>
                <option value="QUOTED">QUOTED</option>
                <option value="WON">WON</option>
                <option value="INSTALLED">INSTALLED</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Customer & Contact</th>
                    <th className="p-3">Target System</th>
                    <th className="p-3">Monthly Bill</th>
                    <th className="p-3">Pipeline Stage</th>
                    <th className="p-3">Follow-up Notes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{lead.customer_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                          <span className="text-slate-600">|</span>
                          <span className="flex items-center gap-1 truncate max-w-[140px]"><Mail className="w-3 h-3" /> {lead.email}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[220px]">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {lead.address}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-amber-400 font-mono">{lead.capacity_kw} kW {lead.system_type}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {lead.subsidy_requested ? 'Subsidy Requested' : 'Commercial / Non-Subsidy'}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-200">
                        ₹{lead.monthly_bill_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(lead.pipeline_stage)}`}>
                          {lead.pipeline_stage}
                        </span>
                      </td>
                      <td className="p-3 max-w-[200px]">
                        <input
                          type="text"
                          defaultValue={lead.follow_up_notes || ''}
                          onBlur={(e) => handleUpdateNotes(lead.id, e.target.value)}
                          placeholder="Click to add note..."
                          className="w-full bg-slate-950 px-2 py-1 rounded text-[11px] text-slate-300 border border-slate-800 focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => { setSelectedLeadId(lead.id); setActiveTab('PORTAL'); }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-medium border border-slate-700 inline-flex items-center gap-1"
                        >
                          Portal <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">
                        No customer leads found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Customer Portal View */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase text-amber-400">Viewing Homeowner Portal as:</span>
              <h3 className="text-base font-bold text-white">{selectedLead?.customer_name} ({selectedLead?.phone})</h3>
              <p className="text-xs text-slate-400">{selectedLead?.address}</p>
            </div>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(Number(e.target.value))}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.customer_name} ({l.pipeline_stage})</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Project Status Progression */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-white">Project Lifecycle Progress</h4>
              <div className="space-y-3">
                {[
                  { step: '1. Roof Site Survey', done: ['SURVEY_APPROVED', 'QUOTED', 'WON', 'INSTALLED'].includes(selectedLead?.pipeline_stage) },
                  { step: '2. Quotation Approved', done: ['QUOTED', 'WON', 'INSTALLED'].includes(selectedLead?.pipeline_stage) },
                  { step: '3. Order & Material Dispatch', done: ['WON', 'INSTALLED'].includes(selectedLead?.pipeline_stage) },
                  { step: '4. Physical Installation & Testing', done: selectedLead?.pipeline_stage === 'INSTALLED' },
                  { step: '5. PM Surya Ghar Subsidy Disbursal', done: selectedLead?.pipeline_stage === 'INSTALLED' },
                ].map((st, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      st.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {st.done ? '✓' : i + 1}
                    </div>
                    <span className={st.done ? 'text-white font-medium' : 'text-slate-500'}>{st.step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions for Homeowner */}
            <div className="md:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-white">Homeowner Self-Service Actions</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('quotations')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all space-y-1 group"
                >
                  <FileText className="w-5 h-5 text-amber-400" />
                  <div className="font-bold text-xs text-white group-hover:text-amber-400">Review Quotation & BOM</div>
                  <div className="text-[11px] text-slate-400">View component breakdowns and approve estimate</div>
                </button>
                <button
                  onClick={() => onNavigate('warranty')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition-all space-y-1 group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400">View Active Warranties</div>
                  <div className="text-[11px] text-slate-400">Check inverter (2-Yr) & panel (20-Yr) certificates</div>
                </button>
                <button
                  onClick={() => onNavigate('orders')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-left transition-all space-y-1 group"
                >
                  <ExternalLink className="w-5 h-5 text-sky-400" />
                  <div className="font-bold text-xs text-white group-hover:text-sky-400">Download Tax Invoice</div>
                  <div className="text-[11px] text-slate-400">Download official GST invoice and payment receipts</div>
                </button>
                <button
                  onClick={() => onNavigate('helpdesk')}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-left transition-all space-y-1 group"
                >
                  <Phone className="w-5 h-5 text-rose-400" />
                  <div className="font-bold text-xs text-white group-hover:text-rose-400">Raise Support Ticket</div>
                  <div className="text-[11px] text-slate-400">Report inverter error codes for instant free repair triage</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
