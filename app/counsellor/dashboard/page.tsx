import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function CounsellorDashboard() {
  const currentRound = await prisma.counsellingRound.findFirst({
    where: { status: { not: "completed" } },
    orderBy: { roundNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-green-700 tracking-wider">COUNSELLOR PANEL</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor the current counselling process and round status.</p>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${currentRound ? (currentRound.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600') : 'bg-gray-100 text-gray-600'}`}>
          ●
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-widest">COUNSELLING STATUS</p>
          <h2 className="text-xl font-bold text-gray-800 mt-1 capitalize">
            {currentRound ? currentRound.status.replace("_", " ") : "No active round"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {currentRound ? `Round ${currentRound.roundNumber} is currently ${currentRound.status.replace("_", " ")}.` : "All rounds are completed or no rounds exist."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-widest">CURRENT ROUND</span>
            <span className="text-gray-400">#</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-2">
            {currentRound ? `Round ${currentRound.roundNumber}` : "-"}
          </div>
          <p className="text-sm text-gray-500">Active counselling round</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-widest">ELIGIBLE RANK</span>
            <span className="text-gray-400">↕</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-2">
            {currentRound ? `${currentRound.minRank} - ${currentRound.maxRank}` : "-"}
          </div>
          <p className="text-sm text-gray-500">Students eligible for this round</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-widest">QUICK ACTIONS</span>
            <span className="text-gray-400">⚙</span>
          </div>
          <div className="space-y-3">
            <Link href="/counsellor/round-management" className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">
              Manage Rounds
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">i</div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">Counsellor Control</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Round configuration, rank settings, choice-filling progression, and payment periods are controlled from the 
            <Link href="/counsellor/round-management" className="text-green-600 font-medium hover:underline ml-1">Round Management page</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
