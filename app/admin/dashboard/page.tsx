import Link from "next/link";
import { 
  BarChart3, 
  Settings, 
  FileText, 
  Users, 
  LayoutDashboard, 
  FileCheck, 
  ListOrdered,
  Megaphone
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - GCE Erode",
};

export default function AdminDashboard() {
  const adminActions = [
    {
      id: "01",
      title: "ADMIN RANK",
      description: "Manage student counselling rank",
      icon: <ListOrdered className="h-6 w-6" />,
      href: "/admin/rank",
    },
    {
      id: "02",
      title: "COUNSELLING DETAILS",
      description: "Update counselling information",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/counselling-edit",
    },
    {
      id: "03",
      title: "SEAT AVAILABILITY",
      description: "View branch-wise seat details",
      icon: <LayoutDashboard className="h-6 w-6" />,
      href: "/admin/seat-availability",
    },
    {
      id: "04",
      title: "STUDENT MANAGEMENT",
      description: "View and manage student records",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/student-monitoring",
    },
    {
      id: "05",
      title: "ANNOUNCEMENTS",
      description: "Create and manage announcements",
      icon: <Megaphone className="h-6 w-6" />,
      href: "/admin/announcements",
    },
    {
      id: "06",
      title: "DOCUMENT VERIFICATION",
      description: "Review student documents",
      icon: <FileCheck className="h-6 w-6" />,
      href: "/admin/document-verification",
    },
    {
      id: "07",
      title: "REPORTS",
      description: "View counselling reports",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/admin/reports",
    },
    {
      id: "08",
      title: "SETTINGS",
      description: "Manage system settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
          Administration & Control Centre
        </span>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Management Counselling 2026
        </h2>
        <p className="mt-4 text-slate-600 max-w-2xl">
          Manage student information, counselling activities, and seat availability.
        </p>
      </section>

      {/* Admin Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="group relative flex flex-col bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
          >
            <div className="absolute top-6 right-6 text-slate-300 group-hover:text-blue-500 transition-colors">
              <span className="font-mono text-xl font-bold opacity-50">{action.id}</span>
            </div>
            
            <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {action.icon}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {action.title}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 flex-grow">
              {action.description}
            </p>

            <div className="flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage <span aria-hidden="true" className="ml-1">&rarr;</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
