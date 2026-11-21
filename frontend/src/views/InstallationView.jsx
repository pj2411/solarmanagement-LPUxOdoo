import React, { useState, useRef } from 'react';
import { 
  HardHat, 
  CheckCircle2, 
  Clock, 
  Zap, 
  PenTool, 
  Camera, 
  User, 
  Calendar,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { api } from '../api';

export default function InstallationView({ installations, employees, onRefresh }) {
  const [activeInstallId, setActiveInstallId] = useState(installations[0]?.id || 1);
  const [progress, setProgress] = useState(50);
  const [hoursLogged, setHoursLogged] = useState(8.0);
  const [systemTested, setSystemTested] = useState(true);
  const [notes, setNotes] = useState('Earthing checked. Grid tie synchronized successfully.');
  const [completing, setCompleting] = useState(false);
  const sigPad = useRef(null);

  const selectedInstall = installations.find(i => i.id === activeInstallId) || installations[0];

  const handleClearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  const handleCompleteJob = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Please have the homeowner sign rooftop acceptance on the canvas pad before completing!');
      return;
    }
    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    setCompleting(true);
    try {
      await api.completeInstallation(activeInstallId, signatureBase64, notes);
      alert('Installation successfully completed with homeowner digital signature!');
      onRefresh();
    } catch (err) {
      alert('Error completing installation: ' + err.message);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardHat className="w-5 h-5 text-amber-400" />
          Field Installation & Homeowner Sign-off
        </h2>
        <p className="text-xs text-slate-400">
          Field technician execution dashboard with power generation testing, labor hours logging, and HTML5 canvas digital signature acceptance.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Active Jobs Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-sm text-white">Scheduled Field Jobs</h3>
          <div className="space-y-2">
            {installations.map((inst) => {
              const lead = inst.order?.lead;
              const isSelected = inst.id === activeInstallId;
              const isDone = inst.is_completed;

              return (
                <div
                  key={inst.id}
                  onClick={() => setActiveInstallId(inst.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">JOB #INS-{inst.id}</span>
                      <h4 className="font-bold text-sm text-white">{lead?.customer_name || 'Customer'}</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{lead?.address}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                    }`}>
                      {isDone ? 'Completed' : `${inst.progress_pct}% Progress`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-400" /> {inst.technician?.name || 'Technician'}
                    </span>
                    <span className="font-mono text-slate-300">
                      {inst.hours_logged} hrs logged
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Job Workbench */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                Installation Job #{selectedInstall?.id}
              </span>
              <h3 className="text-lg font-bold text-white">
                {selectedInstall?.order?.lead?.customer_name} ({selectedInstall?.verified_kw || 3} kW System)
              </h3>
              <p className="text-xs text-slate-400">{selectedInstall?.order?.lead?.address}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Lead Field Tech:</span>
              <span className="text-xs font-semibold text-white">{selectedInstall?.technician?.name || 'Ramesh Sharma'}</span>
            </div>
          </div>

          {/* Job Metrics & Timer */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Field Shift Hours</span>
              <div className="flex items-center gap-1.5 text-base font-bold text-white font-mono">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{selectedInstall?.hours_logged || 8.0} Hours</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Verified Power Gen</span>
              <div className="flex items-center gap-1.5 text-base font-bold text-emerald-400 font-mono">
                <Zap className="w-4 h-4" />
                <span>{selectedInstall?.verified_kw || 3.12} kW Test OK</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">System Status</span>
              <div className="text-xs font-bold text-slate-200 mt-1">
                {selectedInstall?.is_completed ? 'Commissioned' : 'Work In Progress'}
              </div>
            </div>
          </div>

          {/* Technician Checklist & Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Commissioning Protocol</h4>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amber-500 rounded" />
                <span>Galvanized Mounting Stands Anchored</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amber-500 rounded" />
                <span>UV-DC Cables Clipped & Conduited</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amber-500 rounded" />
                <span>Lightning Arrestor & Chemical Pit Tested</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amber-500 rounded" />
                <span>Inverter WiFi Monitoring Configured</span>
              </label>
            </div>
          </div>

          {/* Customer Digital Signature Canvas */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  Homeowner Rooftop Acceptance Digital Signature
                </h4>
                <p className="text-[11px] text-slate-400">Homeowner signs with finger or stylus upon visual handover.</p>
              </div>
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {selectedInstall?.customer_signature_base64 && selectedInstall?.is_completed ? (
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-semibold">✓ Verified Customer Signature on Record:</span>
                <img 
                  src={selectedInstall.customer_signature_base64} 
                  alt="Customer Signature" 
                  className="h-16 object-contain bg-white/10 rounded p-1"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                <SignatureCanvas
                  ref={sigPad}
                  penColor="#f59e0b"
                  canvasProps={{
                    className: 'w-full h-32 cursor-crosshair bg-slate-950'
                  }}
                />
              </div>
            )}
          </div>

          {/* Final Action */}
          {!selectedInstall?.is_completed && (
            <button
              onClick={handleCompleteJob}
              disabled={completing}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? 'Commissioning...' : 'Save Signature & Complete Handover'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
