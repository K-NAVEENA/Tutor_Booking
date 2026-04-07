import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  BookOpen, CheckCircle2, Calendar, Star, ArrowRight,
  Search, Users, Shield, Send, MapPin, Phone, Mail
} from 'lucide-react';
import API_URL from "../services/api";
// Mock tutor preview data (shown before login)
const PREVIEW_TUTORS = [
  { name: 'Dr. Sarah Chen', subject: 'Advanced Mathematics', rating: 4.9, price: 55, exp: 8 },
  { name: 'James Okafor', subject: 'Physics & Chemistry', rating: 4.8, price: 45, exp: 6 },
  { name: 'Priya Sharma', subject: 'English Literature', rating: 4.9, price: 40, exp: 5 },
  { name: 'Marcus Lee', subject: 'Computer Science', rating: 5.0, price: 60, exp: 10 },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Easy Tutor Booking',
    desc: 'Browse, filter, and book verified tutors in just a few clicks. Seamless scheduling at your fingertips.',
    color: '#10B981', bg: 'rgba(16,185,129,.1)',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Tutors',
    desc: 'Every tutor goes through a rigorous background check and qualification review before joining.',
    color: '#047857', bg: 'rgba(4,120,87,.1)',
  },
  {
    icon: Calendar,
    title: 'Flexible Learning',
    desc: 'Schedule sessions around your lifestyle. Reschedule anytime, learn at your own pace.',
    color: '#6EE7B7', bg: 'rgba(110,231,183,.2)',
  },
];

const LandingPage = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/contact`, contactForm);
      toast.success('Message sent! Our admin will review it.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section id="hero" className="hero-gradient" style={{ padding: '6rem 0 5rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 880 }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-in"
            style={{ background: 'rgba(16,185,129,.12)', color: '#10B981', border: '1px solid rgba(16,185,129,.2)' }}
          >
            <Star size={14} fill="currentColor" /> Top-Rated Education Platform
          </div>

          <h1
            className="animate-in"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', marginBottom: '1.25rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800, letterSpacing: '-0.03em', animationDelay: '0.05s' }}
          >
            Tutor Booking{' '}
            <span className="text-gradient">Marketplace</span>
          </h1>

          <p
            className="animate-in"
            style={{ fontSize: '1.15rem', color: 'rgb(var(--muted-foreground))', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 2.5rem', animationDelay: '0.1s' }}
          >
            Find expert tutors and book sessions easily. Personalised 1-on-1 learning that fits your schedule and budget.
          </p>

          <div className="animate-in" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.15s' }}>
            <Link to="/register?role=student" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Find Tutors <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=tutor" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Become a Tutor
            </Link>
          </div>

          {/* Hero Stats */}
          <div
            className="animate-in"
            style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap', animationDelay: '0.2s' }}
          >
            {[
              { val: '500+', label: 'Expert Tutors' },
              { val: '10k+', label: 'Sessions Booked' },
              { val: '4.9★', label: 'Avg. Rating' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', fontFamily: 'Poppins,sans-serif' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgb(var(--muted-foreground))', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '5rem 0', background: 'rgb(var(--card))' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Why Choose TutorBook?</h2>
            <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: '1.05rem' }}>
              Everything you need for a seamless tutoring experience.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ padding: '2rem' }}>
                <div
                  style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', transition: 'transform .2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <f.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>{f.title}</h3>
                <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>How It Works</h2>
            <p style={{ color: 'rgb(var(--muted-foreground))' }}>Start learning in 4 simple steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { step: 1, title: 'Create Account', desc: 'Sign up as a student in under 2 minutes.' },
              { step: 2, title: 'Search Tutors', desc: 'Filter by subject, price, and rating.' },
              { step: 3, title: 'Book Session', desc: 'Pick a time slot and confirm instantly.' },
              { step: 4, title: 'Start Learning', desc: 'Meet your tutor and reach your goals.' },
            ].map(s => (
              <div key={s.step} className="card card-hover" style={{ padding: '2rem 1.5rem' }}>
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,.12)',
                    color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem', fontWeight: 800, fontSize: '1.25rem',
                    fontFamily: 'Poppins,sans-serif', border: '2px solid rgba(16,185,129,.2)',
                    transition: 'background .2s, color .2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#10B981,#047857)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,.12)'; e.currentTarget.style.color = '#10B981'; }}
                >
                  {s.step}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '4rem', alignItems: 'start' }}>
            {/* Left */}
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Get In Touch</h2>
              <p style={{ color: 'rgb(var(--muted-foreground))', lineHeight: 1.7, marginBottom: '2rem' }}>
                Have questions? We're here to help you find the perfect tutor or answer any platform queries.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: Mail, text: 'support@tutorbook.com' },
                  { icon: Phone, text: '+1 (555) 123-4567' },
                  { icon: MapPin, text: 'San Francisco, CA 94103' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgb(var(--muted-foreground))', fontSize: '0.9rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={17} />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Send a Message</h3>
              <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Your Name</label>
                  <input className="input-field" placeholder="John Doe" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                  <input className="input-field" type="email" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Message</label>
                  <textarea className="input-field" style={{ minHeight: 120, resize: 'vertical' }} placeholder="How can we help you?" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required />
                </div>
                <button type="submit" disabled={sending} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgb(var(--border))', background: 'rgb(var(--card))', padding: '3rem 0 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 className="text-gradient" style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800 }}>TutorBook</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgb(var(--muted-foreground))', lineHeight: 1.7 }}>
                Empowering learners worldwide through expert 1-on-1 tutoring.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9rem' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['Find Tutors', 'How It Works', 'Pricing', 'Become a Tutor'].map(l => (
                  <Link key={l} to="/register" style={{ fontSize: '0.875rem', color: 'rgb(var(--muted-foreground))', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgb(var(--muted-foreground))'}>
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <a key={l} href="#contact" style={{ fontSize: '0.875rem', color: 'rgb(var(--muted-foreground))', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgb(var(--muted-foreground))'}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9rem' }}>Follow Us</h4>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {['tw', 'in', 'fb', 'yt'].map(s => (
                  <div key={s}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgb(var(--border))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: 700, color: 'rgb(var(--muted-foreground))', transition: 'all .2s',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#10B981,#047857)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgb(var(--muted-foreground))'; e.currentTarget.style.borderColor = 'rgb(var(--border))'; }}
                  >{s}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgb(var(--border))', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'rgb(var(--muted-foreground))' }}>
            &copy; {new Date().getFullYear()} TutorBook Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
