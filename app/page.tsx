import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
              LOGO
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-tight">GCE ERODE</h1>
              <p className="text-xs text-gray-600">Government College of Engineering, Erode-638316</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition">How It Works</a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition">FAQ</a>
            <Link href="/seat-availability" className="text-gray-700 hover:text-blue-600 font-medium transition">Seat Availability</Link>
            
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-sm">
              Login
            </Link>
          </nav>
        </div>

        <div className="bg-blue-900 text-white flex text-sm overflow-hidden border-t border-blue-800">
          <div className="bg-orange-500 px-4 py-2 font-bold whitespace-nowrap z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
            📢 ANNOUNCEMENT
          </div>
          <div className="py-2 flex-grow overflow-hidden relative">
            <div className="whitespace-nowrap px-4">
              Welcome to GCE Erode Management Counselling 2026. Online registration is now open!
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section id="home" className="bg-gradient-to-br from-blue-50 to-white py-20 border-b border-gray-200">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
              Management Quota <br className="hidden md:block"/> Online Counselling
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              A transparent, efficient, and fair seat allocation system for students seeking admission under the management quota.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login?role=student" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg text-lg">
                Register / Login
              </Link>
              <Link href="/seat-availability" className="bg-white hover:bg-gray-50 text-blue-800 border-2 border-blue-600 px-8 py-3 rounded-lg font-bold transition shadow text-lg">
                View Seat Matrix
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Registration", desc: "Register online with your details and marks." },
                { step: "02", title: "Rank Generation", desc: "Admins verify and generate the rank list based on cutoff." },
                { step: "03", title: "Choice Filling", desc: "Select your preferred departments when the round starts." },
                { step: "04", title: "Allotment", desc: "Seats are allotted based on rank and preference." }
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <div className="container mx-auto px-4">
          <p>© 2026 Government College of Engineering, Erode. All Rights Reserved.</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <Link href="/login?role=admin" className="hover:text-white transition">Admin Portal</Link>
            <span>|</span>
            <Link href="/login?role=counsellor" className="hover:text-white transition">Counsellor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
