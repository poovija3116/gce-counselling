import prisma from "@/lib/prisma";
import RoundManager from "./RoundManager";

export default async function RoundManagementPage() {
  const rounds = await prisma.counsellingRound.findMany({
    orderBy: { roundNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-green-700 tracking-wider">COUNSELLING CONTROL</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Round Management</h1>
        <p className="text-gray-600 mt-2">
          Configure rank ranges, manage allotment stages, and monitor the complete counselling cycle.
        </p>
      </header>

      <RoundManager initialRounds={rounds} />
    </div>
  );
}
