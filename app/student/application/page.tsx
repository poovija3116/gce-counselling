import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportErrorModal from "./ReportErrorModal";

export default async function MyApplicationPage() {
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

  const application = student.applications.length > 0 ? student.applications[0] : null;

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider">APPLICATION</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">My Application</h2>
          <p className="text-gray-600 text-sm mt-1">
            View your submitted counselling application, eligibility and current application status.
          </p>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-200 transition shadow-sm whitespace-nowrap">
          PRINT / SAVE
        </button>
      </section>

      {/* Application Status */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="text-3xl text-green-500 bg-green-50 p-2 rounded-full h-12 w-12 flex items-center justify-center">✓</div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">APPLICATION STATUS</span>
            <h3 className="text-xl font-bold text-gray-800 mt-1">
              {application?.status === 'approved' ? 'Application Approved' : 'Application Submitted'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Your application has been successfully {application?.status === 'approved' ? 'approved' : 'submitted'} for management counselling.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col justify-center min-w-[250px]">
          <div className="mb-3 border-b border-gray-200 pb-2">
            <span className="block text-xs font-semibold text-gray-500 uppercase">APPLICATION NUMBER</span>
            <strong className="text-gray-900 text-lg">{application?.applicationNumber || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">SUBMITTED ON</span>
            <strong className="text-gray-900">{application?.createdAt ? new Date(application.createdAt).toLocaleDateString('en-IN') : "-"}</strong>
          </div>
        </div>
      </section>

      {/* Student Information */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">APPLICANT</span>
          <h3 className="text-lg font-bold text-gray-800">Student Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">FULL NAME</span>
            <strong className="text-gray-900">{student.user.name}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">DATE OF BIRTH</span>
            <strong className="text-gray-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">GENDER</span>
            <strong className="text-gray-900">{student.gender || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">COMMUNITY</span>
            <strong className="text-gray-900">{student.community || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">MOBILE NUMBER</span>
            <strong className="text-gray-900">{student.phone || "-"}</strong>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">EMAIL</span>
            <strong className="text-gray-900">{student.user.email}</strong>
          </div>
        </div>
      </section>

      {/* Academic Information */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ELIGIBILITY</span>
          <h3 className="text-lg font-bold text-gray-800">Academic Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <span className="block text-xs font-semibold text-blue-600 uppercase mb-1">COUNSELLING RANK</span>
            <strong className="text-xl text-blue-900">{student.rankNumber ? `#${student.rankNumber}` : "-"}</strong>
          </div>
          <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
            <span className="block text-xs font-semibold text-green-700 uppercase mb-1">ELIGIBILITY STATUS</span>
            <strong className="text-xl text-green-900">Eligible</strong>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">CURRENT ROUND</span>
            <strong className="text-xl text-gray-900">{currentRound ? `Round ${currentRound.roundNumber}` : "-"}</strong>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ELIGIBLE RANK RANGE</span>
            <strong className="text-xl text-gray-900">{currentRound ? `${currentRound.minRank} - ${currentRound.maxRank}` : "-"}</strong>
          </div>
        </div>
      </section>

      {/* Counselling Status */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6 border-b pb-2 border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">COUNSELLING</span>
          <h3 className="text-lg font-bold text-gray-800">Current Progress</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mr-4">1</div>
            <div className="flex-grow">
              <strong className="block text-green-900">Application Submitted</strong>
              <span className="text-sm text-green-700">Your application has been submitted successfully.</span>
            </div>
            <span className="px-2 py-1 text-xs font-bold bg-green-200 text-green-800 rounded">COMPLETED</span>
          </div>
          
          <div className="flex items-center p-4 border border-blue-200 bg-blue-50 rounded-lg shadow-sm">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">2</div>
            <div className="flex-grow">
              <strong className="block text-blue-900">Choice Filling</strong>
              <span className="text-sm text-blue-700">Check your dashboard for the current choice-filling status.</span>
            </div>
            <span className="px-2 py-1 text-xs font-bold bg-blue-200 text-blue-800 rounded">CURRENT</span>
          </div>

          <div className="flex items-center p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-70">
            <div className="h-8 w-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold mr-4">3</div>
            <div className="flex-grow">
              <strong className="block text-gray-700">Seat Allotment</strong>
              <span className="text-sm text-gray-500">Allotment will be processed according to rank, preferences and available seats.</span>
            </div>
            <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">PENDING</span>
          </div>

          <div className="flex items-center p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-70">
            <div className="h-8 w-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold mr-4">4</div>
            <div className="flex-grow">
              <strong className="block text-gray-700">Payment</strong>
              <span className="text-sm text-gray-500">Payment instructions will appear after allotment.</span>
            </div>
            <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded">PENDING</span>
          </div>
        </div>
      </section>

      {/* Error Report */}
      <section className="bg-red-50 p-6 rounded-lg border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="text-xs font-bold text-red-600 tracking-wider">NEED HELP?</span>
          <h3 className="text-lg font-bold text-red-900 mt-1">Found an error in your application?</h3>
          <p className="text-red-700 text-sm mt-1">If any personal, academic or application information is incorrect, report it to the Academic Support Cell.</p>
        </div>
        <ReportErrorModal />
      </section>

      <div className="flex justify-start">
        <Link href="/student/dashboard" className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-2">
          &larr; BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
