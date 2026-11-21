import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function EmployeeView({ employees, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
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

  const totalCrew = employees.length;
  const presentCount = employees.filter(e => e.attendance_status === 'PRESENT').length;
  const onLeaveCount = employees.filter(e => e.attendance_status === 'ON_LEAVE').length;

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
            <div key={emp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
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
                  <span className="text-[10px] text-slate-500 block uppercase">Hourly Pay Rate</span>
                  <span className="font-bold text-amber-400 font-mono">₹{emp.hourly_rate}/hr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Estimated Monthly</span>
                  <span className="font-bold text-slate-200 font-mono">₹{(emp.hourly_rate * 160).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Toggle Status:</span>
                <button
                  onClick={() => handleToggleAttendance(emp.id, emp.attendance_status)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-all"
                >
                  Change Status →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
