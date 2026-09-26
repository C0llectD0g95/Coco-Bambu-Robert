// C:\Users\Asus\Desktop\Coco Bambu\src\components\Sidebar.jsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  CalendarDays, 
  Award, 
  TrendingUp, 
  User, 
  Users, 
  Flame, 
  FileText, 
  Settings, 
  Building2, 
  Grid, 
  Briefcase, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

export default function Sidebar({ currentUser, currentTab, setCurrentTab, onLogout, notificationsCount, showNotifications, setShowNotifications }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define menu items by role
  const getMenuItems = () => {
    switch (currentUser?.role) {
      case 'funcionario':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'atividades', label: 'Atividades', icon: ClipboardList },
          { id: 'conhecimento', label: 'Conhecimento', icon: BookOpen },
          { id: 'escala', label: 'Escala', icon: CalendarDays },
          { id: 'capacitacoes', label: 'Capacitações', icon: Award },
          { id: 'progresso', label: 'Meu Progresso', icon: TrendingUp },
          { id: 'perfil', label: 'Meu Perfil', icon: User }
        ];
      case 'gestor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'esquenta', label: 'Esquenta', icon: Flame },
          { id: 'atividades', label: 'Atividades', icon: ClipboardList },
          { id: 'equipe', label: 'Minha Equipe', icon: Users },
          { id: 'conhecimento', label: 'Conhecimento', icon: BookOpen },
          { id: 'escala', label: 'Escala', icon: CalendarDays },
          { id: 'capacitacoes', label: 'Capacitações', icon: Award },
          { id: 'avaliacoes', label: 'Avaliações', icon: FileText },
          { id: 'perfil', label: 'Meu Perfil', icon: User }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'usuarios', label: 'Usuários', icon: Users },
          { id: 'unidades', label: 'Unidades', icon: Building2 },
          { id: 'setores', label: 'Setores', icon: Grid },
          { id: 'cargos', label: 'Cargos', icon: Briefcase },
          { id: 'conhecimento', label: 'Conhecimento', icon: BookOpen },
          { id: 'atividades', label: 'Atividades', icon: ClipboardList },
          { id: 'capacitacoes', label: 'Capacitações', icon: Award },
          { id: 'escala', label: 'Escalas', icon: CalendarDays },
          { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
          { id: 'configuracoes', label: 'Configurações', icon: Settings }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>ADMIN</span>;
      case 'gestor': return <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>GESTOR</span>;
      default: return <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>FUNC</span>;
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header style={styles.mobileHeader}>
        <div style={styles.brandRow}>
          <img 
            src="/logos_transparent.png" 
            alt="Coco Bambu | Capybara Labs" 
            style={styles.mobileBrandLogo} 
            className="mobile-brand-logo"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            style={styles.notifIconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} color={notificationsCount > 0 ? '#C9A24A' : '#8A7B70'} />
            {notificationsCount > 0 && <span style={styles.notifBadge}>{notificationsCount}</span>}
          </button>
          <button style={styles.hamburgerBtn} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} color="#FFFFFF" /> : <Menu size={24} color="#FFFFFF" />}
          </button>
        </div>
      </header>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside 
        style={{
          ...styles.sidebarWrapper,
          left: mobileOpen ? '0' : undefined // responsive control
        }}
        className={mobileOpen ? 'mobile-open' : ''}
      >
        {/* Brand Header Section (#211914) */}
        <div style={styles.logoSection}>
          <img 
            src="/logos_transparent.png" 
            alt="Coco Bambu | Capybara Labs" 
            style={styles.logoImage} 
            className="sidebar-brand-logo"
          />
        </div>

        {/* Navigation Menu */}
        <nav style={styles.navMenu}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{
                  ...styles.navLink,
                  backgroundColor: isActive ? 'rgba(201, 162, 74, 0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#A39284',
                  borderLeft: isActive ? '4px solid #C9A24A' : '4px solid transparent'
                }}
              >
                <IconComponent size={19} color={isActive ? '#C9A24A' : '#8A7B70'} style={styles.navIcon} />
                <span style={{ fontWeight: isActive ? '700' : '500', letterSpacing: isActive ? '0.01em' : 'normal' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div style={styles.userFooter}>
          <div style={styles.userInfoRow}>
            <div style={styles.avatar}>
              {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'CB'}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName} title={currentUser?.name}>{currentUser?.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                {getRoleBadge(currentUser?.role)}
                <span style={styles.unitText}>
                  {currentUser?.unit_id === 'u-teresina' ? 'Teresina' : currentUser?.unit_id === 'u-matriz' ? 'Matriz' : 'Geral'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn} className="sidebar-logout-btn">
            <LogOut size={16} />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* CSS injection for hover micro-interactions */}
      <style>{`
        .nav-item-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .nav-item-btn:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: #F0E6DD !important;
        }
        .nav-item-btn:hover svg {
          color: #E0C477 !important;
        }
        .nav-item-btn.active:hover {
          background-color: rgba(201, 162, 74, 0.16) !important;
          color: #FFFFFF !important;
        }
        .sidebar-logout-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .sidebar-logout-btn:hover {
          background-color: rgba(220, 38, 38, 0.16) !important;
          border-color: rgba(220, 38, 38, 0.35) !important;
          color: #F87171 !important;
        }
        @media (max-width: 768px) {
          aside {
            position: fixed;
            top: var(--header-height);
            bottom: 0;
            left: -100%;
            z-index: 998;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: var(--sidebar-width) !important;
            height: calc(100vh - var(--header-height)) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
          aside.mobile-open {
            left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  mobileHeader: {
    display: 'none',
    height: 'var(--header-height)',
    backgroundColor: '#211914',
    borderBottom: '1px solid rgba(201, 162, 74, 0.15)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.25rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  mobileBrandLogo: {
    width: 'auto',
    height: 'auto',
    maxHeight: '44px',
    maxWidth: '200px',
    objectFit: 'contain'
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  notifIconBtn: {
    background: 'none',
    border: 'none',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#DC2626',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sidebarWrapper: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    width: 'var(--sidebar-width)',
    backgroundColor: '#211914', // Marrom escuro chocolate
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  },
  logoSection: {
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1.25rem',
    borderBottom: '1px solid rgba(201, 162, 74, 0.15)', // Divisão discreta dourada
    backgroundColor: '#211914'
  },
  logoImage: {
    width: '215px', // Dominante 205-225px
    height: 'auto',
    maxHeight: '68px',
    objectFit: 'contain',
    objectPosition: 'center center',
    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))'
  },
  navMenu: {
    flex: 1,
    padding: '1.25rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    overflowY: 'auto'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.8rem 1.4rem',
    border: 'none',
    background: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    borderRadius: '0 8px 8px 0'
  },
  navIcon: {
    flexShrink: 0
  },
  userFooter: {
    padding: '1.25rem',
    borderTop: '1px solid rgba(201, 162, 74, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  userInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(201, 162, 74, 0.16)',
    border: '1px solid rgba(201, 162, 74, 0.35)',
    color: '#E0C477',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  unitText: {
    fontSize: '0.725rem',
    color: '#A39284',
    fontWeight: '500'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.6rem',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    border: '1px solid rgba(220, 38, 38, 0.2)',
    color: '#F87171',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.825rem',
    fontWeight: '600'
  }
};

// Add desktop/mobile display media listeners
if (typeof window !== 'undefined') {
  const adjustLayout = () => {
    const isMobile = window.innerWidth <= 768;
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const main = document.querySelector('.main-content');
    const content = document.querySelector('.content-body');
    if (header && aside && main && content) {
      if (isMobile) {
        header.style.display = 'flex';
        aside.style.top = 'var(--header-height)';
        main.style.paddingTop = 'var(--header-height)';
      } else {
        header.style.display = 'none';
        aside.style.top = '0';
        main.style.paddingTop = '0';
      }
    }
  };
  window.addEventListener('resize', adjustLayout);
  setTimeout(adjustLayout, 100);
}
