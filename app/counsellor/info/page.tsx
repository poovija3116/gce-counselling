import { getCounsellingInfo } from "@/lib/info";
import Link from "next/link";

export default async function CounsellingInfoPage() {
  const info = await getCounsellingInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">GCE ERODE</h1>
        <h2 className="text-xl font-semibold text-green-700 mt-2">MANAGEMENT COUNSELLING 2026</h2>
        <p className="text-gray-500 mt-1 tracking-widest text-sm font-bold">COUNSELLING INFORMATION</p>
      </header>

      <div className="flex justify-end">
        <Link href="/counsellor/edit" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition">
          Edit Information
        </Link>
      </div>

      <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">📅 COUNSELLING SCHEDULE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong className="text-gray-700">Date: </strong>
            <span className="text-gray-900">{info.date || "Not updated"}</span>
          </p>
          <p>
            <strong className="text-gray-700">Time: </strong>
            <span className="text-gray-900">{info.time || "Not updated"}</span>
          </p>
        </div>

        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">ANNOUNCEMENTS</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{info.announcement}</p>

        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">REQUIRED DOCUMENTS</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{info.documents}</p>

        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">GUIDELINES</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{info.guidelines}</p>
      </section>

      <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">📋 COUNSELLING PROCESS</h3>
        <div className="flex flex-col md:flex-row items-center justify-between text-center gap-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl mx-auto">1</div>
            <p className="font-medium text-gray-800">Candidate Login</p>
          </div>
          <div className="text-gray-400 font-bold hidden md:block">→</div>
          <div className="text-gray-400 font-bold md:hidden">↓</div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl mx-auto">2</div>
            <p className="font-medium text-gray-800">Verify Details</p>
          </div>
          <div className="text-gray-400 font-bold hidden md:block">→</div>
          <div className="text-gray-400 font-bold md:hidden">↓</div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl mx-auto">3</div>
            <p className="font-medium text-gray-800">Select Preference</p>
          </div>
          <div className="text-gray-400 font-bold hidden md:block">→</div>
          <div className="text-gray-400 font-bold md:hidden">↓</div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl mx-auto">4</div>
            <p className="font-medium text-gray-800">Attend Counselling</p>
          </div>
          <div className="text-gray-400 font-bold hidden md:block">→</div>
          <div className="text-gray-400 font-bold md:hidden">↓</div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl mx-auto">5</div>
            <p className="font-medium text-gray-800">Seat Allotment</p>
          </div>
        </div>
      </section>

      <section className="bg-yellow-50 p-6 md:p-8 rounded-xl shadow-sm border border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-900 border-b border-yellow-200 pb-2">📢 IMPORTANT INSTRUCTIONS</h3>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-yellow-800">
          <li>Candidates should report on time.</li>
          <li>Follow the counselling schedule.</li>
          <li>Follow the instructions given by the college.</li>
        </ul>
      </section>
    </div>
  );
}
