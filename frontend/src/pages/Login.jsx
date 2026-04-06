import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, KeyRound, ArrowRight, BookOpen, Users, Star } from 'lucide-react';

const ROLES = ['student', 'tutor', 'admin'];

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Welcome back!');
      navigate(`/${res.data.user.role}/dashboard`);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
          background: 'linear-gradient(160deg, #064E3B 0%, #047857 50%, #10B981 100%)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }}></div>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }}></div>

        <div className="animate-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)' }}>
            <GraduationCap size={34} color="white" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '1rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800, lineHeight: 1.2 }}>
            Welcome Back to TutorBook
          </h1>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 380 }}>
            Continue your learning journey. Access expert tutors and take your skills to the next level.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: Users, val: '500+', label: 'Expert Tutors' },
              { icon: BookOpen, val: '10k+', label: 'Sessions Done' },
              { icon: Star, val: '4.9★', label: 'Avg Rating' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '0.875rem 1.25rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)', minWidth: 110 }}>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Poppins,sans-serif' }}>{s.val}</p>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.75rem', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="animate-in" style={{ width: '100%', maxWidth: 440 }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Sign In</h2>
              <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: '0.9rem' }}>Enter your credentials to continue</p>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', background: 'rgb(var(--muted))', borderRadius: 12, padding: 4, marginBottom: '1.5rem' }}>
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 9, fontSize: '0.8125rem',
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

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--muted-foreground))' }} />
                  <input
                    type="password" required className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading} className="btn-primary"
                style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '0.9375rem', width: '100%' }}
              >
                {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgb(var(--muted-foreground))' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#10B981', fontWeight: 700, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
