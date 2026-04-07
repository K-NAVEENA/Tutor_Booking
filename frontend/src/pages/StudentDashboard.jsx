import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, BookOpen, Star, Search, Filter, Home, User, Bell, ChevronLeft, ChevronRight, LogOut, MessageSquare, Menu, Shield, X, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import API_URL from "../services/api";
const API = 'http://localhost:5000/api';

// Star Rating Component
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <Star
          size={24}
          className={n <= value ? 'star-active fill-current' : 'star-inactive'}
        />
      </button>
    ))}
  </div>
);

// Tutor Profile & Slot Selection Modal
const TutorProfileModal = ({ tutor, onClose, onBook }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/student/tutor/${tutor._id}/slots`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSlots(res.data);
      } catch { toast.error('Failed to load slots'); }
      finally { setLoading(false); }
    };
    fetchSlots();
  }, [tutor._id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-8 animate-in relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X size={20} /></button>
        
        <div className="flex items-center gap-6 mb-8 border-b border-border pb-6">
          <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-3xl font-bold">{tutor.name?.charAt(0)}</div>
          <div>
            <h2 className="text-2xl font-bold">{tutor.name}</h2>
            <p className="text-primary font-bold">{tutor.profile?.subjects?.join(', ') || 'General Tutor'}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Star size={12} fill="currentColor" /> {tutor.profile?.rating || 4.9}</span>
              <span>•</span>
              <span>{tutor.profile?.experience || 0} years experience</span>
              <span>•</span>
              <span className="font-bold text-foreground">${tutor.profile?.price || 40}/hr</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-primary" /> Available Slots</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="spinner"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map(slot => (
                <div key={slot._id} className="card p-4 hover:border-primary transition-all group flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{slot.course}</p>
                    <p className="font-bold text-sm tracking-tight">{slot.timeSlot}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{new Date(slot.date).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => onBook(slot)}
                    className="btn-primary w-full py-2 rounded-lg text-xs font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Select Slot
                  </button>
                </div>
              ))}
              {slots.length === 0 && <p className="text-center py-8 text-muted-foreground sm:col-span-2 italic">No available slots at the moment.</p>}
            </div>
          )}
        </div>
        
        <div className="bg-muted/30 p-5 rounded-2xl">
          <h3 className="font-bold mb-2 text-sm uppercase tracking-wide opacity-70">About the Tutor</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{tutor.profile?.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
};

// Feedback Modal
const FeedbackModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ tutorId: booking.tutorId._id, rating, comment });
      toast.success('Feedback submitted!');
      onClose();
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-in">
        <h2 className="text-xl font-bold mb-1">Rate Your Session</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tutor: <span className="font-semibold text-foreground">{booking.tutorId?.name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold block mb-2">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-2">Comment</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Share your experience with this tutor..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(150);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackModal, setFeedbackModal] = useState(null); // booking object
  const itemsPerPage = 6;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [profileData, setProfileData] = useState({ name: user.name || '', phoneNumber: user.phoneNumber || '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [directMessages, setDirectMessages] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const fetchData = async () => {
    try {
      const [tutorsRes, bookingsRes, dmsRes] = await Promise.all([
        axios.get(`${API}/tutors`),
        axios.get(`${API}/student/bookings`, { headers }),
        axios.get(`${API}/student/messages`, { headers })
      ]);
      setTutors(tutorsRes.data);
      setBookings(bookingsRes.data);
      setDirectMessages(dmsRes.data);
      
      const approved = bookingsRes.data.filter(b => b.status === 'approved');
      setNotifications(approved.map(b => ({
        id: b._id,
        message: `✅ Your booking with ${b.tutorId?.name} on ${b.date} has been approved!`,
        time: new Date(b.createdAt).toLocaleDateString()
      })));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API}/messages/${id}/read`, {}, { headers });
      setDirectMessages(directMessages.map(m => m._id === id ? { ...m, readStatus: true } : m));
    } catch (err) {}
  };

  const handleBookSlot = async (slot) => {
    try {
      await axios.post(`${API}/student/book-slot`, { tutorId: slot.tutorId, slotId: slot._id }, { headers });
      toast.success('Slot selected! Booking request sent.');
      setSelectedTutor(null);
      fetchData();
    } catch { toast.error('Failed to select slot'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async (tutorId) => {
    const date = prompt('Enter date (YYYY-MM-DD):');
    if (!date) return;
    const timeSlot = prompt('Enter time slot (e.g., 10:00 AM - 11:00 AM):');
    if (!timeSlot) return;
    try {
      await axios.post(`${API}/student/bookings`, { tutorId, date, timeSlot }, { headers });
      toast.success('Booking requested!');
      fetchData();
    } catch {
      toast.error('Failed to book tutor');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API}/student/profile`, profileData, { headers });
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleSubmitFeedback = async ({ tutorId, rating, comment }) => {
    await axios.post(`${API}/student/feedback`, { tutorId, rating, comment }, { headers });
  };

  const handleAdminRequest = async () => {
    if (!profileData.name || !user.email) return toast.error('Check your profile details');
    try {
      await axios.post(`${API}/admin-request`, { email: user.email }, { headers });
      toast.success('Admin access request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  const filteredTutors = tutors.filter(t => {
    const matchSearch = t.profile?.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrice = (t.profile?.price || 0) <= Number(maxPrice);
    return matchSearch && matchPrice;
  });
  const totalPages = Math.max(1, Math.ceil(filteredTutors.length / itemsPerPage));
  const paginatedTutors = filteredTutors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="spinner"></div></div>;

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'tutors', icon: Search, label: 'Find Tutors' },
    { id: 'bookings', icon: Calendar, label: 'My Bookings' },
    { id: 'feedback', icon: MessageSquare, label: 'Give Feedback' },
    { id: 'direct-messages', icon: Mail, label: 'Admin Messages', badge: directMessages.filter(m => !m.readStatus).length },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: notifications.length },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {selectedTutor && (
        <TutorProfileModal tutor={selectedTutor} onClose={() => setSelectedTutor(null)} onBook={handleBookSlot} />
      )}
      {feedbackModal && (
        <FeedbackModal
          booking={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-border text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
            {user.name?.charAt(0)}
          </div>
          <p className="font-bold">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}>
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="sidebar-item w-full text-destructive hover:bg-destructive/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-background/50">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-muted rounded-xl text-muted-foreground"><Menu size={20} /></button>
            <h2 className="text-sm font-bold text-muted-foreground hidden sm:block uppercase tracking-wider">Student Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-px h-6 bg-border mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">PRO STUDENT</p>
              </div>
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-sm">{user.name?.charAt(0)}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
              <p className="text-muted-foreground mb-8">Here's what's happening with your learning journey.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Bookings', val: bookings.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Confirmed Sessions', val: bookings.filter(b => b.status === 'approved').length, icon: BookOpen, color: 'text-secondary-foreground', bg: 'bg-emerald-50' },
                  { label: 'Available Tutors', val: tutors.length, icon: User, color: 'text-emerald-700', bg: 'bg-emerald-100' },
                ].map((s, i) => (
                  <div key={i} className="card p-6 flex items-center gap-4">
                    <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}><s.icon size={22} /></div>
                    <div><p className="text-sm text-muted-foreground font-medium">{s.label}</p><p className="text-2xl font-bold">{s.val}</p></div>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold">Upcoming Confirmed Sessions</h2>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-primary font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'approved').slice(0, 4).map(b => (
                    <div key={b._id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">{b.tutorId?.name?.charAt(0)}</div>
                        <div><p className="font-semibold text-sm">{b.tutorId?.name}</p><p className="text-xs text-muted-foreground">{b.date} · {b.timeSlot}</p></div>
                      </div>
                      <button onClick={() => setFeedbackModal(b)} className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1"><Star size={14} /> Rate</button>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'approved').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No confirmed sessions yet. Go find a tutor!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="animate-in max-w-2xl">
              <h1 className="text-3xl font-bold mb-1">My Profile</h1>
              <p className="text-muted-foreground mb-8">Manage your personal information.</p>
              <div className="card p-8">
                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border">
                  <div className="h-20 w-20 gradient-bg rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">{profileData.name.charAt(0)}</div>
                  <div><h3 className="text-xl font-bold">{profileData.name}</h3><p className="text-muted-foreground text-sm">{user.email}</p></div>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div><label className="text-sm font-semibold block mb-2">Full Name</label><input type="text" className="input-field" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} /></div>
                  <div><label className="text-sm font-semibold block mb-2">Phone Number</label><input type="text" className="input-field" value={profileData.phoneNumber} onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })} /></div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary">Save Changes</button>
                    <button type="button" onClick={handleAdminRequest} className="btn-secondary">
                      <Shield size={16} /> Request Admin Access
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Find Tutors */}
          {activeTab === 'tutors' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-1">Find Tutors</h1>
              <p className="text-muted-foreground mb-6">Search and filter from our vetted tutor marketplace.</p>
              <div className="card p-4 flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                  <input type="text" placeholder="Search by name or subject..." className="input-field pl-9" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="flex items-center gap-3">
                  <Filter size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold whitespace-nowrap">Max: ${maxPrice}/hr</span>
                  <input type="range" min="10" max="200" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setCurrentPage(1); }} className="w-28 accent-[#10B981]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTutors.map(tutor => (
                  <div key={tutor._id} className="card overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                    <div className="h-24 gradient-bg relative">
                      <div className="absolute -bottom-8 left-5 h-16 w-16 rounded-2xl border-4 border-card bg-white flex items-center justify-center text-primary font-extrabold text-xl shadow">
                        {tutor.name.charAt(0)}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star size={12} className="star-active fill-current" /> {tutor.profile?.rating || 'New'}
                      </div>
                    </div>
                    <div className="p-5 pt-12 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div><h3 className="font-bold">{tutor.name}</h3><p className="text-sm text-primary font-medium">{tutor.profile?.subjects?.slice(0, 2).join(', ') || 'General'}</p></div>
                        <div className="text-right"><span className="text-xl font-black">${tutor.profile?.price || 0}</span><span className="text-xs text-muted-foreground block">/hr</span></div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">{tutor.profile?.description || 'Expert tutor ready to help you achieve your goals.'}</p>
                      <div className="flex gap-4 text-xs font-semibold text-muted-foreground mb-4 pt-4 border-t border-border">
                        <span className="flex items-center gap-1"><Clock size={13} className="text-primary" /> {tutor.profile?.experience || 0} yrs</span>
                        <span className="flex items-center gap-1"><BookOpen size={13} className="text-cyan-500" /> {tutor.profile?.subjects?.length || 0} subjects</span>
                      </div>
                      <button onClick={() => handleBook(tutor._id)} className="btn-primary w-full group-hover:shadow-lg">Book Session</button>
                    </div>
                  </div>
                ))}
                {paginatedTutors.length === 0 && (
                  <div className="col-span-full card p-16 text-center text-muted-foreground">
                    <Search className="mx-auto mb-4 opacity-30" size={40} />
                    <p className="font-semibold">No tutors found. Try different filters.</p>
                  </div>
                )}
              </div>
              {paginatedTutors.length > 0 && (
                <div className="flex items-center justify-between mt-6 card px-5 py-3">
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="animate-in">
              <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
              <p className="text-muted-foreground mb-6">Track all your tutoring session requests.</p>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead><tr><th>Tutor</th><th>Schedule</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm">{b.tutorId?.name?.charAt(0) || '?'}</div>
                            <div><p className="font-semibold">{b.tutorId?.name}</p><p className="text-xs text-muted-foreground">{b.tutorId?.email}</p></div>
                          </div>
                        </td>
                        <td><div className="flex items-center gap-1.5 text-sm"><Calendar size={14} /> {b.date}</div><div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1"><Clock size={13} /> {b.timeSlot}</div></td>
                        <td>
                          <span className={b.status === 'pending' ? 'badge-pending' : b.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {b.status === 'approved' && (
                            <button onClick={() => setFeedbackModal(b)} className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1 ml-auto"><Star size={13} /> Rate Tutor</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan="4" className="text-center py-12 text-muted-foreground">No bookings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {activeTab === 'feedback' && (
            <div className="animate-in max-w-2xl">
              <h1 className="text-3xl font-bold mb-1">Give Feedback</h1>
              <p className="text-muted-foreground mb-6">Rate a tutor from your completed sessions.</p>
              {bookings.filter(b => b.status === 'approved').length === 0 ? (
                <div className="card p-12 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-4 opacity-30" size={40} />
                  <p>You have no completed sessions to rate yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'approved').map(b => (
                    <div key={b._id} className="card p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">{b.tutorId?.name?.charAt(0)}</div>
                        <div><p className="font-bold">{b.tutorId?.name}</p><p className="text-xs text-muted-foreground">{b.date} · {b.timeSlot}</p></div>
                      </div>
                      <button onClick={() => setFeedbackModal(b)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Star size={15} /> Rate Session</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="animate-in max-w-3xl">
              <h1 className="text-3xl font-bold mb-1">Notifications</h1>
              <p className="text-muted-foreground mb-6">Updates on your session approvals.</p>
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="card p-5 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Bell size={18} /></div>
                    <div><p className="font-semibold text-sm">{n.message}</p><p className="text-xs text-muted-foreground mt-1">{n.time}</p></div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="card p-12 text-center text-muted-foreground"><Bell className="mx-auto mb-4 opacity-30" size={36} /><p>You're all caught up!</p></div>
                )}
              </div>
            </div>
          )}

        </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
