import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer" id="help">
      <div className="container footer-grid">
        <div><Logo /><p>Guiding your journey from application to admission at Government College of Engineering, Erode.</p></div>
        <div><h3>Quick links</h3><a href="#process">How it works</a><a href="#programmes">Programmes</a><a href="#register">Start application</a></div>
        <div><h3>Need assistance?</h3><a href="tel:+914242252222">+91 424 225 2222</a><a href="mailto:counselling@gceerode.ac.in">counselling@gceerode.ac.in</a><span>Mon–Fri · 9:30 AM–5:30 PM</span></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Government College of Engineering, Erode</span><span>Frontend demonstration portal</span></div>
    </footer>
  );
}
