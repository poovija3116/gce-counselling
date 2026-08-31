import prisma from "@/lib/prisma";
import MonitoringClient from "./MonitoringClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Student Allotment Monitoring - GCE Erode",
};

export const dynamic = "force-dynamic";

export default async function StudentMonitoringPage() {
  const students = await prisma.student.findMany({
    orderBy: { rankNumber: 'asc' },
    include: {
      user: true,
      applications: true,
      allotments: {
        include: {
          department: true,
          payments: true,
        }
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <div>
          <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
            Administration & Control Centre
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Student Allotment Monitoring
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            View counselling students, department allotment, seat status and payment status.
          </p>
        </div>
      </div>

      <MonitoringClient initialStudents={students} />

      <div className="pt-6">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
