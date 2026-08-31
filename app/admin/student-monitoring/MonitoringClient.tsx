"use client";

import { useState } from "react";
import { Search, RefreshCw, FilterX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MonitoringClient({ initialStudents }: { initialStudents: any[] }) {
  const router = useRouter();
  
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const totalStudents = students.length;
  
  // Calculate summary
  const totalAllotted = students.filter(s => {
    const allotment = s.allotments?.[0];
    return allotment?.status === "allotted" || allotment?.status === "confirmed";
  }).length;

  const totalConfirmed = students.filter(s => {
    return s.allotments?.[0]?.status === "confirmed";
  }).length;

  const totalNotAllotted = students.filter(s => {
    return !s.allotments?.[0] || s.allotments?.[0]?.status === "not_allotted";
  }).length;

  const filteredStudents = students.filter(student => {
    const name = student.user.name.toLowerCase();
    const email = student.user.email.toLowerCase();
    const appNum = student.applications?.[0]?.applicationNumber?.toLowerCase() || "";
    const searchMatch = !searchTerm || name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || appNum.includes(searchTerm.toLowerCase());

    const rankMatch = !rankFilter || String(student.rankNumber) === rankFilter;
    
    const deptCode = student.allotments?.[0]?.department?.code?.toLowerCase() || "";
    const deptMatch = !departmentFilter || deptCode === departmentFilter.toLowerCase();
    
    const allotmentStatus = student.allotments?.[0]?.status || "not_allotted";
    const statusMatch = !statusFilter || allotmentStatus === statusFilter;

    return searchMatch && rankMatch && deptMatch && statusMatch;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setRankFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return "-";
    const cleanStatus = status.toLowerCase().replace(/_/g, " ");
    
    let color = "bg-slate-100 text-slate-800";
    if (status === "allotted") color = "bg-blue-100 text-blue-800";
    if (status === "confirmed" || status === "completed") color = "bg-green-100 text-green-800";
    if (status === "pending") color = "bg-yellow-100 text-yellow-800";
    if (status === "rejected") color = "bg-red-100 text-red-800";
    
    return (
      <span className={`${color} px-2 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap`}>
        {cleanStatus}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
          <strong className="block text-3xl mt-2 text-slate-800">{totalStudents}</strong>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Allotted</span>
          <strong className="block text-3xl mt-2 text-blue-700">{totalAllotted}</strong>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">Confirmed</span>
          <strong className="block text-3xl mt-2 text-green-700">{totalConfirmed}</strong>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Not Allotted</span>
          <strong className="block text-3xl mt-2 text-slate-800">{totalNotAllotted}</strong>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Search & Filter Students</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">SEARCH</label>
            <input 
              type="text" 
              placeholder="Name, email or app number" 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">RANK</label>
            <input 
              type="number" 
              placeholder="Enter rank" 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">DEPARTMENT</label>
            <select 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
              <option value="eee">EEE</option>
              <option value="mech">MECH</option>
              <option value="civil">CIVIL</option>
              <option value="cse ds">CSE DS</option>
              <option value="it">IT</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">STATUS</label>
            <select 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="allotted">Allotted</option>
              <option value="confirmed">Confirmed</option>
              <option value="not_allotted">Not Allotted</option>
            </select>
          </div>
          <button 
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <FilterX className="w-4 h-4" /> Clear Filters
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Student Records</h3>
            <p className="text-sm text-slate-500">All registered students and their counselling status</p>
          </div>
          <span className="text-sm font-medium text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
            {filteredStudents.length} students
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Seat</th>
                <th className="px-4 py-3">Allotment</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Overall Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const app = student.applications?.[0];
                  const allotment = student.allotments?.[0];
                  const dept = allotment?.department;
                  const payment = allotment?.payments?.[0];
                  
                  // Compute overall status for simplicity
                  let overallStatus = "not_allotted";
                  if (allotment) {
                    overallStatus = allotment.status;
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{student.rankNumber || "-"}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{student.user.name}</td>
                      <td className="px-4 py-3">{student.user.email}</td>
                      <td className="px-4 py-3">
                        {app ? (
                          <>
                            <div className="font-mono">{app.applicationNumber}</div>
                            <div className="text-xs text-slate-400 capitalize">{app.status}</div>
                          </>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {dept ? (
                          <>
                            <div className="font-bold">{dept.code}</div>
                            <div className="text-xs text-slate-500">{dept.name}</div>
                          </>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{allotment?.seatNumber || "-"}</td>
                      <td className="px-4 py-3">{getStatusBadge(allotment?.status)}</td>
                      <td className="px-4 py-3">{getStatusBadge(allotment?.studentDecision)}</td>
                      <td className="px-4 py-3">{getStatusBadge(payment?.paymentStatus)}</td>
                      <td className="px-4 py-3">{getStatusBadge(overallStatus)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
