"use client";

import { useState } from "react";

export default function ReportErrorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-red-50 text-red-700 border border-red-200 px-6 py-2 rounded font-medium hover:bg-red-100 transition w-full md:w-auto mt-4"
      >
        REPORT AN ERROR
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-xs font-bold text-gray-500 tracking-wider">APPLICATION SUPPORT</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Report an Application Error</h3>
              <p className="text-sm text-gray-600 mb-6">Select the information that needs correction and describe the problem clearly.</p>

              {submitted ? (
                <div className="bg-green-50 text-green-700 p-4 rounded text-center font-medium border border-green-200">
                  Report submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">INFORMATION TYPE</label>
                    <select required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select</option>
                      <option>Personal Information</option>
                      <option>Academic Information</option>
                      <option>Community Information</option>
                      <option>Rank / Eligibility</option>
                      <option>Application Information</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">DESCRIPTION</label>
                    <textarea required rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Describe the error..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition shadow-sm">
                    SUBMIT ERROR REPORT
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
