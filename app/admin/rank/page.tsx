import prisma from "@/lib/prisma";
import RankClient from "./RankClient";

export const metadata = {
  title: "Admin Rank - GCE Erode",
};

export const dynamic = "force-dynamic";

export default async function AdminRankPage() {
  const students = await prisma.student.findMany({
    orderBy: { rankNumber: 'asc' },
    include: {
      user: true,
      applications: true,
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
          Administration
        </span>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Student Rank Management
        </h2>
        <p className="mt-4 text-slate-600 max-w-2xl">
          Enter details from the received hardcopy applications, verify documents and generate counselling ranks automatically.
        </p>
      </section>

      <RankClient initialStudents={students} />
    </div>
  );
}
