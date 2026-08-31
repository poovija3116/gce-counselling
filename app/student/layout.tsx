import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "student") {
    redirect("/login?role=student");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold">Student Portal</h1>
            <p className="text-sm text-blue-200">GCE Erode Counselling</p>
          </div>
          <nav className="flex gap-4 items-center flex-wrap">
            <Link href="/student/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
            <Link href="/student/application" className="hover:text-blue-200 transition">Application</Link>
            <Link href="/student/choice-filling" className="hover:text-blue-200 transition">Choice Filling</Link>
            <Link href="/student/seat-selection" className="hover:text-blue-200 transition">Seat Selection</Link>
            <Link href="/student/allotment-order" className="hover:text-blue-200 transition">Allotment Order</Link>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition shadow-sm">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-8 container mx-auto">
        {children}
      </main>
    </div>
  );
}
