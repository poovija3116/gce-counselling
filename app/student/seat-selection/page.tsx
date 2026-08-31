import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SeatSelectionClient from "./SeatSelectionClient";

export default async function SeatSelectionPage() {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    redirect("/login?role=student");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
    include: {
      user: true,
      allotments: true,
    },
  });

  if (!student) {
    return <div>Student profile not found.</div>;
  }

  const currentRound = await prisma.counsellingRound.findFirst({
    where: { status: { not: "completed" } },
    orderBy: { roundNumber: "asc" },
  });

  if (!currentRound) {
    return (
      <div className="p-8 text-center text-gray-500">
        Live Counselling is not active.
      </div>
    );
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const existingAllotment = student.allotments.find(a => a.roundId === currentRound.id);

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <span className="text-xs font-bold text-blue-600 tracking-wider">LIVE COUNSELLING</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">Seat Selection</h2>
        <p className="text-gray-600 text-sm mt-1">Select one available department when your counselling turn arrives.</p>
      </section>

      <section className="bg-blue-800 text-white p-6 rounded-lg shadow-sm flex flex-wrap gap-8">
        <div>
          <span className="block text-xs font-semibold text-blue-200 uppercase mb-1">YOUR RANK</span>
          <strong className="text-2xl">{student.rankNumber || "-"}</strong>
        </div>
        <div>
          <span className="block text-xs font-semibold text-blue-200 uppercase mb-1">STUDENT NAME</span>
          <strong className="text-xl leading-8">{student.user.name}</strong>
        </div>
        <div>
          <span className="block text-xs font-semibold text-blue-200 uppercase mb-1">COUNSELLING STATUS</span>
          <strong className="bg-white text-blue-800 px-3 py-1 rounded font-bold text-sm">YOUR TURN</strong>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AVAILABLE SEATS</span>
          <h3 className="text-lg font-bold text-gray-800">Choose Your Department</h3>
          <p className="text-sm text-gray-500">Only departments with available seats can be selected.</p>
        </div>

        <SeatSelectionClient 
          departments={departments}
          existingAllotment={existingAllotment ? { departmentId: existingAllotment.departmentId, status: existingAllotment.status } : null}
        />
      </section>
    </div>
  );
}
