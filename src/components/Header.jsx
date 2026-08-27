import { useState } from 'react';
import Logo from './Logo';

const navItems = ['Home', 'About', 'Process', 'Programmes', 'Help'];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          <span /> <span /> <span />
        </button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          {navItems.map((item) => <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>)}
          <a href="#counselling">Counselling status</a>
          <a className="nav-login" href="#student-login">Student Login</a>
          <a className="button button-primary nav-apply" href="#register">Apply Now <span>→</span></a>
        </nav>
      </div>
    </header>
  );
}
