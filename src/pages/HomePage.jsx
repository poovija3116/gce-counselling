import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';

const processSteps = [
  ['01', 'Register online', 'Create your profile and submit your application details.'],
  ['02', 'Upload documents', 'Share your certificates securely for verification.'],
  ['03', 'Choose preferences', 'Arrange departments in the order you prefer.'],
  ['04', 'Confirm admission', 'Accept your allotted seat and complete the fee payment.'],
];

const departments = [
  ['Computer Science & Engineering', '120 seats', 'CSE'],
  ['Electronics & Communication', '90 seats', 'ECE'],
  ['Mechanical Engineering', '60 seats', 'ME'],
  ['Civil Engineering', '60 seats', 'CE'],
];

function ArrowIcon() { return <span aria-hidden="true">→</span>; }

export default function HomePage() {
  return (
    <div id="top">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow light">GCE ERODE · ADMISSIONS 2026</p>
              <h1>Your future in engineering starts <em>here.</em></h1>
              <p className="hero-text">A simple, transparent way to apply, choose your course preferences, and secure your seat at Government College of Engineering, Erode.</p>
              <div className="hero-actions"><a className="button button-accent" href="#register">Start your application <ArrowIcon /></a><a className="text-link" href="#process">How counselling works <ArrowIcon /></a></div>
              <div className="hero-deadline"><span className="calendar-icon">▣</span><span><strong>Applications close 30 June 2026</strong><small>Start early to avoid last-minute delays.</small></span></div>
            </div>
            <div className="hero-visual" aria-label="Counselling portal dashboard preview">
              <div className="dashboard-card">
                <div className="card-top"><span className="mini-logo">G</span><span className="card-dots">•••</span></div>
                <p className="dash-greeting">Good morning,</p><h3>Welcome back, Ananya</h3>
                <div className="application-progress"><div className="progress-heading"><span>Application progress</span><strong>75%</strong></div><div className="progress-track"><span /></div><div className="progress-labels"><span>Started</span><span>Submitted</span></div></div>
                <div className="next-step"><span className="step-icon">↗</span><div><small>YOUR NEXT STEP</small><strong>Set course preferences</strong><span>Due by 24 June 2026</span></div><ArrowIcon /></div>
              </div>
              <div className="floating-card"><span className="check-icon">✓</span><div><strong>Documents verified</strong><small>All required certificates approved</small></div></div>
            </div>
          </div>
        </section>

        <section className="trust-bar" aria-label="Portal highlights"><div className="container trust-items"><p><strong>100%</strong><span>Online application</span></p><i /><p><strong>4</strong><span>UG programmes</span></p><i /><p><strong>Simple</strong><span>step-by-step process</span></p><i /><p><strong>Secure</strong><span>document handling</span></p></div></section>

        <section className="section intro" id="about"><div className="container intro-grid"><SectionHeading eyebrow="WELCOME TO GCE ERODE" title={<>Made for a clearer<br />admission journey.</>}>From registration to allotment, everything you need is brought together in one place — with clear updates at every step.</SectionHeading><div className="intro-points"><div><span>01</span><p><strong>Know where you stand</strong>Track your application and counselling status in real time.</p></div><div><span>02</span><p><strong>Make confident choices</strong>Explore programmes and seat availability before setting preferences.</p></div></div></div></section>

        <section className="section process-section" id="process"><div className="container"><SectionHeading eyebrow="THE PROCESS" title="Four steps. One destination.">We have made the counselling experience easy to follow, from your first application to your confirmed admission.</SectionHeading><div className="process-grid">{processSteps.map(([number, title, text]) => <article className="process-card" key={number}><span className="step-number">{number}</span><span className="process-icon">{number === '01' ? '◌' : number === '02' ? '↥' : number === '03' ? '≡' : '✓'}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section className="section programmes-section" id="programmes"><div className="container programmes-layout"><div><SectionHeading eyebrow="EXPLORE PROGRAMMES" title="Find the right course for you.">Discover undergraduate programmes that prepare you for meaningful engineering careers.</SectionHeading><a className="button button-outline" href="#counselling">View counselling status <ArrowIcon /></a></div><div className="department-list">{departments.map(([name, seats, initials]) => <article className="department-row" key={initials}><span className="dept-icon">{initials}</span><div><h3>{name}</h3><p><span className="available-dot" /> {seats} available for counselling</p></div><a href="#counselling" aria-label={`View ${name}`}><ArrowIcon /></a></article>)}</div></div></section>

        <section className="cta-section" id="register"><div className="container cta-inner"><div><p className="eyebrow light">READY WHEN YOU ARE</p><h2>Take the first step<br />towards GCE Erode.</h2></div><div><p>Begin your application today. It only takes a few minutes to get started.</p><a className="button button-accent" href="#student-registration">Create student account <ArrowIcon /></a></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
