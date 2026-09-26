// C:\Users\Asus\Desktop\Coco Bambu\src\components\Login.jsx
import React, { useState } from 'react';
import { db } from '../services/db';
import { supabase } from '../services/supabaseClient';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle,
  ArrowRight,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Hidden demo panel toggled by clicking the user icon on top of the card
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ success: false, message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, insira e-mail e senha.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      setLoading(false);

      if (error || !data) {
        setErrorMessage('E-mail ou senha inválidos.');
        return;
      }

      if (data.status !== 'active') {
        setErrorMessage('Usuário inativo. Contate o administrador.');
        return;
      }

      localStorage.setItem('capybara_academy_current_user', JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setLoading(false);
      setErrorMessage('Erro ao conectar com o banco de dados.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotStatus({ success: false, message: 'Digite seu e-mail.' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', forgotEmail)
        .single();

      if (data) {
        setForgotStatus({ success: true, message: `Um link de recuperação foi enviado para ${forgotEmail}.` });
      } else {
        setForgotStatus({ success: false, message: 'E-mail não cadastrado em nosso sistema.' });
      }
    } catch (err) {
      setForgotStatus({ success: false, message: 'E-mail não cadastrado em nosso sistema.' });
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('123');
    setShowDemoPanel(false);
  };

  return (
    <div style={styles.container} className="animated-fade login-viewport">
      
      {/* FLOATING DEMO PANEL (HIDDEN BY DEFAULT - TOGGLED BY CLICKING THE GREEN AVATAR ICON ON THE CARD) */}
      {showDemoPanel && (
        <div style={styles.demoPanel}>
          <div style={styles.demoPanelHeader}>
            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#D49B24' }}>ACESSO RÁPIDO PARA AVALIAÇÃO</span>
            <button style={styles.demoCloseBtn} onClick={() => setShowDemoPanel(false)}>
              <X size={14} />
            </button>
          </div>
          <div style={styles.demoButtonsRow}>
            <button type="button" style={{ ...styles.demoBtn, borderLeft: '3px solid #EAB308' }} onClick={() => handleQuickLogin('admin@cocobambu.com')}>
              Administrador (admin@cocobambu.com)
            </button>
            <button type="button" style={{ ...styles.demoBtn, borderLeft: '3px solid #D49B24' }} onClick={() => handleQuickLogin('gerente.teresina@cocobambu.com')}>
              Gestor Teresina (gerente.teresina@cocobambu.com)
            </button>
            <button type="button" style={{ ...styles.demoBtn, borderLeft: '3px solid #10B981' }} onClick={() => handleQuickLogin('gerente.matriz@cocobambu.com')}>
              Gestor Matriz (gerente.matriz@cocobambu.com)
            </button>
            <button type="button" style={{ ...styles.demoBtn, borderLeft: '3px solid #3B82F6' }} onClick={() => handleQuickLogin('garcom1@cocobambu.com')}>
              Funcionário (garcom1@cocobambu.com)
            </button>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: INSTITUTIONAL AREA (58%) */}
      <div style={styles.leftCol} className="login-left-col">
        {/* Clean Background with Coco Bambu Hero Photo */}
        <img 
          src="/cocobambu_hero_pro.jpg" 
          alt="Coco Bambu Academy" 
          style={styles.heroBackground} 
          className="login-hero-bg"
        />

        {/* Horizontal Gradient Transition to Navy Blue Panel */}
        <div style={styles.rightGradientOverlay} className="login-right-gradient-overlay" />

        {/* Vector Overlay Content */}
        <div style={styles.leftColContent} className="login-left-col-content">
          {/* High-Res Vector Logos */}
          <div style={styles.logosRow} className="login-logos-row">
            <img src="/logos_transparent.png" alt="Coco Bambu | Capybara Labs" style={styles.logosImg} className="login-logos-img" />
          </div>

          {/* Typography Vector Section */}
          <div style={styles.textSection} className="login-text-section">
            <h1 style={styles.mainTitle} className="login-main-title">
              Excelência operacional,<br />
              <span style={{ color: '#EAB308' }}>do treinamento ao salão.</span>
            </h1>
            <p style={styles.subtext} className="login-subtext">
              Desenvolva talentos, alinhe procedimentos e eleve o padrão gastronômico e de atendimento da Rede Coco Bambu.
            </p>
            <div style={styles.accentLine} className="login-accent-line" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AUTHENTICATION AREA (42%) */}
      <div style={styles.rightCol} className="login-right-col">
        <div style={styles.loginCard} className="login-card-box">
          {/* User Icon Circle - Click to toggle demo accounts panel */}
          <div 
            style={styles.avatarCircle} 
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            title="Clique aqui para alternar credenciais de teste"
            className="login-avatar-circle"
          >
            <UserIcon size={28} color="#D49B24" />
          </div>

          {/* Heading */}
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle} className="login-card-title">Bem-vindo!</h2>
            <p style={styles.cardSubtitle} className="login-card-subtitle">Acesse sua conta para continuar</p>
          </div>

          {errorMessage && (
            <div style={styles.errorBox}>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.fieldIcon} />
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  style={styles.inputField}
                  className="login-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.fieldIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  style={styles.inputField}
                  className="login-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div style={styles.actionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Lembrar de mim</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" style={styles.submitBtn} className="login-submit-btn" disabled={loading}>
              <span>{loading ? 'CARREGANDO...' : 'ENTRAR'}</span>
              <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
            </button>

            {/* Recovery Password Link */}
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotStatus({ success: false, message: '' });
                setForgotEmail('');
              }}
              style={styles.forgotBtn}
              className="login-forgot-btn"
            >
              Esqueci minha senha
            </button>
          </form>

          {/* Card Footer */}
          <div style={styles.cardFooter} className="login-card-footer">
            <span style={styles.footerTitle}>COCO BAMBU ACADEMY</span>
            <span style={styles.footerPowered}>
              Powered by <strong style={{ color: '#0F172A' }}>Capybara Labs</strong>
            </span>
          </div>
        </div>
      </div>

      {/* GLOBAL FOOTER FAIXA INFERIOR (8-10%) */}
      <div style={styles.globalFooter} className="login-global-footer">
        <div style={styles.footerInfoItem}>
          <ShieldCheck size={15} color="#F8FAFC" />
          <span>Ambiente seguro</span>
        </div>
        <div style={styles.footerBarSeparator}>|</div>
        <div style={styles.footerInfoItem}>
          <Lock size={14} color="#F8FAFC" />
          <span>Seus dados protegidos</span>
        </div>
        <div style={styles.footerBarSeparator}>|</div>
        <div style={styles.footerInfoItem}>
          <Users size={15} color="#F8FAFC" />
          <span>Desenvolvimento contínuo</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F172A' }}>
                <Sparkles size={20} color="#D49B24" />
                Recuperar Senha
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowForgotModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="modal-body">
                {forgotStatus.message ? (
                  <div style={forgotStatus.success ? styles.modalSuccess : styles.modalError}>
                    {forgotStatus.success && <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />}
                    <span>{forgotStatus.message}</span>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Digite seu e-mail corporativo cadastrado para receber as instruções de recuperação de senha.
                  </p>
                )}
                
                {!forgotStatus.success && (
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#475569' }}>E-mail corporativo</label>
                    <input
                      type="email"
                      className="form-input"
                      style={{ color: '#0f172a', backgroundColor: '#fff', borderColor: '#cbd5e1' }}
                      placeholder="seu.nome@cocobambu.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" style={{ borderColor: '#cbd5e1', color: '#475569' }} onClick={() => setShowForgotModal(false)}>
                  Fechar
                </button>
                {!forgotStatus.success && (
                  <button type="submit" className="btn btn-primary">
                    Enviar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Responsive Overrides */}
      <style>{`
        @media (max-height: 700px) and (min-width: 769px) {
          .login-viewport {
            height: 100vh !important;
            overflow: hidden !important;
          }
          .login-left-col-content {
            padding: 35px 40px !important;
          }
          .login-logos-img {
            height: clamp(90px, 11vh, 120px) !important;
            width: auto !important;
          }
          .login-main-title {
            font-size: 1.6rem !important;
            margin-bottom: 0.5rem !important;
          }
          .login-subtext {
            font-size: 0.82rem !important;
            margin-bottom: 0.75rem !important;
          }
          .login-right-col {
            padding: 1rem !important;
          }
          .login-card-box {
            padding: 1.5rem 1.75rem !important;
            max-height: 85vh !important;
            height: auto !important;
          }
          .login-avatar-circle {
            width: 44px !important;
            height: 44px !important;
            margin-bottom: 0.75rem !important;
          }
          .login-avatar-circle svg {
            width: 20px !important;
            height: 20px !important;
          }
          .cardHeader {
            margin-bottom: 0.75rem !important;
          }
          .login-card-title {
            font-size: 1.45rem !important;
          }
          .login-card-subtitle {
            font-size: 0.8rem !important;
          }
          .form {
            gap: 0.6rem !important;
          }
          .formGroup {
            gap: 0.35rem !important;
          }
          .login-input-field {
            padding: 0.65rem 1rem 0.65rem 2.5rem !important;
            font-size: 0.85rem !important;
          }
          .login-submit-btn {
            padding: 0.75rem !important;
            font-size: 0.85rem !important;
          }
          .login-forgot-btn {
            margin-top: 0.25rem !important;
            font-size: 0.8rem !important;
          }
          .login-card-footer {
            margin-top: 1.25rem !important;
            padding-top: 0.85rem !important;
          }
        }
        @media (max-width: 768px) {
          .login-viewport {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
          }
          .login-left-col {
            flex: none !important;
            width: 100% !important;
            min-height: 380px !important;
            height: auto !important;
          }
          .login-left-col-content {
            padding: 2.5rem 1.5rem !important;
            align-items: center !important;
            text-align: center !important;
          }
          .login-logos-badge {
            margin: 0 auto !important;
          }
          .login-logos-img {
            margin: 0 auto !important;
            height: 75px !important;
            width: auto !important;
          }
          .login-right-gradient-overlay {
            width: 100% !important;
            height: 50% !important;
            top: auto !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            background: linear-gradient(to bottom, rgba(7, 20, 38, 0) 0%, rgba(7, 20, 38, 0.6) 50%, #071426 100%) !important;
          }
          .login-accent-line {
            margin: 0 auto !important;
          }
          .login-global-footer {
            display: none !important;
          }
          .login-right-col {
            flex: none !important;
            width: 100% !important;
            padding: 2rem 1.5rem !important;
          }
          .login-right-col > div {
            max-width: 100% !important;
            padding: 2.5rem 1.5rem !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#071426', // Right panel and global base background
    fontFamily: "'Inter', sans-serif",
    position: 'relative'
  },
  leftCol: {
    flex: '0 0 58%', // Exactly 58% width
    backgroundColor: '#071426', // Uniform deep navy base
    position: 'relative',
    height: '91vh', // Keeps height above the global footer bar
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    zIndex: 1,
    pointerEvents: 'none'
  },
  rightGradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '45%',
    background: 'linear-gradient(to right, rgba(7, 20, 38, 0) 0%, rgba(7, 20, 38, 0.25) 25%, rgba(7, 20, 38, 0.65) 60%, rgba(7, 20, 38, 0.94) 85%, #071426 100%)',
    zIndex: 2,
    pointerEvents: 'none'
  },
  leftColContent: {
    position: 'relative',
    zIndex: 3,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '45px 45px 2rem 45px', // Professional 45px margin from top and left edges
    background: 'linear-gradient(125deg, rgba(7, 20, 38, 0.85) 0%, rgba(7, 20, 38, 0.5) 42%, rgba(7, 20, 38, 0.1) 75%, transparent 100%)',
    boxSizing: 'border-box'
  },
  logosRow: {
    marginBottom: 'clamp(1.5rem, 3.5vh, 2.5rem)',
    width: '100%'
  },
  logosImg: {
    width: 'auto',
    height: 'clamp(110px, 13.5vh, 160px)', // ~2x visual size
    maxWidth: '100%',
    display: 'block',
    objectFit: 'contain',
    objectPosition: 'left center',
    filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))'
  },
  textSection: {
    maxWidth: '540px',
    width: '100%',
    marginTop: '0'
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(1.85rem, 2.7vw, 2.75rem)',
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: '1.16',
    letterSpacing: '-0.025em',
    marginBottom: '1rem',
    textShadow: '0 3px 12px rgba(0, 0, 0, 0.6)'
  },
  subtext: {
    fontSize: 'clamp(0.92rem, 1.15vw, 1.1rem)',
    color: 'rgba(241, 245, 249, 0.95)',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    maxWidth: '460px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
    fontWeight: '400'
  },
  accentLine: {
    width: '64px',
    height: '4px',
    backgroundColor: '#D49B24', // Warm gold line
    borderRadius: '2px',
    boxShadow: '0 2px 8px rgba(212, 155, 36, 0.6)'
  },
  rightCol: {
    flex: '0 0 42%', // Exactly 42% width
    backgroundColor: '#071426', // Uniform deep navy background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
    height: '91vh' // Keeps height above the global footer bar
  },
  loginCard: {
    width: 'min(450px, calc(100% - 48px))', // responsive width
    height: 'auto', // dynamic height
    maxHeight: 'calc(100% - 10px)',
    backgroundColor: '#FFFFFF', // clean white card
    borderRadius: '24px', // Elegant border radius 20-24px
    padding: '2.25rem 2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', // soft shadow
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#1E293B',
    boxSizing: 'border-box',
    zIndex: 3
  },
  avatarCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 155, 36, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '1.75rem'
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '0.25rem'
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: '#64748B'
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#EF4444',
    fontSize: '0.8rem',
    marginBottom: '1.25rem',
    textAlign: 'center'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155'
  },
  inputWrapper: {
    position: 'relative',
    width: '100%'
  },
  fieldIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8'
  },
  inputField: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.75rem',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
    outline: 'none'
  },
  eyeBtn: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0.2rem 0'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#64748B',
    cursor: 'pointer'
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: '#D49B24'
  },
  submitBtn: {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #D49B24 0%, #B88017 100%)',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(212, 155, 36, 0.25)'
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: '500',
    textAlign: 'center',
    margin: '0.5rem auto 0 auto'
  },
  cardFooter: {
    width: '100%',
    borderTop: '1px solid #F1F5F9',
    marginTop: '1.5rem', // Separates footer from the form contents cleanly
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem'
  },
  footerTitle: {
    fontSize: '0.725rem',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '0.05em'
  },
  footerPowered: {
    fontSize: '0.775rem',
    color: '#475569'
  },
  // GLOBAL FOOTER BAR (9% height)
  globalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '9vh', // 9% of screen height
    backgroundColor: '#071426', // Solid deep navy color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.25rem',
    padding: '0 2rem',
    zIndex: 10,
    borderTop: '1px solid rgba(255,255,255,0.08)'
  },
  footerInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#E2E8F0', // High contrast elegant off-white text
    fontSize: '0.775rem',
    fontWeight: '400',
    letterSpacing: '0.01em'
  },
  footerBarSeparator: {
    color: 'rgba(255, 255, 255, 0.25)', // Discretely visible vertical separator
    fontSize: '0.75rem',
    userSelect: 'none'
  },
  // FLOATING DEMO PANEL
  demoPanel: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '320px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    animation: 'fadeIn 0.2s ease-out'
  },
  demoPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  demoCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer'
  },
  demoButtonsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  demoBtn: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  demoOpenBtn: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    zIndex: 9999,
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer'
  },
  modalSuccess: {
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#059669',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  modalError: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#EF4444',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center'
  }
};
