import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Calendar,
  AlertCircle,
  Briefcase,
  X,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { DEFAULT_EMPLOYEES } from '../utils/syntheticData';

export default function EmployeeView({ employees = [], onRefresh }) {
  const activeEmployees = Array.isArray(employees) && employees.length > 0 ? employees : DEFAULT_EMPLOYEES;

  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingEmployee, setInspectingEmployee] = useState(null);
  const [employeeJobs, setEmployeeJobs] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const filteredEmployees = activeEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAttendance = async (empId, currentStatus) => {
    const nextStatus = currentStatus === 'PRESENT' ? 'ON_LEAVE' : currentStatus === 'ON_LEAVE' ? 'ABSENT' : 'PRESENT';
    try {
      await api.updateAttendance(empId, nextStatus);
      onRefresh();
    } catch (err) {
      alert('Error updating attendance: ' + err.message);
    }
  };

  const handleInspectJobs = async (emp) => {
    setInspectingEmployee(emp);
    setLoadingJobs(true);
    try {
      const jobs = await api.getEmployeeJobs(emp.id);
      setEmployeeJobs(jobs);
    } catch (err) {
      alert('Error fetching employee jobs: ' + err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const totalCrew = activeEmployees.length;
  const presentCount = activeEmployees.filter(e => e.attendance_status === 'PRESENT').length;
  const onLeaveCount = activeEmployees.filter(e => e.attendance_status === 'ON_LEAVE').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          Field Crew & Technician Roster (15 Certified Technicians)
        </h2>
        <p className="text-xs text-slate-400">
          Manage technician field deployment, attendance logs, hourly rate billing, and rooftop crew scheduling.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Technicians</span>
          <p className="text-xl font-bold text-white font-mono">{totalCrew}</p>
          <span className="text-[10px] text-slate-500">Certified Solar Crew</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">On-Duty Today</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">{presentCount}</p>
          <span className="text-[10px] text-slate-500">Available for Dispatch</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">On Scheduled Leave</span>
          <p className="text-xl font-bold text-amber-400 font-mono">{onLeaveCount}</p>
          <span className="text-[10px] text-slate-500">Rest / Rotation</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Avg Hourly Rate</span>
          <p className="text-xl font-bold text-sky-400 font-mono">₹380/hr</p>
          <span className="text-[10px] text-slate-500">Job Costing Baseline</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search technician by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Technicians Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isPresent = emp.attendance_status === 'PRESENT';
          const isLeave = emp.attendance_status === 'ON_LEAVE';

          return (
            <div key={emp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-white">{emp.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    isPresent
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isLeave
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {emp.attendance_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hourly Pay Rate</span>
                    <span className="font-bold text-amber-400">₹<span className="font-mono">{emp.hourly_rate}</span>/hr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Estimated Monthly</span>
                    <span className="font-bold text-slate-200">₹<span className="font-mono">{(emp.hourly_rate * 160).toLocaleString('en-IN')}</span></span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleInspectJobs(emp)}
                  className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[11px] font-semibold border border-amber-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Assigned Jobs
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAttendance(emp.id, emp.attendance_status)}
                  className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition-colors"
                >
                  Status: {emp.attendance_status} ↻
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Jobs Modal */}
      {inspectingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  Field Workload: {inspectingEmployee.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assigned rooftop surveys and turn-key installation jobs.
                </p>
              </div>
              <button
                onClick={() => {
                  setInspectingEmployee(null);
                  setEmployeeJobs(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingJobs ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading assignments…</div>
            ) : employeeJobs ? (
              <div className="space-y-4">
                {/* Summary counts */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold">Assigned Site Surveys</span>
                    <p className="text-lg font-bold text-amber-400 font-mono mt-1">{employeeJobs.surveys_count}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold">Assigned Installations</span>
                    <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{employeeJobs.installations_count}</p>
                  </div>
                </div>

                {/* Surveys List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Site Surveys:</h4>
                  {employeeJobs.surveys.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-950 rounded">No site surveys currently assigned.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {employeeJobs.surveys.map((s) => (
                        <div key={s.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-white font-semibold">{s.customer}</span>
                            <span className="text-[10px] text-slate-400 block">Survey #<span className="font-mono">{s.id}</span></span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            s.approved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {s.approved ? 'Approved' : 'Pending Review'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Installations List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Installations:</h4>
                  {employeeJobs.installations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-950 rounded">No installations currently assigned.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {employeeJobs.installations.map((i) => (
                        <div key={i.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-white font-semibold">{i.customer}</span>
                            <span className="text-[10px] text-slate-400 block">Job #<span className="font-mono">{i.id}</span>, Progress: <span className="font-mono">{i.progress}%</span></span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            i.completed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}>
                            {i.completed ? 'Completed' : `${i.progress}% In-Flight`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setInspectingEmployee(null);
                  setEmployeeJobs(null);
                }}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
