import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, KeyRound, User, Phone, ArrowRight } from 'lucide-react';
import API_URL from "../services/api";
const ROLES = ['student', 'tutor'];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = new URLSearchParams(location.search).get('role') || 'student';

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: initialRole, phoneNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4rem)', background: 'rgb(var(--background))' }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%', flexDirection: 'column', justifyContent: 'center', padding: '4rem',
          background: 'linear-gradient(160deg, #047857 0%, #10B981 60%, #6EE7B7 100%)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -100, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }}></div>
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }}></div>

        <div className="animate-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)' }}>
            <GraduationCap size={34} color="white" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.5rem)', marginBottom: '1rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800, lineHeight: 1.2 }}>
            Join TutorBook Today
          </h1>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380 }}>
            Sign up as a student to find your perfect tutor, or join as a tutor and start earning by sharing your expertise.
          </p>

          {/* Role benefit cards */}
          {[
            { role: 'Student', desc: 'Access 500+ verified tutors across every subject.' },
            { role: 'Tutor',   desc: 'Set your own schedule and rates. Earn doing what you love.' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '0.875rem 1.25rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)', marginBottom: '0.75rem' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{c.role}</p>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.8125rem' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <div className="animate-in" style={{ width: '100%', maxWidth: 440 }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Create Account</h2>
              <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: '0.9rem' }}>Join the marketplace in seconds</p>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', background: 'rgb(var(--muted))', borderRadius: 12, padding: 4, marginBottom: '1.5rem' }}>
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 9, fontSize: '0.8rem',
                    fontWeight: formData.role === role ? 700 : 500,
                    fontFamily: 'inherit', cursor: 'pointer',
                    background: formData.role === role ? 'linear-gradient(135deg,#10B981,#047857)' : 'transparent',
                    color: formData.role === role ? '#fff' : 'rgb(var(--muted-foreground))',
                    border: 'none', textTransform: 'capitalize',
                    transition: 'all .2s',
                    boxShadow: formData.role === role ? '0 2px 8px rgba(16,185,129,.3)' : 'none'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--muted-foreground))' }} />
                  <input
                    type="text" required className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--muted-foreground))' }} />
                  <input
                    type="email" required className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--muted-foreground))' }} />
                  <input
                    type="tel" required className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="+1 234 567 8900"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--muted-foreground))' }} />
                  <input
                    type="password" required className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading} className="btn-primary"
                style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '0.9375rem', width: '100%' }}
              >
                {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgb(var(--muted-foreground))' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
