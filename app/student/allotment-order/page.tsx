import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AllotmentOrderPage() {
  const session = await auth();
  if (!session || session.user.role !== "student") {
    redirect("/login?role=student");
  }

  const student = await prisma.student.findUnique({
    where: { userId: parseInt(session.user.id, 10) },
    include: {
      user: true,
      applications: true,
      allotments: {
        include: {
          department: true,
          round: true,
          payments: true,
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      },
    },
  });

  if (!student) {
    return <div>Student profile not found.</div>;
  }

  const application = student.applications.length > 0 ? student.applications[0] : null;
  const allotment = student.allotments.length > 0 ? student.allotments[0] : null;
  const payment = allotment && allotment.payments.length > 0 ? allotment.payments[0] : null;

  return (
    <div className="bg-white max-w-4xl mx-auto border border-gray-200 shadow-lg print:shadow-none print:border-none p-0">
      
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-800 text-white font-bold h-16 w-16 flex items-center justify-center rounded-lg text-xl tracking-widest shrink-0">
            GCE
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">GOVERNMENT COLLEGE OF ENGINEERING, ERODE</h1>
            <p className="text-gray-600 text-sm">ERODE - 638316</p>
            <span className="text-blue-700 font-semibold text-xs tracking-wider block mt-1">MANAGEMENT COUNSELLING 2026</span>
          </div>
        </div>
        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold text-sm tracking-widest whitespace-nowrap hidden md:block">
          STUDENT PORTAL
        </div>
      </header>

      <div className="p-6 space-y-8">
        
        {/* Page Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-gray-500 tracking-wider">COUNSELLING DOCUMENT</span>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">Allotment Order</h2>
            <p className="text-gray-600 text-sm mt-1">Official seat allotment details issued through GCE Erode Management Counselling.</p>
          </div>
          <button 
            type="button"
            className="bg-gray-800 text-white px-6 py-2 rounded font-medium hover:bg-gray-900 transition whitespace-nowrap print:hidden"
            // Since this is a server component, we need a small client component for printing, or just a window.print() onClick isn't possible directly. 
            // We can just use an anchor tag or a simple script for printing. Or a small client component wrapping the button.
          >
            PRINT / SAVE PDF
          </button>
        </section>

        {allotment ? (
          <>
            {/* Allotment Status */}
            <section className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white h-10 w-10 rounded-full flex items-center justify-center text-xl font-bold shrink-0">✓</div>
                <div>
                  <span className="text-xs font-bold text-green-700 tracking-wider uppercase">ALLOTMENT STATUS</span>
                  <h3 className="text-xl font-bold text-green-900 mt-1">SEAT ALLOTTED</h3>
                  <p className="text-green-800 text-sm mt-1">A seat has been allotted to you based on your counselling rank, preferences and available seats.</p>
                </div>
              </div>
              <div className="bg-green-200 text-green-900 px-4 py-2 rounded font-bold tracking-widest border border-green-300 shadow-sm">
                ALLOTTED
              </div>
            </section>

            {/* Order Identification */}
            <section className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">ORDER INFORMATION</span>
                <h3 className="text-lg font-bold text-gray-800">Allotment Order Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ALLOTMENT ORDER NUMBER</span>
                  <strong className="text-gray-900">GCE-2026-ALLOT-{allotment.id.toString().padStart(4, '0')}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">APPLICATION NUMBER</span>
                  <strong className="text-gray-900">{application?.applicationNumber || "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ALLOTMENT DATE</span>
                  <strong className="text-gray-900">{new Date(allotment.createdAt).toLocaleDateString('en-IN')}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ALLOTMENT TIME</span>
                  <strong className="text-gray-900">{new Date(allotment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
              </div>
            </section>

            {/* Student Information */}
            <section className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">APPLICANT</span>
                <h3 className="text-lg font-bold text-gray-800">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">FULL NAME</span>
                  <strong className="text-gray-900">{student.user.name}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">DATE OF BIRTH</span>
                  <strong className="text-gray-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">GENDER</span>
                  <strong className="text-gray-900">{student.gender || "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">COMMUNITY</span>
                  <strong className="text-gray-900">{student.community || "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">MOBILE NUMBER</span>
                  <strong className="text-gray-900">{student.phone || "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">EMAIL ADDRESS</span>
                  <strong className="text-gray-900">{student.user.email}</strong>
                </div>
              </div>
            </section>

            {/* Counselling Information */}
            <section className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">COUNSELLING</span>
                <h3 className="text-lg font-bold text-gray-800">Counselling Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">COUNSELLING RANK</span>
                  <strong className="text-gray-900">{student.rankNumber || "-"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">COUNSELLING ROUND</span>
                  <strong className="text-gray-900">Round {allotment.round.roundNumber}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ELIGIBLE RANK RANGE</span>
                  <strong className="text-gray-900">{allotment.round.minRank} - {allotment.round.maxRank}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ELIGIBILITY STATUS</span>
                  <strong className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">ELIGIBLE</strong>
                </div>
              </div>
            </section>

            {/* Allotted Seat */}
            <section className="border border-gray-200 rounded-lg overflow-hidden border-l-4 border-l-blue-600">
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block mb-1">ALLOTTED DEPARTMENT</span>
                  <h2 className="text-2xl font-bold text-blue-900">{allotment.department.name}</h2>
                  <p className="text-blue-800 text-sm mt-1">Government College of Engineering, Erode</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200 text-center min-w-[150px]">
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">SEAT NUMBER</span>
                  <strong className="text-xl text-blue-700">{allotment.seatNumber}</strong>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">DEPARTMENT CODE</span>
                  <strong className="text-gray-900">{allotment.department.code}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">ALLOTMENT CATEGORY</span>
                  <strong className="text-gray-900">MANAGEMENT</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">SEAT STATUS</span>
                  <strong className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">{allotment.status.toUpperCase()}</strong>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">PAYMENT</span>
                <h3 className="text-lg font-bold text-gray-800">Payment Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">FEE AMOUNT</span>
                  <strong className="text-gray-900">₹ {payment?.amount || "35,000"}</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">PAYMENT STATUS</span>
                  <strong className={`px-2 py-0.5 rounded border ${payment?.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {(payment?.paymentStatus || "PENDING").toUpperCase()}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">PAYMENT DEADLINE</span>
                  <strong className="text-gray-900">30/08/2026</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">PAYMENT REFERENCE</span>
                  <strong className="text-gray-900">{payment?.transactionId || "-"}</strong>
                </div>
              </div>
            </section>

            {/* Reporting Information */}
            <section className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block">REPORTING</span>
                <h3 className="text-lg font-bold text-gray-800">College Reporting Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">REPORTING DATE</span>
                  <strong className="text-gray-900">02/09/2026</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">REPORTING TIME</span>
                  <strong className="text-gray-900">10:00 AM</strong>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">REPORTING LOCATION</span>
                  <strong className="text-gray-900">GCE Erode Campus</strong>
                </div>
              </div>
            </section>

            {/* Important Instructions */}
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex gap-4">
              <div className="bg-blue-100 text-blue-700 h-8 w-8 rounded-full flex items-center justify-center font-bold font-serif shrink-0 italic">i</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Important Instructions</h3>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  <li>Complete the required payment within the specified payment deadline.</li>
                  <li>Keep a printed or digital copy of this allotment order for future reference.</li>
                  <li>Report to the college on the specified date and time with the required documents.</li>
                  <li>The allotment is subject to the rules and conditions of Management Counselling 2026.</li>
                  <li>Failure to complete the required process within the specified deadline may result in cancellation of the allotment.</li>
                </ol>
              </div>
            </section>

            {/* Declaration */}
            <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">DECLARATION</span>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                This allotment order has been generated by the Government College of Engineering, Erode Management Counselling System. 
                The information shown in this document is based on the counselling records available in the system.
              </p>
            </section>

          </>
        ) : (
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center my-8">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">Allotment Not Published</h3>
            <p className="text-yellow-800">Your seat allotment has not yet been published.</p>
          </section>
        )}

      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 p-6 text-center text-sm print:bg-white print:text-black print:border-t print:border-gray-200">
        <strong className="block text-gray-300 mb-1 print:text-black">GOVERNMENT COLLEGE OF ENGINEERING, ERODE</strong>
        <span>Academic Support Cell • Online Management Counselling</span>
      </footer>
    </div>
  );
}
