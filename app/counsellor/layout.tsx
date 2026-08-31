import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function CounsellorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "counsellor") {
    redirect("/login?role=counsellor");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Counsellor Portal</h1>
            <p className="text-sm text-green-200">GCE Erode Counselling</p>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/counsellor/dashboard" className="hover:text-green-200 transition">Dashboard</Link>
            <Link href="/counsellor/round-management" className="hover:text-green-200 transition">Round Management</Link>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}>
              <button type="submit" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-sm transition border border-green-500">
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
