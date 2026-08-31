"use client";

import { useState } from "react";
import { CounsellingInfo } from "@/lib/info";
import { saveCounsellingInfo } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditForm({ initialInfo }: { initialInfo: CounsellingInfo }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const info: CounsellingInfo = {
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      announcement: formData.get("announcement") as string,
      documents: formData.get("documents") as string,
      guidelines: formData.get("guidelines") as string,
    };

    try {
      await saveCounsellingInfo(info);
      alert("Information saved successfully!");
      router.push("/counsellor/info");
    } catch (error) {
      alert("Failed to save information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Counselling Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" defaultValue={initialInfo.date} className="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="text" name="time" defaultValue={initialInfo.time} placeholder="Example: 10:00 AM - 4:00 PM" className="w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Announcement</h2>
        <textarea name="announcement" rows={4} defaultValue={initialInfo.announcement} placeholder="Enter counselling announcement..." className="w-full border border-gray-300 rounded-md p-2"></textarea>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Required Documents</h2>
        <textarea name="documents" rows={6} defaultValue={initialInfo.documents} placeholder="Enter required documents..." className="w-full border border-gray-300 rounded-md p-2"></textarea>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Guidelines</h2>
        <textarea name="guidelines" rows={6} defaultValue={initialInfo.guidelines} placeholder="Enter counselling guidelines..." className="w-full border border-gray-300 rounded-md p-2"></textarea>
      </section>

      <div className="flex justify-end gap-4">
        <Link href="/counsellor/info" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md transition">
          Cancel
        </Link>
        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50 transition">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
