import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Users, GraduationCap, CalendarDays, MessageSquare,
  LayoutDashboard, Search, TrendingUp, LogOut, Shield,
  ShieldOff, Trash2, Star, Ban, CheckCircle, Menu,
  Mail, Settings, Check, X, Reply, Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import API_URL from "../services/api";
const API = `${API_URL}/api`;

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="card w-full max-w-sm p-8 animate-in text-center">
      <Shield className="mx-auto mb-4 text-destructive" size={40} />
      <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
      <p className="text-muted-foreground text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} className="btn-danger flex-1">Confirm</button>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchStudents, setSearchStudents] = useState('');
  const [searchTutors, setSearchTutors] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [replyText, setReplyText] = useState({}); // { messageId: text }

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      const [statsRes, studentsRes, tutorsRes, bookingsRes, feedbackRes, messagesRes, requestsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/students`, { headers }),
        axios.get(`${API}/admin/tutors`, { headers }),
        axios.get(`${API}/admin/bookings`, { headers }),
        axios.get(`${API}/admin/feedback`, { headers }),
        axios.get(`${API}/admin/messages`, { headers }),
        axios.get(`${API}/admin/requests`, { headers }),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setTutors(tutorsRes.data);
      setBookings(bookingsRes.data);
      setFeedback(feedbackRes.data);
      setMessages(messagesRes.data);
      setRequests(requestsRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBan = (user) => {
    setConfirmDialog({
      message: `Are you sure you want to ban "${user.name}"? They will not be able to login.`,
      onConfirm: async () => {
        try {
          await axios.put(`${API}/admin/user/${user._id}/ban`, {}, { headers });
          toast.success(`${user.name} has been banned.`);
          fetchAll();
        } catch { toast.error('Failed to ban user'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleUnban = async (user) => {
    try {
      await axios.put(`${API}/admin/user/${user._id}/unban`, {}, { headers });
      toast.success(`${user.name} has been unbanned.`);
      fetchAll();
    } catch { toast.error('Failed to unban user'); }
  };

  const handleCancelBooking = (booking) => {
    setConfirmDialog({
      message: `Cancel booking between "${booking.studentId?.name}" and "${booking.tutorId?.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/admin/booking/${booking._id}`, { headers });
          toast.success('Booking cancelled.');
          fetchAll();
        } catch { toast.error('Failed to cancel booking'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleMessageAction = async (id, action, extra = null) => {
    try {
      if (action === 'reply') {
        await axios.put(`${API}/admin/messages/${id}/reply`, { reply: extra }, { headers });
        toast.success('Reply sent');
      } else if (action === 'resolve') {
        await axios.put(`${API}/admin/messages/${id}/resolve`, {}, { headers });
        toast.success('Resolved');
      } else if (action === 'delete') {
        await axios.delete(`${API}/admin/messages/${id}`, { headers });
        toast.success('Deleted');
      }
      fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const handleRequestAction = async (id, action) => {
    try {
      await axios.put(`${API}/admin/requests/${id}/${action}`, {}, { headers });
      toast.success(`Request ${action}ed`);
      fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const [directMsg, setDirectMsg] = useState({ studentId: '', content: '' });
  const handleSendDirect = async (e) => {
    e.preventDefault();
    if (!directMsg.studentId || !directMsg.content) return toast.error('Select student and type message');
    try {
      await axios.post(`${API}/admin/send`, { receiverId: directMsg.studentId, message: directMsg.content }, { headers });
      toast.success('Message sent');
      setDirectMsg({ ...directMsg, content: '' });
    } catch { toast.error('Failed to send'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="spinner"></div></div>;

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchStudents.toLowerCase()) || s.email.toLowerCase().includes(searchStudents.toLowerCase()));
  const filteredTutors = tutors.filter(t => t.name.toLowerCase().includes(searchTutors.toLowerCase()) || t.email.toLowerCase().includes(searchTutors.toLowerCase()));

  const navItems = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'students',  icon: Users,           label: 'Students' },
    { id: 'tutors',    icon: GraduationCap,   label: 'Tutors' },
    { id: 'bookings',  icon: CalendarDays,    label: 'Bookings' },
    { id: 'feedback',  icon: MessageSquare,   label: 'Reviews' },
    { id: 'messages',  icon: Mail,            label: 'User Messages', badge: messages.filter(m => m.status === 'pending').length },
    { id: 'direct',    icon: MessageSquare,   label: 'Student Messages' },
    { id: 'requests',  icon: Shield,          label: 'Access Requests', badge: requests.filter(r => r.status === 'pending').length },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Dark Admin Sidebar */}
      <aside className="w-64 flex flex-col shrink-0 hidden md:flex" style={{ background: '#064E3B', color: '#ECFDF5' }}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10B981,#047857)' }}>
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Admin Panel</h2>
            <p className="text-xs" style={{ color: '#64748B' }}>Superuser Mode</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3 mt-2" style={{ color: '#475569' }}>Management</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: activeTab === item.id ? '#ffffff' : '#A7F3D0',
                background: activeTab === item.id ? 'linear-gradient(135deg,rgba(16,185,129,.35),rgba(4,120,87,.2))' : 'transparent',
              }}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#EF4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={17} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-background/50">
        {/* Admin Dashboard Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-muted rounded-xl text-muted-foreground"><Menu size={20} /></button>
            <h2 className="text-sm font-bold text-muted-foreground hidden sm:block uppercase tracking-wider">Platform Administration</h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-px h-6 bg-border mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">Admin Control</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">SUPERUSER</p>
              </div>
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-sm">A</div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="animate-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Admin Overview</h1>
                  <p className="text-muted-foreground mt-1">Real-time platform statistics and insights.</p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Total Students', val: stats.totalStudents || 0, icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-100', trend: '+12%' },
                  { title: 'Total Tutors', val: stats.totalTutors || 0, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+4%' },
                  { title: 'Total Bookings', val: stats.totalBookings || 0, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+28%' },
                  { title: 'Feedback Received', val: stats.totalFeedback || 0, icon: MessageSquare, color: 'text-emerald-700', bg: 'bg-emerald-100', trend: '+7%' },
                ].map((s, i) => (
                  <div key={i} className="card p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><s.icon size={22} /></div>
                      <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <TrendingUp size={11} className="mr-1" />{s.trend}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{s.title}</p>
                    <p className="text-3xl font-black">{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Recent Bookings & Growth Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-6">
                  <h3 className="font-bold text-lg mb-5">Platform Growth (30 days)</h3>
                  <div className="h-52 flex items-end gap-1.5 pb-2">
                    {[3,5,4,7,6,9,8,10,9,13,12,15,14,17,16,19,18,21,20,22,21,18,23,25,22,24,26,28,25,30].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-opacity hover:opacity-100 opacity-70 cursor-pointer"
                        style={{ height: `${(h / 30) * 100}%`, background: 'linear-gradient(135deg,#10B981,#047857)' }}></div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Daily new users (Student + Tutor registrations)</p>
                </div>

                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-5">Recent Bookings</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 6).map(b => (
                      <div key={b._id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold truncate pr-2">{b.studentId?.name} → {b.tutorId?.name}</p>
                          <span className={b.status === 'pending' ? 'badge-pending' : b.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.date} · {b.timeSlot}</p>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No bookings yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Management */}
          {activeTab === 'students' && (
            <div className="animate-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div><h1 className="text-3xl font-bold">Registered Students</h1><p className="text-muted-foreground">Manage student accounts and moderation.</p></div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                  <input className="input-field pl-9 py-2.5" placeholder="Search students..." value={searchStudents} onChange={e => setSearchStudents(e.target.value)} />
                </div>
              </div>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Contact</th><th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm">{s.name.charAt(0)}</div>
                            <span className="font-semibold">{s.name}</span>
                          </div>
                        </td>
                        <td>
                          <p className="text-sm">{s.email}</p>
                          <p className="text-xs text-muted-foreground">{s.phoneNumber || 'No phone'}</p>
                        </td>
                        <td className="text-muted-foreground text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          {s.isBanned
                            ? <span className="badge-banned">Banned</span>
                            : <span className="badge-approved">Active</span>}
                        </td>
                        <td className="text-right">
                          {s.isBanned ? (
                            <button onClick={() => handleUnban(s)} className="btn-success text-xs flex items-center gap-1 ml-auto">
                              <CheckCircle size={13} /> Unban
                            </button>
                          ) : (
                            <button onClick={() => handleBan(s)} className="btn-danger text-xs flex items-center gap-1 ml-auto">
                              <Ban size={13} /> Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-10 text-muted-foreground">No students found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tutors Management */}
          {activeTab === 'tutors' && (
            <div className="animate-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div><h1 className="text-3xl font-bold">Registered Tutors</h1><p className="text-muted-foreground">View and moderate tutor accounts.</p></div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                  <input className="input-field pl-9 py-2.5" placeholder="Search tutors..." value={searchTutors} onChange={e => setSearchTutors(e.target.value)} />
                </div>
              </div>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr><th>Tutor</th><th>Contact</th><th>Joined</th><th>Status</th><th className="text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredTutors.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#10B981,#6EE7B7)' }}>{t.name.charAt(0)}</div>
                            <span className="font-semibold">{t.name}</span>
                          </div>
                        </td>
                        <td>
                          <p className="text-sm">{t.email}</p>
                          <p className="text-xs text-muted-foreground">{t.phoneNumber || 'No phone'}</p>
                        </td>
                        <td className="text-muted-foreground text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>
                          {t.isBanned
                            ? <span className="badge-banned">Banned</span>
                            : <span className="badge-approved">Active</span>}
                        </td>
                        <td className="text-right">
                          {t.isBanned ? (
                            <button onClick={() => handleUnban(t)} className="btn-success text-xs flex items-center gap-1 ml-auto">
                              <CheckCircle size={13} /> Unban
                            </button>
                          ) : (
                            <button onClick={() => handleBan(t)} className="btn-danger text-xs flex items-center gap-1 ml-auto">
                              <Ban size={13} /> Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTutors.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-10 text-muted-foreground">No tutors found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Booking Management */}
          {activeTab === 'bookings' && (
            <div className="animate-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Booking Management</h1>
                <p className="text-muted-foreground">View all platform bookings and cancel invalid ones.</p>
              </div>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Tutor</th><th>Schedule</th><th>Status</th><th className="text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">{b.studentId?.name?.charAt(0) || '?'}</div>
                            <div>
                              <p className="font-semibold text-sm">{b.studentId?.name || 'Deleted User'}</p>
                              <p className="text-xs text-muted-foreground">{b.studentId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: 'linear-gradient(135deg,#10B981,#6EE7B7)' }}>{b.tutorId?.name?.charAt(0) || '?'}</div>
                            <div>
                              <p className="font-semibold text-sm">{b.tutorId?.name || 'Deleted User'}</p>
                              <p className="text-xs text-muted-foreground">{b.tutorId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="text-sm font-medium">{b.date}</p>
                          <p className="text-xs text-muted-foreground">{b.timeSlot}</p>
                        </td>
                        <td>
                          <span className={b.status === 'pending' ? 'badge-pending' : b.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleCancelBooking(b)}
                            className="btn-danger text-xs flex items-center gap-1 ml-auto"
                          >
                            <Trash2 size={13} /> Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-10 text-muted-foreground">No bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Management */}
          {activeTab === 'feedback' && (
            <div className="animate-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Platform Feedback</h1>
                <p className="text-muted-foreground">All feedback submitted by students and tutors.</p>
              </div>

              {feedback.length === 0 ? (
                <div className="card p-16 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-4 opacity-30" size={48} />
                  <p className="font-semibold">No feedback submitted yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedback.map(f => (
                    <div key={f._id} className="card p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
                            {(f.role === 'student' ? f.studentId?.name : f.tutorId?.name)?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              {f.role === 'student' ? f.studentId?.name : f.tutorId?.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{f.role} review</p>
                          </div>
                        </div>
                        <span className={f.role === 'student' ? 'badge-approved' : 'badge-pending'} style={{ textTransform: 'capitalize' }}>
                          {f.role}
                        </span>
                      </div>

                      {/* Reviewed person */}
                      <p className="text-xs text-muted-foreground mb-3">
                        {f.role === 'student' ? 'Reviewed tutor:' : 'Reviewed student:'}
                        <span className="font-semibold text-foreground ml-1">
                          {f.role === 'student' ? f.tutorId?.name : f.studentId?.name}
                        </span>
                      </p>

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={16} className={n <= f.rating ? 'star-active fill-current' : 'star-inactive'} />
                        ))}
                        <span className="ml-2 text-sm font-bold">{f.rating}/5</span>
                      </div>

                      {/* Comment */}
                      {f.comment && (
                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                          "{f.comment}"
                        </p>
                      )}

                      {/* Date */}
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(f.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Messages */}
          {activeTab === 'messages' && (
            <div className="animate-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">User Messages</h1>
                <p className="text-muted-foreground">Inquiries from the public contact form.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {messages.map(msg => (
                  <div key={msg._id} className="card p-6 border-l-4" style={{ borderColor: msg.status === 'pending' ? '#10B981' : '#E5E7EB' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Mail size={20} /></div>
                        <div>
                          <p className="font-bold">{msg.name}</p>
                          <p className="text-xs text-muted-foreground">{msg.email} · {new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={msg.status === 'pending' ? 'badge-pending' : 'badge-approved'}>{msg.status}</span>
                    </div>
                    <p className="text-sm bg-muted/30 p-4 rounded-xl mb-4 italic">"{msg.message}"</p>
                    
                    {msg.adminReply ? (
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-4">
                        <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1"><Reply size={12} /> Your Reply:</p>
                        <p className="text-sm text-emerald-800">{msg.adminReply}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea 
                          className="input-field min-h-[80px]" 
                          placeholder="Type your reply here..." 
                          value={replyText[msg._id] || ''}
                          onChange={e => setReplyText({...replyText, [msg._id]: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <button 
                            disabled={!replyText[msg._id]}
                            onClick={() => handleMessageAction(msg._id, 'reply', replyText[msg._id])} 
                            className="btn-primary text-xs py-2 px-4"
                          >
                            Send Reply
                          </button>
                          <button 
                            onClick={() => handleMessageAction(msg._id, 'resolve')} 
                            className="btn-secondary text-xs py-2 px-4"
                          >
                            Mark as Handled
                          </button>
                          <button 
                            onClick={() => handleMessageAction(msg._id, 'delete')} 
                            className="text-xs text-red-500 hover:underline px-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="card p-12 text-center text-muted-foreground"><Mail size={40} className="mx-auto mb-4 opacity-30" /><p>No messages yet.</p></div>
                )}
              </div>
            </div>
          )}

          {/* Admin Access Requests */}
          {activeTab === 'requests' && (
            <div className="animate-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Admin Access Requests</h1>
                <p className="text-muted-foreground">Approve new users to moderate the platform.</p>
              </div>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Requested On</th><th>Status</th><th className="text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req._id}>
                        <td><p className="font-semibold">{req.userId?.name}</p></td>
                        <td>{req.email || req.userId?.email}</td>
                        <td className="text-muted-foreground text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td><span className={`badge-${req.status}`}>{req.status}</span></td>
                        <td className="text-right">
                          {req.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleRequestAction(req._id, 'reject')} className="btn-danger p-2 rounded-lg" title="Reject"><X size={15} /></button>
                              <button onClick={() => handleRequestAction(req._id, 'approve')} className="btn-success p-2 rounded-lg" title="Approve"><Check size={15} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-12 text-muted-foreground">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin to Student Direct Messages */}
          {activeTab === 'direct' && (
            <div className="animate-in max-w-2xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Message Students</h1>
                <p className="text-muted-foreground mt-1">Send important updates directly to student dashboards.</p>
              </div>
              <div className="card p-8 shadow-md">
                <form onSubmit={handleSendDirect} className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold block mb-2 uppercase tracking-wide opacity-70">Recipient Student</label>
                    <select 
                      className="input-field cursor-pointer"
                      value={directMsg.studentId}
                      onChange={e => setDirectMsg({ ...directMsg, studentId: e.target.value })}
                    >
                      <option value="">Select a student...</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2 uppercase tracking-wide opacity-70">Message Content</label>
                    <textarea 
                      className="input-field min-h-[150px] resize-y" 
                      placeholder="Type your message here..."
                      value={directMsg.content}
                      onChange={e => setDirectMsg({ ...directMsg, content: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2">
                    <Mail size={18} /> Send Message to Student
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
