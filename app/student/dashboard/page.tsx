import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    redirect("/login?role=student");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
    include: {
      user: true,
      applications: true,
      preferences: true,
    },
  });

  if (!student) {
    return <div>Student profile not found.</div>;
  }

  const currentRound = await prisma.counsellingRound.findFirst({
    where: { status: { not: "completed" } },
    orderBy: { roundNumber: "asc" },
  });

  const myRank = student.rankNumber;
  const minRank = currentRound?.minRank;
  const maxRank = currentRound?.maxRank;

  let eligible = false;
  if (myRank != null && minRank != null && maxRank != null) {
    eligible = myRank >= minRank && myRank <= maxRank;
  }

  let roundMessage = "Counselling round information is available.";
  if (currentRound) {
    if (currentRound.status === "in_progress") { // wait, schema says 'not_started', 'in_progress', 'completed' for status. Old version used 'preference_open' etc.
      if (eligible) {
        roundMessage = "Your rank is eligible for this counselling round. Choice filling is open.";
      } else if (myRank != null && myRank < minRank!) {
        roundMessage = "Your rank was processed in an earlier counselling round.";
      } else {
        roundMessage = "Your rank is not included in this counselling round.";
      }
    }
  }

  const choiceCount = student.preferences.length;
  // schema preference has `isLocked`
  const isLocked = student.preferences.length > 0 ? student.preferences[0].isLocked : false;

  const application = student.applications.length > 0 ? student.applications[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <span className="text-sm font-semibold text-blue-600 tracking-wider">STUDENT PORTAL</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">
          Welcome, {student.user.name} 👋
        </h2>
        <p className="text-gray-600 mt-2">
          Manage your management counselling preferences and track your seat allotment.
        </p>
      </section>

      {/* Student Details */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">YOUR DETAILS</span>
          <h3 className="text-lg font-bold text-gray-800">Counselling Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">STUDENT NAME</span>
            <strong className="text-gray-900">{student.user.name}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">COUNSELLING RANK</span>
            <strong className="text-blue-600 font-bold">{student.rankNumber ? `#${student.rankNumber}` : "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">APPLICATION NUMBER</span>
            <strong className="text-gray-900">{application?.applicationNumber || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">APPLICATION STATUS</span>
            <strong className={`px-2 py-1 text-xs rounded-full ${application?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {application?.status?.toUpperCase() || "PENDING"}
            </strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">COMMUNITY</span>
            <strong className="text-gray-900">{student.community || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">CUTOFF MARK</span>
            <strong className="text-gray-900">{student.cutoffMark || "-"}</strong>
          </div>
        </div>
      </section>

      {/* Current Round */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CURRENT COUNSELLING ROUND</span>
          <h3 className="text-lg font-bold text-gray-800">Choice Filling Status</h3>
        </div>
        <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
          <div className="text-4xl">🎯</div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800">
              {currentRound ? `ROUND ${currentRound.roundNumber}` : "ROUND INFORMATION UNAVAILABLE"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{roundMessage}</p>
            <div className="flex gap-4 mt-3 text-sm flex-wrap">
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">CURRENT ROUND: <strong>{currentRound?.roundNumber || "-"}</strong></span>
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">ELIGIBLE RANK: <strong>{currentRound ? `${currentRound.minRank} - ${currentRound.maxRank}` : "-"}</strong></span>
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">YOUR RANK: <strong>{student.rankNumber || "-"}</strong></span>
            </div>
          </div>
          <Link href="/student/choice-filling" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto text-center font-medium">
            ENTER CHOICE FILLING →
          </Link>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
          <div className="text-4xl mb-3">📋</div>
          <span className="text-xs font-bold text-blue-600 tracking-wider">APPLICATION</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2">My Application</h3>
          <p className="text-gray-600 text-sm mb-4 h-10">View your submitted counselling application and details.</p>
          <Link href="/student/application" className="block w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
            VIEW APPLICATION
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
          <div className="text-4xl mb-3">🪑</div>
          <span className="text-xs font-bold text-blue-600 tracking-wider">LIVE DATA</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2">Seat Availability</h3>
          <p className="text-gray-600 text-sm mb-4 h-10">Check branch-wise community seat availability before choosing.</p>
          <Link href="/" className="block w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
            VIEW SEATS
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition">
          <div className="text-4xl mb-3">ℹ️</div>
          <span className="text-xs font-bold text-blue-600 tracking-wider">GUIDELINES</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1 mb-2">Counselling Information</h3>
          <p className="text-gray-600 text-sm mb-4 h-10">Read important rules and instructions for online counselling.</p>
          <Link href="/" className="block w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
            VIEW INFORMATION
          </Link>
        </div>
      </section>

      {/* Preference Status */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">PREFERENCE STATUS</span>
          <h3 className="text-lg font-bold text-gray-800">Your Choice Filling Status</h3>
        </div>
        <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
          <div className="text-4xl">{isLocked ? "🔒" : "🔓"}</div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800">{isLocked ? "Preferences Locked" : "Preferences Not Locked"}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {isLocked 
                ? "Your preferences are locked and considered for allotment." 
                : "You can still add, remove and rearrange your preferred departments."}
            </p>
            <div className="flex gap-4 mt-3 text-sm flex-wrap">
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">NUMBER OF CHOICES: <strong>{choiceCount}</strong></span>
              <span className={`px-3 py-1 rounded border ${isLocked ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                LOCK STATUS: <strong>{isLocked ? "LOCKED" : "NOT LOCKED"}</strong>
              </span>
            </div>
          </div>
          <Link href="/student/choice-filling" className="bg-gray-100 text-gray-800 border border-gray-300 px-6 py-2 rounded hover:bg-gray-200 transition w-full md:w-auto text-center font-medium">
            {isLocked ? "VIEW PREFERENCES" : "EDIT PREFERENCES"}
          </Link>
        </div>
      </section>

      {/* Allotment */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AUTOMATIC ALLOTMENT</span>
          <h3 className="text-lg font-bold text-gray-800">My Seat Allotment</h3>
        </div>
        <div className="flex items-center gap-4 text-gray-500 p-6 bg-gray-50 rounded border border-dashed border-gray-300">
          <div className="text-4xl">⏳</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Check Allotment Order Page</h3>
            <p className="text-sm">Your seat allotment result will appear in the Allotment Order section.</p>
          </div>
          <div className="ml-auto">
             <Link href="/student/allotment-order" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
               View Allotment Order
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
