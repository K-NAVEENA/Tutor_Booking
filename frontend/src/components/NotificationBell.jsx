import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, CheckCheck } from 'lucide-react';

const API = 'http://localhost:5000/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/notifications`, { headers });
      setNotifications(res.data);
    } catch {
      // silently fail if not authenticated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!token) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{
          background: open ? 'rgba(16,185,129,.12)' : 'transparent',
          border: '1.5px solid rgb(var(--border))',
          color: 'rgb(var(--foreground))',
          cursor: 'pointer'
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center font-bold"
            style={{ background: '#10B981', fontSize: '10px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown animate-fade">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className="px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors"
                  style={{
                    background: n.isRead ? 'transparent' : 'rgba(16,185,129,.06)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(16,185,129,.06)'}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(16,185,129,.12)', color: '#10B981' }}
                    >
                      <Bell size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug" style={{ fontWeight: n.isRead ? 400 : 600 }}>
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#10B981' }}></div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
