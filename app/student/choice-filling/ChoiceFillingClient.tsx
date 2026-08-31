"use client";

import { useState, useTransition } from "react";
import { savePreferences, lockPreferences } from "./actions";

type Department = {
  id: number;
  code: string;
  name: string;
  availableSeats: number;
};

type Preference = {
  departmentId: number;
  priority: number;
  isLocked: boolean;
};

export default function ChoiceFillingClient({
  departments,
  initialPreferences,
  roundId,
}: {
  departments: Department[];
  initialPreferences: Preference[];
  roundId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  
  // Sort initial preferences by priority
  const sortedInitial = [...initialPreferences].sort((a, b) => a.priority - b.priority);
  const isLocked = sortedInitial.length > 0 && sortedInitial[0].isLocked;
  
  // State for selected department IDs (in order of preference)
  const [selectedIds, setSelectedIds] = useState<number[]>(sortedInitial.map(p => p.departmentId));

  const filteredDepts = departments.filter(d => 
    !selectedIds.includes(d.id) && 
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedDepts = selectedIds.map(id => departments.find(d => d.id === id)!).filter(Boolean);

  const addPreference = (deptId: number) => {
    if (isLocked) return;
    const newIds = [...selectedIds, deptId];
    setSelectedIds(newIds);
    startTransition(() => {
      savePreferences(newIds, roundId);
    });
  };

  const removePreference = (deptId: number) => {
    if (isLocked) return;
    const newIds = selectedIds.filter(id => id !== deptId);
    setSelectedIds(newIds);
    startTransition(() => {
      savePreferences(newIds, roundId);
    });
  };

  const moveUp = (index: number) => {
    if (isLocked || index === 0) return;
    const newIds = [...selectedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setSelectedIds(newIds);
    startTransition(() => {
      savePreferences(newIds, roundId);
    });
  };

  const moveDown = (index: number) => {
    if (isLocked || index === selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    setSelectedIds(newIds);
    startTransition(() => {
      savePreferences(newIds, roundId);
    });
  };

  const handleLock = () => {
    if (selectedIds.length === 0) {
      alert("Please add at least one preference before locking.");
      return;
    }
    if (confirm("Are you sure you want to lock your preferences? This action cannot be undone.")) {
      startTransition(() => {
        lockPreferences(roundId);
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
          <div className="bg-white p-3 rounded-full shadow-lg text-sm font-semibold text-blue-600">Saving...</div>
        </div>
      )}

      {/* Available Departments */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
        <div className="mb-4 pb-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AVAILABLE DEPARTMENTS</span>
          <h3 className="text-lg font-bold text-gray-800">Select Your Choices</h3>
        </div>
        
        <input 
          type="text" 
          placeholder="Search department..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 mb-4"
          disabled={isLocked}
        />
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredDepts.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">No departments found.</div>
          ) : (
            filteredDepts.map(dept => (
              <div key={dept.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div>
                  <strong className="block text-gray-800">{dept.name}</strong>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{dept.code}</span>
                  <span className="text-xs text-green-600 font-semibold ml-2">{dept.availableSeats} Seats</span>
                </div>
                <button 
                  onClick={() => addPreference(dept.id)}
                  disabled={isLocked}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Preferences */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">YOUR PREFERENCES</span>
            <h3 className="text-lg font-bold text-gray-800">Choice Order</h3>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            {selectedIds.length} Choices
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">Arrange your choices from highest preference to lowest preference.</p>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {selectedDepts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-lg font-bold text-gray-700">No Preferences Added</h3>
              <p className="text-sm text-center mt-1">Select departments from the left to add them here.</p>
            </div>
          ) : (
            selectedDepts.map((dept, index) => (
              <div key={dept.id} className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(index)} disabled={isLocked || index === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">▲</button>
                  <button onClick={() => moveDown(index)} disabled={isLocked || index === selectedDepts.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">▼</button>
                </div>
                <div className="bg-blue-600 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <strong className="block text-gray-800 text-sm leading-tight">{dept.name}</strong>
                  <span className="text-xs text-blue-600 font-medium">{dept.code}</span>
                </div>
                <button 
                  onClick={() => removePreference(dept.id)}
                  disabled={isLocked}
                  className="text-red-500 hover:bg-red-100 p-2 rounded transition disabled:opacity-50 text-xl font-bold leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={handleLock}
          disabled={isLocked || selectedIds.length === 0}
          className={`w-full mt-4 py-3 rounded font-bold transition flex items-center justify-center gap-2 ${
            isLocked 
              ? "bg-green-100 text-green-700 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          }`}
        >
          {isLocked ? "🔒 PREFERENCES LOCKED" : "🔒 LOCK PREFERENCES"}
        </button>
      </div>
    </div>
  );
}
