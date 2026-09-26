import React, { useState, useEffect } from 'react';
import db from './services/db';
import { supabaseService } from './services/supabaseService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Bell, GraduationCap, X, Check } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Notification menu states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check local storage for authenticated session
    try {
      const stored = localStorage.getItem('capybara_academy_current_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const list = await supabaseService.getNotifications(currentUser.id);
    setNotifications(list);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentTab('dashboard'); // default starting tab
  };

  const handleLogout = () => {
    localStorage.removeItem('capybara_academy_current_user');
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    await supabaseService.markAllNotificationsRead(currentUser.id);
    loadNotifications();
    triggerToast('Notificações marcadas como lidas.');
  };

  const clearNotification = async (id) => {
    await supabaseService.deleteNotification(id);
    loadNotifications();
  };

  // Toast banner simulation
  const [appToast, setAppToast] = useState(null);
  const triggerToast = (msg) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3000);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container light-theme">
      {/* Dynamic Sidebar */}
      <Sidebar 
        currentUser={currentUser} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onLogout={handleLogout}
        notificationsCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      {/* Main Layout Area */}
      <div className="main-content">
        {/* Header (Desktop Top Nav) */}
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-title)', textTransform: 'capitalize' }}>
              {currentTab === 'dashboard' ? 'Dashboard' : currentTab === 'esquenta' ? 'Esquenta' : currentTab === 'atividades' ? 'Atividades' : currentTab === 'equipe' ? 'Minha Equipe' : currentTab === 'conhecimento' ? 'Conhecimento' : currentTab === 'escala' ? 'Escala' : currentTab === 'capacitacoes' ? 'Capacitações' : currentTab === 'avaliacoes' ? 'Avaliações' : currentTab}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            <button 
              style={styles.notifBtn}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} color={unreadCount > 0 ? 'var(--color-accent)' : 'var(--text-muted)'} />
              {unreadCount > 0 && <span style={styles.notifBadgeCount}>{unreadCount}</span>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '10px', transition: 'background-color 0.2s' }} onClick={() => setCurrentTab('perfil')}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(201, 162, 74, 0.14)',
                border: '1px solid rgba(201, 162, 74, 0.3)',
                color: '#C9A24A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#281D17' }} className="desktop-only-name">
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#8A7B70' }}>▼</span>
            </div>

            {/* Notification Dropdown Pane */}
            {showNotifications && (
              <div style={styles.notifDropdown}>
                <div style={styles.notifHeader}>
                  <span>Notificações ({unreadCount} pendentes)</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} style={styles.markReadBtn}>
                      <Check size={14} />
                      Ler todas
                    </button>
                  )}
                </div>
                <div style={styles.notifList}>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{
                        ...styles.notifItem,
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.04)'
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', flex: 1 }}>{n.message}</p>
                      <button onClick={() => clearNotification(n.id)} style={styles.deleteNotifBtn}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                      Nenhuma notificação por aqui.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Dashboards based on User Roles */}
        {currentUser.role === 'funcionario' && (
          <EmployeeDashboard 
            currentUser={currentUser} 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
          />
        )}

        {currentUser.role === 'gestor' && (
          <ManagerDashboard 
            currentUser={currentUser} 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
          />
        )}

        {currentUser.role === 'admin' && (
          <AdminDashboard 
            currentUser={currentUser} 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
          />
        )}
      </div>

      {/* Global simulated app toasts */}
      {appToast && (
        <div className="toast-container">
          <div className="toast">
            {appToast}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    height: 'var(--header-height)',
    borderBottom: '1px solid #EAE3D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    backgroundColor: '#FFFFFF',
    flexShrink: 0
  },
  breadcrumbRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  breadcrumbTitle: {
    fontWeight: '600',
    color: 'var(--text-title)'
  },
  breadcrumbDivider: {
    color: 'var(--text-muted)'
  },
  breadcrumbTab: {
    color: 'var(--color-primary)',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  notifBtn: {
    background: 'none',
    border: 'none',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'background-color 0.2s'
  },
  notifBadgeCount: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifDropdown: {
    position: 'absolute',
    top: '40px',
    right: 0,
    width: '320px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 999,
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease-out'
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: 'var(--text-title)'
  },
  markReadBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  notifList: {
    maxHeight: '280px',
    overflowY: 'auto'
  },
  notifItem: {
    display: 'flex',
    padding: '0.85rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  deleteNotifBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center'
  }
};
