import prisma from "@/lib/prisma"
import Link from "next/link"
import { auth } from "@/auth"
import { Fragment } from "react"

const COMMUNITY_TOTALS: Record<string, number> = {
  OC: 3,
  BC: 6,
  BCM: 2,
  SC: 5,
  ST: 3,
  SCA: 2
};

const CATEGORIES = ["OC", "BC", "BCM", "SC", "ST", "SCA"];

export default async function Home() {
  const session = await auth();

  // Fetch departments and allotments
  const departments = await prisma.department.findMany({
    orderBy: { id: 'asc' }
  });

  const allotments = await prisma.allotment.findMany({
    where: {
      status: { in: ['allotted', 'payment_pending', 'confirmed'] }
    },
    include: {
      student: true
    }
  });

  // Calculate occupancy
  const occupancyMap: Record<number, Record<string, number>> = {};
  
  departments.forEach(dept => {
    occupancyMap[dept.id] = {};
    CATEGORIES.forEach(cat => {
      occupancyMap[dept.id][cat] = 0;
    });
  });

  allotments.forEach(allotment => {
    const deptId = allotment.departmentId;
    const community = allotment.student.community;
    if (community && occupancyMap[deptId]?.[community] !== undefined) {
      occupancyMap[deptId][community]++;
    }
  });

  // Calculate row data
  const tableData = departments.map(dept => {
    let rowTotal = 0;
    let rowOccupied = 0;
    let rowVacancy = 0;

    const categoriesData = CATEGORIES.map(cat => {
      const total = COMMUNITY_TOTALS[cat] || 0;
      const occupied = occupancyMap[dept.id][cat] || 0;
      const vacancy = total - occupied;

      rowTotal += total;
      rowOccupied += occupied;
      rowVacancy += vacancy;

      return { cat, total, occupied, vacancy };
    });

    return {
      dept,
      categoriesData,
      rowTotal,
      rowOccupied,
      rowVacancy
    };
  });

  // Calculate grand totals
  const grandTotals = {
    total: 0,
    occupied: 0,
    vacancy: 0,
    categories: CATEGORIES.reduce((acc, cat) => ({
      ...acc,
      [cat]: { total: 0, occupied: 0, vacancy: 0 }
    }), {} as Record<string, { total: number; occupied: number; vacancy: number }>)
  };

  tableData.forEach(row => {
    grandTotals.total += row.rowTotal;
    grandTotals.occupied += row.rowOccupied;
    grandTotals.vacancy += row.rowVacancy;

    row.categoriesData.forEach(catData => {
      grandTotals.categories[catData.cat].total += catData.total;
      grandTotals.categories[catData.cat].occupied += catData.occupied;
      grandTotals.categories[catData.cat].vacancy += catData.vacancy;
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-blue-900 text-white p-6 text-center shadow-md">
        <h1 className="text-2xl font-bold mb-2">GOVERNMENT COLLEGE OF ENGINEERING, ERODE-638316</h1>
        <h2 className="text-xl mb-4">ACADEMIC SUPPORT CELL</h2>
        <div className="bg-blue-800 py-2 font-semibold tracking-wide">
          ONLINE COUNSELLING – SEAT AVAILABILITY
        </div>
        
        <div className="mt-4 flex justify-center gap-4">
          {!session ? (
            <>
              <Link href="/login?role=student" className="bg-white text-blue-900 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">Student Login</Link>
              <Link href="/login?role=admin" className="bg-blue-700 text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition border border-blue-500">Admin Login</Link>
              <Link href="/login?role=counsellor" className="bg-blue-700 text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition border border-blue-500">Counsellor Login</Link>
            </>
          ) : (
            <Link href={`/${session.user.role}/dashboard`} className="bg-white text-blue-900 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
              Go to Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <section className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">BRANCH-WISE COMMUNITY SEAT DETAILS</h2>
          <p className="text-gray-600">Seat Availability, Occupied Seats and Vacancy Status</p>
        </section>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-gray-300 p-2 text-left w-32 sticky left-0 bg-gray-100 z-10">BRANCH</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} colSpan={3} className="border border-gray-300 p-2 text-center text-blue-900">{cat}</th>
                ))}
                <th colSpan={3} className="border border-gray-300 p-2 text-center bg-blue-50 text-blue-900">TOTAL</th>
              </tr>
              <tr className="bg-gray-50 text-xs text-gray-600">
                {CATEGORIES.map(cat => (
                  <Fragment key={cat}>
                    <th className="border border-gray-300 p-2 text-center font-medium">TOTAL</th>
                    <th className="border border-gray-300 p-2 text-center font-medium text-red-600">OCCUPIED</th>
                    <th className="border border-gray-300 p-2 text-center font-medium text-green-600">VACANCY</th>
                  </Fragment>
                ))}
                <th className="border border-gray-300 p-2 text-center font-medium bg-blue-50">TOTAL</th>
                <th className="border border-gray-300 p-2 text-center font-medium bg-blue-50 text-red-600">OCCUPIED</th>
                <th className="border border-gray-300 p-2 text-center font-medium bg-blue-50 text-green-600">VACANCY</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr key={row.dept.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-300 p-2 font-semibold sticky left-0 bg-white group-hover:bg-gray-50 z-10">{row.dept.code}</td>
                  
                  {row.categoriesData.map(catData => (
                    <Fragment key={catData.cat}>
                      <td className="border border-gray-300 p-2 text-center">{catData.total}</td>
                      <td className="border border-gray-300 p-2 text-center text-red-600 font-medium">{catData.occupied}</td>
                      <td className="border border-gray-300 p-2 text-center text-green-600 font-medium">{catData.vacancy}</td>
                    </Fragment>
                  ))}
                  
                  <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">{row.rowTotal}</td>
                  <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50 text-red-600">{row.rowOccupied}</td>
                  <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50 text-green-600">{row.rowVacancy}</td>
                </tr>
              ))}
              
              <tr className="bg-gray-800 text-white font-bold">
                <td className="border border-gray-700 p-2 sticky left-0 bg-gray-800 z-10">GRAND TOTAL</td>
                {CATEGORIES.map(cat => (
                  <Fragment key={cat}>
                    <td className="border border-gray-700 p-2 text-center">{grandTotals.categories[cat].total}</td>
                    <td className="border border-gray-700 p-2 text-center text-red-400">{grandTotals.categories[cat].occupied}</td>
                    <td className="border border-gray-700 p-2 text-center text-green-400">{grandTotals.categories[cat].vacancy}</td>
                  </Fragment>
                ))}
                <td className="border border-gray-700 p-2 text-center text-lg">{grandTotals.total}</td>
                <td className="border border-gray-700 p-2 text-center text-lg text-red-400">{grandTotals.occupied}</td>
                <td className="border border-gray-700 p-2 text-center text-lg text-green-400">{grandTotals.vacancy}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
