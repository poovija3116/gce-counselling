"use client";

import { useState } from "react";
import { createRound, updateRound, setRoundStatus, deleteRound } from "./actions";

type Round = {
  id: number;
  roundNumber: number;
  minRank: number;
  maxRank: number;
  status: string;
};

export default function RoundManager({ initialRounds }: { initialRounds: Round[] }) {
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    const roundNumber = parseInt(formData.get("roundNumber") as string);
    const minRank = parseInt(formData.get("minRank") as string);
    const maxRank = parseInt(formData.get("maxRank") as string);

    try {
      await createRound({ roundNumber, minRank, maxRank });
      setMessage("Round created successfully!");
      // The page will revalidate and we could rely on Server Components passing new props,
      // but let's assume page refresh or just simple optimistic update for now.
      window.location.reload();
    } catch (error: any) {
      setMessage("Error creating round: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await setRoundStatus(id, status);
      window.location.reload();
    } catch (error: any) {
      alert("Failed to update status.");
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this round?")) return;
    try {
      await deleteRound(id);
      window.location.reload();
    } catch (error: any) {
      alert("Failed to delete round.");
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
          {message}
        </div>
      )}
      
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Round</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Round Number</label>
            <input type="number" name="roundNumber" required min="1" className="w-full border border-gray-300 rounded-md p-2" defaultValue={rounds.length > 0 ? Math.max(...rounds.map(r => r.roundNumber)) + 1 : 1} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rank</label>
            <input type="number" name="minRank" required min="1" className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Rank</label>
            <input type="number" name="maxRank" required min="1" className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50">
            {isSubmitting ? "Creating..." : "Create Round"}
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Existing Rounds</h2>
        {rounds.length === 0 ? (
          <p className="text-gray-500">No rounds found. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-sm font-semibold text-gray-600">Round</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Rank Range</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((round) => (
                  <tr key={round.id} className="border-b border-gray-100 last:border-0">
                    <td className="p-3 font-medium text-gray-900">Round {round.roundNumber}</td>
                    <td className="p-3 text-gray-600">{round.minRank} - {round.maxRank}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${round.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : round.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {round.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 text-sm">
                      {round.status === 'not_started' && (
                        <button onClick={() => handleStatusChange(round.id, 'in_progress')} className="bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">Start</button>
                      )}
                      {round.status === 'in_progress' && (
                        <button onClick={() => handleStatusChange(round.id, 'completed')} className="bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100">Complete</button>
                      )}
                      <button onClick={() => handleDelete(round.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
