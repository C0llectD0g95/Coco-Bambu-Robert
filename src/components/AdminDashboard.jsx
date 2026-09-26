import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { 
  Users, 
  Building2, 
  Grid, 
  Briefcase, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Award, 
  Settings, 
  CheckCircle, 
  X, 
  FileText, 
  Search, 
  Check 
} from 'lucide-react';
import MonthlyScheduleMatrix from './MonthlyScheduleMatrix';

export default function AdminDashboard({ currentUser, currentTab, setCurrentTab }) {
  // DB Table States
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [positions, setPositions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Dashboard consolidated stats
  const [stats, setStats] = useState(null);

  // --- GENERAL CRUD CONTROLLERS ---
  const [editingItem, setEditingItem] = useState(null); // holds { table, data }
  const [showCrudModal, setShowCrudModal] = useState(false);

  // Filters for Relatórios
  const [filterUnit, setFilterUnit] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  
  const triggerToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, [currentTab]);

  const loadData = async () => {
    try {
      const [u, un, sec, pos, doc, act, q, asg, tr, sch, st] = await Promise.all([
        supabaseService.getTable('users'),
        supabaseService.getTable('units'),
        supabaseService.getTable('departments'),
        supabaseService.getTable('positions'),
        supabaseService.getTable('documents'),
        supabaseService.getTable('activities'),
        supabaseService.getTable('questions'),
        supabaseService.getTable('activity_assignments'),
        supabaseService.getTable('trainings'),
        supabaseService.getTable('work_schedules'),
        supabaseService.getAdminStats()
      ]);

      setUsers(u);
      setUnits(un);
      setSectors(sec);
      setPositions(pos);
      setDocuments(doc);
      setActivities(act);
      setQuestions(q);
      setAssignments(asg);
      setTrainings(tr);
      setSchedules(sch);
      setStats(st);
    } catch (e) {
      console.error('Error loading admin dashboard:', e);
    }
  };

  // --- CRUD ACTIONS ---
  const handleOpenCreate = (table) => {
    let initialData = {};
    if (table === 'users') {
      initialData = { name: '', email: '', role: 'funcionario', unit_id: '', department_id: '', position_id: '', status: 'active', password: '123' };
    } else if (table === 'units') {
      initialData = { name: '', company_id: 'cb' };
    } else if (table === 'departments') {
      initialData = { name: '' };
    } else if (table === 'positions') {
      initialData = { name: '', department_id: '' };
    } else if (table === 'documents') {
      initialData = { name: '', category: 'Procedimentos', sector_id: '', unit_id: '', version: 'v1.0', date: new Date().toISOString().split('T')[0], status: 'active', fileContent: '' };
    }

    setEditingItem({ table, data: initialData });
    setShowCrudModal(true);
  };

  const handleOpenEdit = (table, item) => {
    setEditingItem({ table, data: { ...item } });
    setShowCrudModal(true);
  };

  const handleDelete = async (table, id) => {
    if (confirm(`Tem certeza que deseja excluir este item de ${table}?`)) {
      await supabaseService.deleteItem(table, id);
      triggerToast('Item excluído com sucesso.');
      loadData();
    }
  };

  const handleSaveCrud = async (e) => {
    e.preventDefault();
    const { table, data } = editingItem;

    if (table === 'users' && (!data.name || !data.email)) {
      triggerToast('Preencha os campos obrigatórios.', true);
      return;
    }
    if (table === 'units' && !data.name) {
      triggerToast('Preencha o nome da unidade.', true);
      return;
    }
    if (table === 'departments' && !data.name) {
      triggerToast('Preencha o nome do setor.', true);
      return;
    }
    if (table === 'positions' && (!data.name || !data.department_id)) {
      triggerToast('Preencha o nome e selecione o setor.', true);
      return;
    }
    if (table === 'documents' && (!data.name || !data.fileContent)) {
      triggerToast('Preencha o título e conteúdo do documento.', true);
      return;
    }

    await supabaseService.saveItem(table, data);
    triggerToast('Alterações salvas com sucesso.');
    setShowCrudModal(false);
    setEditingItem(null);
    loadData();
  };

  return (
    <div className="content-body">
      {/* Toast alert display */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeftColor: toastMessage.isError ? '#EF4444' : '#10B981' }}>
            {toastMessage.text}
          </div>
        </div>
      )}

      {/* TAB: DASHBOARD (ADMIN SUMMARY) */}
      {currentTab === 'dashboard' && stats && (
        <div className="animated-fade">
          <div style={{ marginBottom: '2.25rem', borderBottom: '1px solid #EAE3D9', paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#281D17', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Painel Administrativo
            </h1>
            <p style={{ color: '#8A7B70', fontSize: '0.95rem', marginBottom: '0.65rem' }}>
              Métricas corporativas consolidadas de todas as unidades Coco Bambu.
            </p>
            <div style={{ fontSize: '0.825rem', color: '#8A7B70', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#C9A24A', fontWeight: '600' }}>Administração Geral</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Metrics cards grid */}
          <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>FUNCIONÁRIOS ATIVOS</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(201, 162, 74, 0.1)' }}>
                  <Users size={18} color="#C9A24A" />
                </div>
              </div>
              <div style={styles.kpiValue}>{stats.active_employees}</div>
              <div style={styles.kpiSubText}>Sob supervisão de {stats.gestores_count} gestores</div>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>UNIDADES ATIVAS</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(90, 57, 37, 0.08)' }}>
                  <Building2 size={18} color="#5A3925" />
                </div>
              </div>
              <div style={styles.kpiValue}>{stats.units_count}</div>
              <div style={styles.kpiSubText}>Coco Bambu Brasil</div>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>APROVEITAMENTO GERAL</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(30, 126, 78, 0.1)' }}>
                  <TrendingUp size={18} color="#1E7E4E" />
                </div>
              </div>
              <div style={styles.kpiValue}>{stats.general_average > 0 ? `${stats.general_average * 10}%` : '85%'}</div>
              <div style={styles.kpiSubText}>Média em {stats.assignments_completed} avaliações</div>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>GUIAS OPERACIONAIS</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(201, 162, 74, 0.1)' }}>
                  <BookOpen size={18} color="#C9A24A" />
                </div>
              </div>
              <div style={styles.kpiValue}>{documents.length}</div>
              <div style={styles.kpiSubText}>Documentos oficiais cadastrados</div>
            </div>
          </div>

          {/* Horizontal Performance Chart: Média de Desempenho por Unidade */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#281D17' }}>
                  Média de Desempenho por Unidade
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#8A7B70', marginTop: '0.2rem' }}>
                  Aproveitamento acadêmico e operacional por restaurante
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#C9A24A', backgroundColor: 'rgba(201, 162, 74, 0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', letterSpacing: '0.03em' }}>
                Consolidado
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(stats?.by_unit || []).map((unit) => {
                const pct = unit.average > 0 ? Math.min(100, Math.round(unit.average * 10)) : 82;
                return (
                  <div key={unit.unit_name} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: '600', color: '#281D17' }}>{unit.unit_name}</span>
                      <span style={{ fontWeight: '700', color: '#C9A24A', fontSize: '0.95rem' }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#F0EAE1', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #5A3925 0%, #C9A24A 100%)', 
                          borderRadius: '5px',
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: USUARIOS CRUD */}
      {currentTab === 'usuarios' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gerenciamento de Usuários</h1>
              <p style={{ color: 'var(--text-muted)' }}>Cadastre e gerencie colaboradores, gestores e administradores.</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenCreate('users')}>
              <Plus size={18} />
              Novo Usuário
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Unidade</th>
                  <th>Setor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const unit = units.find(un => un.id === u.unit_id);
                  const sector = sectors.find(s => s.id === u.department_id);
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'gestor' ? 'badge-warning' : 'badge-success'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{unit ? unit.name : '-'}</td>
                      <td>{sector ? sector.name : '-'}</td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit('users', u)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('users', u.id)} disabled={u.id === currentUser.id}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: UNIDADES CRUD */}
      {currentTab === 'unidades' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gestão de Unidades</h1>
              <p style={{ color: 'var(--text-muted)' }}>Configure as filiais do Coco Bambu.</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenCreate('units')}>
              <Plus size={18} />
              Nova Unidade
            </button>
          </div>

          <div className="table-container" style={{ maxWidth: '600px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Unidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {units.map(un => (
                  <tr key={un.id}>
                    <td>{un.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{un.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit('units', un)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete('units', un.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SETORES CRUD */}
      {currentTab === 'setores' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gestão de Setores (Departamentos)</h1>
              <p style={{ color: 'var(--text-muted)' }}>Estruture os setores operacionais das unidades.</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenCreate('departments')}>
              <Plus size={18} />
              Novo Setor
            </button>
          </div>

          <div className="table-container" style={{ maxWidth: '600px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Setor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map(sec => (
                  <tr key={sec.id}>
                    <td>{sec.id}</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{sec.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit('departments', sec)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete('departments', sec.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CARGOS CRUD */}
      {currentTab === 'cargos' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gerenciamento de Cargos</h1>
              <p style={{ color: 'var(--text-muted)' }}>Crie e atribua cargos específicos aos setores.</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenCreate('positions')}>
              <Plus size={18} />
              Novo Cargo
            </button>
          </div>

          <div className="table-container" style={{ maxWidth: '700px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cargo</th>
                  <th>Setor Correspondente</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const sec = sectors.find(s => s.id === pos.department_id);
                  return (
                    <tr key={pos.id}>
                      <td>{pos.id}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{pos.name}</td>
                      <td>{sec ? sec.name : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit('positions', pos)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('positions', pos.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CONHECIMENTO (GUIDES MANAGER) */}
      {currentTab === 'conhecimento' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Biblioteca de Guias Operacionais</h1>
              <p style={{ color: 'var(--text-muted)' }}>Cadastre e gerencie a documentação oficial da operação Coco Bambu.</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenCreate('documents')}>
              <Plus size={18} />
              Novo Documento
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Setor</th>
                  <th>Versão</th>
                  <th>Data Upload</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const sec = sectors.find(s => s.id === doc.sector_id);
                  return (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{doc.name}</td>
                      <td>
                        <span className="badge badge-info">{doc.category}</span>
                      </td>
                      <td>{sec ? sec.name : 'Geral'}</td>
                      <td>{doc.version}</td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`badge ${doc.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {doc.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit('documents', doc)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('documents', doc.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ATIVIDADES (Visão Admin Geral) */}
      {currentTab === 'atividades' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gerenciamento de Atividades & Questionários</h1>
              <p style={{ color: 'var(--text-muted)' }}>Lista de todas as atividades e testes cadastrados na plataforma.</p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Setor</th>
                  <th>Público Alvo</th>
                  <th>Status</th>
                  <th>Total de Questões</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(act => {
                  const sec = sectors.find(s => s.id === act.sector_id);
                  const qCount = questions.filter(q => q.activity_id === act.id).length;
                  return (
                    <tr key={act.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{act.title}</td>
                      <td>{sec ? sec.name : 'Geral'}</td>
                      <td>{act.target_audience || 'Todos'}</td>
                      <td>
                        <span className={`badge ${act.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {act.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{qCount} questões</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CAPACITACOES (Visão Admin Geral) */}
      {currentTab === 'capacitacoes' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Capacitações e Treinamentos Cadastrados</h1>
              <p style={{ color: 'var(--text-muted)' }}>Panorama geral de todos os treinamentos agendados na rede.</p>
            </div>
          </div>

          <div className="grid-cols-2">
            {trainings.map(tr => {
              const un = units.find(u => u.id === tr.unit_id);
              const sec = sectors.find(s => s.id === tr.sector_id);
              return (
                <div key={tr.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex-between">
                    <span className="badge badge-info">{tr.theme}</span>
                    {tr.is_mandatory && <span className="badge badge-danger">OBRIGATÓRIO</span>}
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-title)' }}>{tr.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {tr.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div><strong>Unidade:</strong> {un ? un.name : 'Todas'}</div>
                    <div><strong>Setor:</strong> {sec ? sec.name : 'Geral'}</div>
                    <div><strong>Data:</strong> {tr.date} ({tr.time})</div>
                  </div>
                </div>
              );
            })}
          </div>

          {trainings.length === 0 && (
            <div className="empty-state">
              <Award className="empty-state-icon" />
              <div className="empty-state-title">Nenhum treinamento agendado</div>
              <div className="empty-state-desc">Não há treinamentos futuros agendados no momento.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ESCALAS (Visão Admin Geral em Matriz Mensal) */}
      {currentTab === 'escala' && (
        <div className="animated-fade">
          <MonthlyScheduleMatrix currentUser={currentUser} canEdit={true} />
        </div>
      )}

      {/* TAB: RELATORIOS CONSOLIDADOS */}
      {currentTab === 'relatorios' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Relatórios de Desempenho Consolidados</h1>
              <p style={{ color: 'var(--text-muted)' }}>Acompanhe os resultados de testes e capacitações de todas as unidades da rede.</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const completedList = assignments.filter(a => a.status === 'completed');
                const csvHeader = "Funcionario,Unidade,Setor,Atividade,Nota,Data,Resultado\n";
                const csvRows = completedList.map(asg => {
                  const emp = users.find(u => u.id === asg.user_id);
                  const act = activities.find(a => a.id === asg.activity_id);
                  const empUnit = units.find(un => un.id === emp?.unit_id);
                  const empSector = sectors.find(s => s.id === emp?.department_id);
                  return `"${emp?.name || ''}","${empUnit?.name || ''}","${empSector?.name || ''}","${act?.title || ''}",${asg.score},"${new Date(asg.completion_date).toLocaleDateString()}","${asg.score >= 7 ? 'Aprovado' : 'Recuperação'}"`;
                }).join("\n");

                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `Relatorio_Desempenho_CocoBambu_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                triggerToast('Relatório exportado em CSV com sucesso!');
              }}
            >
              Exportar Relatório CSV
            </button>
          </div>

          {/* Cards de Métricas Consolidadas */}
          {(() => {
            const completed = assignments.filter(asg => asg.status === 'completed');
            const totalCount = completed.length;
            const avgScore = totalCount > 0 ? (completed.reduce((acc, a) => acc + (a.score || 0), 0) / totalCount).toFixed(1) : '0';
            const passCount = completed.filter(a => a.score >= 7).length;
            const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

            return (
              <div className="grid-cols-3" style={{ marginBottom: '1.5rem', gap: '1.25rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVALIAÇÕES CONCLUÍDAS</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-title)', marginTop: '0.25rem' }}>{totalCount}</div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>testes finalizados</span>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MÉDIA GERAL DA REDE</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: Number(avgScore) >= 7 ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '0.25rem' }}>{avgScore} / 10</div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>nota média global</span>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TAXA DE APROVAÇÃO</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: passRate >= 70 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '0.25rem' }}>{passRate}%</div>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>colaboradores aprovados</span>
                </div>
              </div>
            );
          })()}

          {/* Filters section */}
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Filtrar por Unidade</label>
              <select className="form-select" value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
                <option value="">Todas as Unidades</option>
                {units.map(un => (
                  <option key={un.id} value={un.id}>{un.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Filtrar por Setor</label>
              <select className="form-select" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
                <option value="">Todos os Setores</option>
                {sectors.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">Buscar Colaborador</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nome do colaborador..." 
                  style={{ paddingLeft: '2.25rem' }} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Unidade</th>
                  <th>Setor</th>
                  <th>Atividade</th>
                  <th>Nota</th>
                  <th>Data de Conclusão</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredLogs = assignments
                    .filter(asg => asg.status === 'completed')
                    .filter(asg => {
                      const emp = users.find(u => u.id === asg.user_id);
                      if (filterUnit && emp?.unit_id !== filterUnit) return false;
                      if (filterSector && emp?.department_id !== filterSector) return false;
                      if (searchQuery && !emp?.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    });

                  if (filteredLogs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          Nenhum registro de teste encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    );
                  }

                  return filteredLogs.map(asg => {
                    const emp = users.find(u => u.id === asg.user_id);
                    const act = activities.find(a => a.id === asg.activity_id);
                    const empUnit = units.find(un => un.id === emp?.unit_id);
                    const empSector = sectors.find(s => s.id === emp?.department_id);

                    return (
                      <tr key={asg.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{emp ? emp.name : 'Desconhecido'}</td>
                        <td>{empUnit ? empUnit.name : 'Matriz'}</td>
                        <td>{empSector ? empSector.name : 'Geral'}</td>
                        <td>{act ? act.title : 'Atividade Operacional'}</td>
                        <td style={{ fontWeight: 'bold', color: asg.score >= 7 ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {asg.score}/10
                        </td>
                        <td>{new Date(asg.completion_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${asg.score >= 7 ? 'badge-success' : 'badge-danger'}`}>
                            {asg.score >= 7 ? 'Aprovado' : 'Recuperação'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CONFIGURACOES */}
      {currentTab === 'configuracoes' && (
        <div className="animated-fade">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Configurações Globais</h1>
            <p style={{ color: 'var(--text-muted)' }}>Configurações do sistema Capybara AI Academy e integrações de dados.</p>
          </div>

          <div className="card" style={{ maxWidth: '600px' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Parâmetros da Plataforma</h3>
            <form onSubmit={(e) => { e.preventDefault(); triggerToast('Configurações salvas!'); }}>
              <div className="form-group">
                <label className="form-label">Nome do Sistema</label>
                <input type="text" className="form-input" defaultValue="Capybara AI Academy — Coco Bambu" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Servidor Supabase Endpoint</label>
                <input type="text" className="form-input" defaultValue="https://tavqpyjysqgq.supabase.co" />
              </div>

              <div className="form-group">
                <label className="form-label">Supabase Key (Simulada)</label>
                <input type="password" className="form-input" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Nota de Corte Média</label>
                  <input type="number" className="form-input" defaultValue="7" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiração de Sessão (Hrs)</label>
                  <input type="number" className="form-input" defaultValue="24" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Salvar Configurações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- DYNAMIC CRUD MODAL -------------------- */}
      {showCrudModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: editingItem.table === 'documents' ? '700px' : '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem.data.id ? 'Editar Registro' : 'Novo Registro'} — {editingItem.table.toUpperCase()}
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowCrudModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCrud}>
              <div className="modal-body">
                {/* USER FORM LAYOUT */}
                {editingItem.table === 'users' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Nome Completo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={editingItem.data.email} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, email: e.target.value } })}
                        required
                      />
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Perfil de Acesso</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.role}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, role: e.target.value } })}
                        >
                          <option value="funcionario">Funcionário</option>
                          <option value="gestor">Gestor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.status}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-cols-3">
                      <div className="form-group">
                        <label className="form-label">Unidade</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.unit_id}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, unit_id: e.target.value } })}
                        >
                          <option value="">Nenhuma / Admin</option>
                          {units.map(un => <option key={un.id} value={un.id}>{un.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Setor</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.department_id}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, department_id: e.target.value } })}
                        >
                          <option value="">Nenhum / Admin</option>
                          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cargo</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.position_id}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, position_id: e.target.value } })}
                        >
                          <option value="">Nenhum / Admin</option>
                          {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Senha Provisória</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={editingItem.data.password} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, password: e.target.value } })}
                      />
                    </div>
                  </>
                )}

                {/* UNIT FORM LAYOUT */}
                {editingItem.table === 'units' && (
                  <div className="form-group">
                    <label className="form-label">Nome da Unidade Coco Bambu</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingItem.data.name} 
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                      required
                    />
                  </div>
                )}

                {/* SECTOR FORM LAYOUT */}
                {editingItem.table === 'departments' && (
                  <div className="form-group">
                    <label className="form-label">Nome do Setor</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingItem.data.name} 
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                      required
                    />
                  </div>
                )}

                {/* POSITION FORM LAYOUT */}
                {editingItem.table === 'positions' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Nome do Cargo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Setor Pertencente</label>
                      <select 
                        className="form-select"
                        value={editingItem.data.department_id}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, department_id: e.target.value } })}
                        required
                      >
                        <option value="">Selecione o Setor</option>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* DOCUMENTS FORM LAYOUT */}
                {editingItem.table === 'documents' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Título do Documento</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                        required
                      />
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Categoria</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.category}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        >
                          <option value="Procedimentos">Procedimentos</option>
                          <option value="Padrões">Padrões</option>
                          <option value="Checklists">Checklists</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Setor Vinculado</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.sector_id}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, sector_id: e.target.value } })}
                        >
                          <option value="">Geral / Todos</option>
                          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label">Versão</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingItem.data.version} 
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, version: e.target.value } })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select"
                          value={editingItem.data.status}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, status: e.target.value } })}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Conteúdo do Guide / Instruções Oficiais</label>
                      <textarea 
                        className="form-textarea" 
                        rows="5"
                        placeholder="Copie as informações ou diretrizes operacionais aqui..."
                        value={editingItem.data.fileContent} 
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, fileContent: e.target.value } })}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCrudModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#8A7B70',
    letterSpacing: '0.05em'
  },
  kpiValue: {
    fontSize: '2.25rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: '#281D17',
    marginBottom: '0.25rem'
  },
  kpiSubText: {
    fontSize: '0.775rem',
    color: '#8A7B70'
  },
  chartWrapper: {
    padding: '1rem 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  }
};
