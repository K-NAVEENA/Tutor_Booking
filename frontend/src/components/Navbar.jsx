import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(var(--card), 0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgb(var(--border))',
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow"
              style={{ background: 'linear-gradient(135deg,#10B981,#047857)' }}
            >
              <GraduationCap size={18} />
            </div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              Tutor<span style={{ color: '#10B981' }}>Book</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="/" onClick={e => { e.preventDefault(); scrollTo('hero'); }} className="nav-link">Home</a>
            <a href="#tutors" onClick={e => { e.preventDefault(); scrollTo('tutors'); }} className="nav-link">Tutors</a>
            <a href="#contact" onClick={e => { e.preventDefault(); scrollTo('contact'); }} className="nav-link">Contact</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                border: '1.5px solid rgb(var(--border))',
                color: 'rgb(var(--foreground))',
                background: 'transparent',
                cursor: 'pointer'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Notification Bell (only when logged in) */}
            {token && <NotificationBell />}

            {token ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.45rem 0.75rem' }}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8125rem' }}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8125rem' }}>
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ border: '1.5px solid rgb(var(--border))', cursor: 'pointer', background: 'transparent', color: 'rgb(var(--foreground))' }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 animate-fade">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Tutors', id: 'tutors' },
              { label: 'Contact', id: 'contact' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                style={{ color: 'rgb(var(--foreground))' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 px-4 pt-3 border-t border-border mt-2">
              {token ? (
                <>
                  <Link to={`/${user?.role}/dashboard`} className="btn-secondary flex-1 text-center" style={{ padding: '0.6rem', fontSize: '0.8rem' }}>Dashboard</Link>
                  <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.6rem 1rem' }}><LogOut size={15} /></button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline flex-1 text-center" style={{ padding: '0.6rem', fontSize: '0.8rem' }}>Login</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center" style={{ padding: '0.6rem', fontSize: '0.8rem' }}>Join Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
