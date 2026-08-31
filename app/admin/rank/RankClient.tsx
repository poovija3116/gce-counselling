"use client";

import { useState } from "react";
import { addStudentAndGenerateRank } from "./actions";
import { Search, Plus, CheckCircle, RefreshCw } from "lucide-react";

export default function RankClient({ initialStudents }: { initialStudents: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);

  const totalStudents = students.length;
  const verifiedStudents = students.length; // We assume all in DB are verified for now
  const rankGenerated = students.filter(s => s.rankNumber > 0).length;

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.user.name.toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term) ||
      s.applications[0]?.applicationNumber.toLowerCase().includes(term) ||
      (s.community && s.community.toLowerCase().includes(term))
    );
  });

  async function handleAddStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage({ text: "Processing...", type: "info" });
    const formData = new FormData(e.currentTarget);
    
    // Check checkboxes
    const marksheet = (document.getElementById("marksheetVerified") as HTMLInputElement).checked;
    const community = (document.getElementById("communityVerified") as HTMLInputElement).checked;
    const application = (document.getElementById("applicationVerified") as HTMLInputElement).checked;

    if (!marksheet || !community || !application) {
      setMessage({ text: "Please verify all documents.", type: "error" });
      return;
    }

    const result = await addStudentAndGenerateRank(formData);
    if (result.success) {
      setMessage({ text: result.message, type: "success" });
      if (result.credentials) {
        setCredentials(result.credentials);
      }
      (e.target as HTMLFormElement).reset();
      // Next.js revalidatePath won't instantly update the client state passed as prop if we don't refresh
      // but we can just tell them to refresh or reload the page.
      window.location.reload(); 
    } else {
      setMessage({ text: result.message, type: "error" });
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 flex flex-col">
          <span className="text-sm font-semibold text-slate-500">TOTAL STUDENTS</span>
          <strong className="text-2xl mt-2 text-slate-800">{totalStudents}</strong>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 flex flex-col">
          <span className="text-sm font-semibold text-slate-500">VERIFIED</span>
          <strong className="text-2xl mt-2 text-slate-800">{verifiedStudents}</strong>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 flex flex-col">
          <span className="text-sm font-semibold text-slate-500">RANK GENERATED</span>
          <strong className="text-2xl mt-2 text-slate-800">{rankGenerated}</strong>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow flex flex-col">
          <span className="text-sm font-semibold text-blue-100">CURRENT RANK</span>
          <strong className="text-2xl mt-2">-</strong>
        </div>
      </section>

      {/* Add Student Form */}
      <section className="bg-white p-8 rounded-lg shadow border border-slate-200">
        <div className="mb-6">
          <span className="text-xs font-bold text-blue-600 tracking-wider">HARD COPY ENTRY</span>
          <h3 className="text-xl font-bold mt-1">Add Student Application</h3>
          <p className="text-sm text-slate-500">Enter the information exactly as received from the physical application.</p>
        </div>

        <form onSubmit={handleAddStudent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">STUDENT NAME</label>
              <input name="name" type="text" required className="w-full border border-slate-300 rounded px-3 py-2" placeholder="Enter student name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">EMAIL / USERNAME</label>
              <input name="email" type="email" required className="w-full border border-slate-300 rounded px-3 py-2" placeholder="student@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DATE OF BIRTH</label>
              <input name="dob" type="date" required className="w-full border border-slate-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">APPLICATION NUMBER</label>
              <input name="applicationNumber" type="text" required className="w-full border border-slate-300 rounded px-3 py-2" placeholder="e.g. GCE2026001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CUTOFF MARK</label>
              <input name="cutoff" type="number" step="0.01" min="0" max="200" required className="w-full border border-slate-300 rounded px-3 py-2" placeholder="e.g. 198.50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">COMMUNITY</label>
              <select name="community" required className="w-full border border-slate-300 rounded px-3 py-2 bg-white">
                <option value="">Select Community</option>
                <option value="OC">OC</option>
                <option value="BC">BC</option>
                <option value="BCM">BCM</option>
                <option value="MBC">MBC</option>
                <option value="SC">SC</option>
                <option value="SCA">SCA</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
            <h4 className="text-sm font-bold mb-3 text-slate-800">DOCUMENT VERIFICATION</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" id="marksheetVerified" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                Marksheet Verified
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" id="communityVerified" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                Community Certificate
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" id="applicationVerified" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                Application Verified
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              VERIFY & GENERATE RANK
            </button>
            <button type="reset" className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg font-medium transition-colors">
              CLEAR
            </button>
          </div>

          {message.text && (
            <p className={`text-sm mt-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message.text}
            </p>
          )}
        </form>
      </section>

      {/* Generated Credentials */}
      {credentials && (
        <section className="bg-green-50 p-8 rounded-lg border border-green-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Account Created
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Username: <strong>{credentials.username}</strong> <br/>
              Password: <strong>{credentials.password}</strong>
            </p>
          </div>
        </section>
      )}

      {/* Student List */}
      <section className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Counselling Rank List</h3>
            <p className="text-sm text-slate-500">Student records entered by the administration.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="search" 
              placeholder="Search student..." 
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Application</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Community</th>
                <th className="px-6 py-3">Cutoff</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{student.rankNumber || '-'}</td>
                    <td className="px-6 py-4 font-mono">{student.applications[0]?.applicationNumber}</td>
                    <td className="px-6 py-4">{student.user.name}</td>
                    <td className="px-6 py-4">{student.community}</td>
                    <td className="px-6 py-4 font-medium">{student.cutoffMark?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500">{student.user.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
