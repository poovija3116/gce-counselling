import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChoiceFillingClient from "./ChoiceFillingClient";

export default async function ChoiceFillingPage() {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    redirect("/login?role=student");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
    include: {
      user: true,
      applications: true,
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
        Choice filling is not open at the moment.
      </div>
    );
  }

  const application = student.applications.length > 0 ? student.applications[0] : null;

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const preferences = await prisma.preference.findMany({
    where: { studentId: student.id, roundId: currentRound.id },
  });

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <span className="text-xs font-bold text-blue-600 tracking-wider">ONLINE COUNSELLING</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">Department Choice Filling</h2>
        <p className="text-gray-600 text-sm mt-1">
          Select and arrange your preferred departments according to your priority.
        </p>
      </section>

      {/* Student Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-6 justify-between">
        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">STUDENT NAME</span>
          <strong className="text-gray-900">{student.user.name}</strong>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">COUNSELLING RANK</span>
          <strong className="text-blue-600 font-bold">{student.rankNumber ? `#${student.rankNumber}` : "-"}</strong>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">APPLICATION NUMBER</span>
          <strong className="text-gray-900">{application?.applicationNumber || "-"}</strong>
        </div>
      </section>

      <ChoiceFillingClient 
        departments={departments}
        initialPreferences={preferences}
        roundId={currentRound.id}
      />

      {/* Notice */}
      <section className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 flex gap-4 items-start">
        <div className="text-2xl mt-1">⚠️</div>
        <div>
          <h3 className="font-bold text-yellow-900">Important</h3>
          <p className="text-yellow-800 text-sm mt-1">
            Carefully check your preference order before locking your choices. 
            <strong> Once locked, your preferences cannot be changed unless the administration reopens the choice-filling window.</strong>
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="bg-blue-100 text-blue-700 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</div>
          <div>
            <strong className="block text-sm text-gray-800">Select Departments</strong>
            <p className="text-xs text-gray-500 mt-1">Add the departments you prefer.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="bg-blue-100 text-blue-700 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</div>
          <div>
            <strong className="block text-sm text-gray-800">Arrange Choices</strong>
            <p className="text-xs text-gray-500 mt-1">Set your preferred priority order.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="bg-blue-100 text-blue-700 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</div>
          <div>
            <strong className="block text-sm text-gray-800">Lock Preferences</strong>
            <p className="text-xs text-gray-500 mt-1">Confirm your final choices.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="bg-blue-100 text-blue-700 font-bold h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</div>
          <div>
            <strong className="block text-sm text-gray-800">Automatic Allotment</strong>
            <p className="text-xs text-gray-500 mt-1">Seats are allotted according to rank, community and preference.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
