import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BookOpen, Calendar, Settings, Clock, Users, X, Check, DollarSign, ArrowUpRight, Home, Star, MessageSquare, LogOut, Menu, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:5000/api';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <Star size={24} className={n <= value ? 'star-active fill-current' : 'star-inactive'} />
      </button>
    ))}
  </div>
);

const FeedbackModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ studentId: booking.studentId._id, rating, comment });
      toast.success('Feedback submitted!');
      onClose();
    } catch { toast.error('Failed to submit'); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-in">
        <h2 className="text-xl font-bold mb-1">Rate This Student</h2>
        <p className="text-muted-foreground text-sm mb-6">Student: <span className="font-semibold text-foreground">{booking.studentId?.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="text-sm font-semibold block mb-2">Rating</label><StarRating value={rating} onChange={setRating} /></div>
          <div><label className="text-sm font-semibold block mb-2">Comment</label>
            <textarea className="input-field min-h-[100px] resize-none" placeholder="Comment on the student's engagement and effort..." value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({ subjects: '', experience: 0, price: 0, description: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ course: '', date: '', timeSlot: '' });

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API}/tutor/slots`, { headers });
      setSlots(res.data);
    } catch { toast.error('Failed to load slots'); }
  };

  const fetchData = async () => {
    try {
      const [bookingsRes, tutorsRes] = await Promise.all([
        axios.get(`${API}/tutor/bookings`, { headers }),
        axios.get(`${API}/tutors`)
      ]);
      setBookings(bookingsRes.data);
      const me = tutorsRes.data.find(t => t._id === user.id);
      if (me?.profile) {
        setProfile({
          subjects: me.profile.subjects?.join(', ') || '',
          experience: me.profile.experience || 0,
          price: me.profile.price || 0,
          description: me.profile.description || ''
        });
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); fetchSlots(); }, []);

  const handleAction = async (id, action) => {
    try {
      const statusAction = action === 'approve' ? 'approved' : 'rejected';
      await axios.put(`${API}/tutor/booking/${id}/${statusAction}`, {}, { headers });
      toast.success(`Booking ${action}ed`);
      fetchData();
      fetchSlots();
    } catch { toast.error(`Failed to ${action}`); }
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tutor/slots`, newSlot, { headers });
      toast.success('Slot added');
      setNewSlot({ course: '', date: '', timeSlot: '' });
      fetchSlots();
    } catch { toast.error('Failed to add slot'); }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await axios.delete(`${API}/tutor/slots/${id}`, { headers });
      toast.success('Slot deleted');
      fetchSlots();
    } catch { toast.error('Check if slot is booked before deleting'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/tutor/profile`, {
        ...profile, subjects: profile.subjects.split(',').map(s => s.trim()).filter(Boolean)
      }, { headers });
      toast.success('Profile updated!');
      fetchData();
    } catch { toast.error('Failed to update profile'); }
  };

  const handleSubmitFeedback = async ({ studentId, rating, comment }) => {
    await axios.post(`${API}/tutor/feedback`, { studentId, rating, comment }, { headers });
  };

  const handleAdminRequest = async () => {
    try {
      await axios.post(`${API}/admin-request`, { email: user.email }, { headers });
      toast.success('Admin access request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  const pending = bookings.filter(b => b.status === 'pending');
  const approved = bookings.filter(b => b.status === 'approved');
  const uniqueStudents = Array.from(new Map(bookings.map(b => [b.studentId?._id, b.studentId])).values()).filter(Boolean);
  const totalEarnings = approved.length * Number(profile.price);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="spinner"></div></div>;

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Overview' },
    { id: 'requests', icon: Calendar, label: 'Booking Requests', badge: pending.length },
    { id: 'slots', icon: Clock, label: 'Manage Time Slots' },
    { id: 'students', icon: Users, label: 'My Students' },
    { id: 'feedback', icon: MessageSquare, label: 'Give Feedback' },
    { id: 'earnings', icon: DollarSign, label: 'Earnings' },
    { id: 'profile', icon: Settings, label: 'Profile Setup' },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {feedbackModal && (
        <FeedbackModal booking={feedbackModal} onClose={() => setFeedbackModal(null)} onSubmit={handleSubmitFeedback} />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-border">
          <div className="gradient-bg p-4 rounded-2xl text-white shadow-lg">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl mb-3">{user.name?.charAt(0)}</div>
            <p className="font-bold">{user.name}</p>
            <p className="text-white/70 text-xs capitalize">{user.role}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}>
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="sidebar-item w-full text-destructive hover:bg-destructive/10"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-background/50">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-muted rounded-xl text-muted-foreground"><Menu size={20} /></button>
            <h2 className="text-sm font-bold text-muted-foreground hidden sm:block uppercase tracking-wider">Tutor dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-px h-6 bg-border mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">VERIFIED TUTOR</p>
              </div>
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-sm">{user.name?.charAt(0)}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">

          {/* Overview */}
          {activeTab === 'dashboard' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Earnings', val: `$${totalEarnings}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Active Students', val: uniqueStudents.length, icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-100' },
                  { label: 'Sessions Done', val: approved.length, icon: Check, color: 'text-emerald-800', bg: 'bg-emerald-50' },
                  { label: 'Pending Requests', val: pending.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, i) => (
                  <div key={i} className="card p-6 flex flex-col justify-between">
                    <div className={`w-11 h-11 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}><s.icon size={22} /></div>
                    <div><p className="text-sm text-muted-foreground font-medium">{s.label}</p><p className="text-2xl font-bold mt-1">{s.val}</p></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-5">Pending Requests</h3>
                  {pending.length === 0 ? <p className="text-muted-foreground text-center py-6">No pending requests.</p> : (
                    <div className="space-y-3">
                      {pending.slice(0, 4).map(b => (
                        <div key={b._id} className="flex justify-between items-center p-4 bg-muted/40 rounded-xl">
                          <div className="flex gap-3 items-center">
                            <div className="w-9 h-9 gradient-bg rounded-lg text-white flex items-center justify-center font-bold text-sm">{b.studentId?.name?.charAt(0)}</div>
                            <div><p className="font-semibold text-sm">{b.studentId?.name}</p><p className="text-xs text-muted-foreground">{b.date}</p></div>
                          </div>
                          <button onClick={() => setActiveTab('requests')} className="p-2 border border-border rounded-xl hover:bg-muted"><ArrowUpRight size={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-5">Profile Completeness</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm font-semibold mb-2"><span>Setup Progress</span><span className="text-primary">80%</span></div>
                    <div className="w-full bg-muted rounded-full h-2.5"><div className="h-2.5 rounded-full gradient-bg" style={{ width: '80%' }}></div></div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">Complete your profile to appear higher in student searches and attract more bookings.</p>
                  <button onClick={() => setActiveTab('profile')} className="btn-secondary">Update Profile</button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Requests */}
          {activeTab === 'requests' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
              <p className="text-muted-foreground mb-8">Accept or decline incoming session requests.</p>
              {pending.length === 0 ? (
                <div className="card p-16 text-center text-muted-foreground"><Calendar className="mx-auto mb-4 opacity-30" size={48} /><p className="font-semibold">Inbox zero — no pending requests!</p></div>
              ) : (
                <div className="space-y-4">
                  {pending.map(b => (
                    <div key={b._id} className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 gradient-bg rounded-2xl text-white flex items-center justify-center font-bold text-2xl shadow">{b.studentId?.name?.charAt(0)}</div>
                        <div>
                          <h3 className="text-lg font-bold">{b.studentId?.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} />{b.date}</span>
                            <span className="flex items-center gap-1"><Clock size={14} />{b.timeSlot}</span>
                            <span className="flex items-center gap-1 text-emerald-600"><DollarSign size={14} />{profile.price}/session</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button onClick={() => handleAction(b._id, 'reject')} className="btn-danger flex items-center gap-1"><X size={15} /> Decline</button>
                        <button onClick={() => handleAction(b._id, 'approve')} className="btn-primary flex items-center gap-1"><Check size={15} /> Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {approved.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mt-10 mb-4">Booking History</h2>
                  <div className="card overflow-hidden">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Date & Time</th><th>Status</th></tr></thead>
                      <tbody>
                        {bookings.filter(b => b.status !== 'pending').map(b => (
                          <tr key={b._id}>
                            <td className="font-semibold">{b.studentId?.name}</td>
                            <td className="text-muted-foreground">{b.date} · {b.timeSlot}</td>
                            <td><span className={b.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Students */}
          {activeTab === 'students' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-2">My Students</h1>
              <p className="text-muted-foreground mb-6">All students you have taught or are currently teaching.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueStudents.map((s, i) => (
                  <div key={i} className="card p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 gradient-bg rounded-2xl text-white flex items-center justify-center font-bold text-2xl shadow mb-4">{s.name?.charAt(0)}</div>
                    <h3 className="font-bold mb-1">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{s.email}</p>
                    <button onClick={() => {
                      const booking = bookings.find(b => b.studentId?._id === s._id && b.status === 'approved');
                      if (booking) setFeedbackModal(booking);
                      else toast.error('No completed session to rate for this student');
                    }} className="btn-secondary w-full text-sm flex items-center justify-center gap-1"><Star size={14} /> Rate Student</button>
                  </div>
                ))}
                {uniqueStudents.length === 0 && (
                  <div className="col-span-full card p-12 text-center text-muted-foreground"><Users className="mx-auto mb-4 opacity-30" size={40} /><p>No students yet.</p></div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="animate-in max-w-2xl">
              <h1 className="text-3xl font-bold mb-1">Give Student Feedback</h1>
              <p className="text-muted-foreground mb-6">Rate students from your confirmed sessions.</p>
              {approved.length === 0 ? (
                <div className="card p-12 text-center text-muted-foreground"><MessageSquare className="mx-auto mb-4 opacity-30" size={40} /><p>No confirmed sessions to rate yet.</p></div>
              ) : (
                <div className="space-y-4">
                  {approved.map(b => (
                    <div key={b._id} className="card p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">{b.studentId?.name?.charAt(0)}</div>
                        <div><p className="font-bold">{b.studentId?.name}</p><p className="text-xs text-muted-foreground">{b.date} · {b.timeSlot}</p></div>
                      </div>
                      <button onClick={() => setFeedbackModal(b)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Star size={14} /> Rate</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Earnings */}
          {activeTab === 'earnings' && (
            <div className="animate-in max-w-4xl">
              <h1 className="text-3xl font-bold mb-2">Earnings Report</h1>
              <p className="text-muted-foreground mb-6">Track your revenue growth.</p>
              <div className="card p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-8 border-b border-border">
                  <div><p className="text-sm text-muted-foreground font-semibold mb-2">Total Earnings</p><h2 className="text-5xl font-black">${totalEarnings}</h2><p className="text-sm text-emerald-600 font-semibold mt-2">Based on {approved.length} confirmed sessions</p></div>
                  <button className="btn-primary">Withdraw Funds</button>
                </div>
                <h3 className="font-bold mb-4">Monthly Revenue</h3>
                <div className="h-56 flex items-end gap-1.5 pb-2">
                  {[30, 45, 28, 55, 70, 88, 62, 48, 90, 100, 82, 120].map((h, i) => (
                    <div key={i} className="flex-1 gradient-bg rounded-t-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="animate-in max-w-3xl">
              <h1 className="text-3xl font-bold mb-2">Tutor Profile Setup</h1>
              <p className="text-muted-foreground mb-6">This info appears publicly when students search for tutors.</p>
              <div className="card p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div><label className="text-sm font-semibold block mb-2">Subjects (comma-separated)</label><input type="text" className="input-field" placeholder="e.g. Calculus, Physics, Python" value={profile.subjects} onChange={e => setProfile({ ...profile, subjects: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold block mb-2">Years of Experience</label><input type="number" min="0" className="input-field" value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} /></div>
                    <div><label className="text-sm font-semibold block mb-2">Price per Session ($)</label><input type="number" min="5" className="input-field" value={profile.price} onChange={e => setProfile({ ...profile, price: e.target.value })} /></div>
                  </div>
                  <div><label className="text-sm font-semibold block mb-2">About You</label><textarea className="input-field min-h-[130px] resize-y" placeholder="Describe your teaching style and background..." value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} /></div>
                  <div className="pt-4 border-t border-border flex gap-4">
                    <button type="submit" className="btn-primary">Save Public Profile</button>
                    <button type="button" onClick={handleAdminRequest} className="btn-secondary">
                      <Shield size={16} /> Request Admin Access
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Manage Time Slots */}
          {activeTab === 'slots' && (
            <div className="animate-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Manage Teaching Slots</h1>
                <p className="text-muted-foreground mt-1">Set your availability so students can book you instantly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="card p-6 h-fit sticky top-24">
                  <h3 className="font-bold mb-5 flex items-center gap-2"><Clock size={18} className="text-primary" /> Add New Slot</h3>
                  <form onSubmit={handleSlotSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase opacity-60 mb-1.5 block">Course / Subject</label>
                      <input 
                        type="text" required className="input-field" placeholder="e.g. Mathematics"
                        value={newSlot.course} onChange={e => setNewSlot({...newSlot, course: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase opacity-60 mb-1.5 block">Date</label>
                      <input 
                        type="date" required className="input-field"
                        value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase opacity-60 mb-1.5 block">Time Slot</label>
                      <input 
                        type="text" required className="input-field" placeholder="e.g. 10:00 AM - 11:30 AM"
                        value={newSlot.timeSlot} onChange={e => setNewSlot({...newSlot, timeSlot: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-2 font-bold">Save Slot</button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold mb-2">Your Availability</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slots.map(slot => (
                      <div key={slot._id} className={`card p-5 border-l-4 ${slot.isBooked ? 'border-primary opacity-60' : 'border-slate-300'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">{slot.course}</p>
                            <p className="font-bold text-lg mt-0.5">{slot.timeSlot}</p>
                          </div>
                          {slot.isBooked ? (
                            <span className="badge-approved text-[10px]">BOOKED</span>
                          ) : (
                            <button onClick={() => handleDeleteSlot(slot._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><X size={16} /></button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar size={14} /> {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    {slots.length === 0 && <div className="card p-12 text-center text-muted-foreground sm:col-span-2">No slots defined yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;
