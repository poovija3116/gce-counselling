"use client";

import { useState, useTransition } from "react";
import { selectSeat } from "./actions";

type Department = {
  id: number;
  code: string;
  name: string;
  availableSeats: number;
};

export default function SeatSelectionClient({
  departments,
  existingAllotment,
}: {
  departments: Department[];
  existingAllotment: { departmentId: number, status: string } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  const handleSelect = (deptId: number) => {
    setSelectedDeptId(deptId);
  };

  const confirmSelection = () => {
    if (!selectedDeptId) return;
    startTransition(async () => {
      try {
        await selectSeat(selectedDeptId);
        alert("Seat selection submitted successfully.");
      } catch (error: any) {
        alert(error.message || "Failed to select seat.");
      }
      setSelectedDeptId(null);
    });
  };

  const selectedDepartmentName = existingAllotment 
    ? departments.find(d => d.id === existingAllotment.departmentId)?.name 
    : null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {departments.map((dept) => {
          const isFull = dept.availableSeats === 0;
          const isSelected = existingAllotment?.departmentId === dept.id;

          return (
            <div 
              key={dept.id} 
              className={`p-6 rounded-lg border text-center relative overflow-hidden ${
                isSelected ? 'border-green-500 bg-green-50' : 
                isFull ? 'border-red-200 bg-red-50 opacity-80' : 
                'border-gray-200 bg-white hover:shadow-md'
              } transition`}
            >
              <div className="text-2xl font-bold text-gray-800 mb-2">{dept.code}</div>
              <div className="text-sm text-gray-500 mb-6">{dept.name}</div>
              
              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase">VACANCY</span>
                <span className={`text-xl font-bold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>
                  {String(dept.availableSeats).padStart(2, '0')}
                </span>
              </div>

              <button 
                disabled={isFull || !!existingAllotment || isPending}
                onClick={() => handleSelect(dept.id)}
                className={`w-full py-2 rounded font-semibold text-sm transition ${
                  isSelected ? 'bg-green-600 text-white cursor-default' : 
                  isFull ? 'bg-red-100 text-red-700 cursor-not-allowed' : 
                  'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {isSelected ? 'SELECTED' : isFull ? 'SEAT FULL' : 'SELECT SEAT'}
              </button>
            </div>
          );
        })}
      </div>

      {existingAllotment && (
        <section className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4 shadow-sm">
          <div className="text-3xl text-green-600">✓</div>
          <div>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider block mb-1">SELECTED DEPARTMENT</span>
            <h3 className="text-xl font-bold text-green-900">{selectedDepartmentName}</h3>
            <p className="text-green-800 text-sm mt-1">Waiting for counselling officer confirmation.</p>
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      {selectedDeptId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="text-4xl text-blue-600 mb-4">?</div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">CONFIRM SELECTION</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Select {departments.find(d => d.id === selectedDeptId)?.code}?
            </h3>
            <p className="text-sm text-gray-600 mb-8">Are you sure you want to select this department?</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedDeptId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50 transition"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmSelection}
                disabled={isPending}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                {isPending ? "CONFIRMING..." : "CONFIRM SEAT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
