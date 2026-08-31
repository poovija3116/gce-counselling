import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login?role=admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Admin Portal</h1>
            <p className="text-sm text-blue-200">GCE Erode Counselling</p>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/admin/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
            <Link href="/admin/rank" className="hover:text-blue-200 transition">Rank Generation</Link>
            <Link href="/admin/student-monitoring" className="hover:text-blue-200 transition">Student Monitoring</Link>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button type="submit" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm transition border border-blue-500">
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
