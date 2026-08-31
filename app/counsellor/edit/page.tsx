import { getCounsellingInfo } from "@/lib/info";
import EditForm from "./EditForm";

export default async function CounsellingEditPage() {
  const info = await getCounsellingInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">GOVERNMENT COLLEGE OF ENGINEERING, ERODE-638316</h1>
        <h2 className="text-lg font-semibold text-gray-600 mt-1">ACADEMIC SUPPORT CELL</h2>
        <div className="mt-4 inline-block bg-green-100 text-green-800 text-sm font-bold tracking-widest px-3 py-1 rounded">
          MANAGE COUNSELLING DETAILS
        </div>
      </header>

      <EditForm initialInfo={info} />
    </div>
  );
}
