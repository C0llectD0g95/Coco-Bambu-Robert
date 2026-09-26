import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  HelpCircle, 
  Inbox, 
  Play, 
  Search, 
  TrendingUp, 
  User, 
  AlertTriangle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import MonthlyScheduleMatrix from './MonthlyScheduleMatrix';

export default function EmployeeDashboard({ currentUser, currentTab, setCurrentTab }) {
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [warmups, setWarmups] = useState([]);
  
  // Activity taking flow state
  const [activeActivity, setActiveActivity] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: 'A' }
  const [examResult, setExamResult] = useState(null); // { score, total, questions }
  const [showExplanation, setShowExplanation] = useState(false);

  // Search / Filters
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Load data
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, currentTab]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [acts, docs, warps, train, schs] = await Promise.all([
        supabaseService.getEmployeeActivities(currentUser),
        supabaseService.getDocuments(currentUser),
        supabaseService.getWarmups(currentUser),
        supabaseService.getTrainings(currentUser),
        supabaseService.getWorkSchedules(currentUser.id)
      ]);

      setActivities(acts);
      setDocuments(docs);
      setWarmups(warps);
      setTrainings(train);
      setSchedules(schs);
    } catch (e) {
      console.error('Error loading employee data:', e);
    }
  };

  // Activity taking handlers
  const startExam = async (activity) => {
    // Fetch questions for this activity from Supabase
    const sortedQs = await supabaseService.getActivityQuestions(activity.id);
    
    setActiveActivity({
      ...activity,
      questions: sortedQs
    });
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setExamResult(null);
    setShowExplanation(false);
    setCurrentTab('atividades'); // switch context tab to show exam screen
  };

  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeActivity.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const finishExam = async () => {
    // Validate that all questions are answered
    const unanswered = activeActivity.questions.filter(q => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      alert(`Por favor, responda todas as questões. Restam ${unanswered.length} pendentes.`);
      return;
    }

    const payload = activeActivity.questions.map(q => ({
      question_id: q.id,
      chosen_option: selectedAnswers[q.id]
    }));

    const res = await supabaseService.submitActivity(currentUser.id, activeActivity.id, payload);
    if (res.success) {
      // Reload activities list
      loadData();
      
      // Load details for showing correction page
      const details = await supabaseService.getAssignmentDetails(res.assignment.id);
      setExamResult(details);
    }
  };

  // Stats calculation for Dashboard
  const completedAssignments = activities.filter(a => a.status_assignment === 'completed');
  const pendingAssignments = activities.filter(a => a.status_assignment === 'pending');
  const averageGrade = completedAssignments.length > 0
    ? parseFloat((completedAssignments.reduce((acc, a) => acc + (a.score || 0), 0) / completedAssignments.length).toFixed(1))
    : 0;
  const completionPercentage = activities.length > 0
    ? Math.round((completedAssignments.length / activities.length) * 100)
    : 0;

  // Active today activity helper
  const todayActivity = pendingAssignments[0] || null;

  return (
    <div className="content-body">
      {/* -------------------- 1. EXAM FLOW VIEW -------------------- */}
      {activeActivity && !examResult && (
        <div style={styles.examContainer} className="animated-fade">
          <div className="card" style={{ maxWidth: '700px', width: '100%' }}>
            <div style={styles.examHeader}>
              <div>
                <span style={styles.examPreTitle}>Atividade em Andamento</span>
                <h2 style={styles.examTitle}>{activeActivity.title}</h2>
              </div>
              <span className="badge badge-info">
                Questão {currentQuestionIdx + 1} de {activeActivity.questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBarWrapper}>
              <div 
                style={{ 
                  ...styles.progressBarFill, 
                  width: `${((currentQuestionIdx + 1) / activeActivity.questions.length) * 100}%` 
                }} 
              />
            </div>

            {/* Question Box */}
            <div style={styles.questionBox}>
              <p style={styles.questionText}>
                {activeActivity.questions[currentQuestionIdx]?.question_text}
              </p>

              <div style={styles.optionsList}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const qId = activeActivity.questions[currentQuestionIdx]?.id;
                  const optTextKey = `option_${opt.toLowerCase()}`;
                  const optText = activeActivity.questions[currentQuestionIdx]?.[optTextKey];
                  const isSelected = selectedAnswers[qId] === opt;

                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(qId, opt)}
                      style={{
                        ...styles.optionBtn,
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-block)',
                        color: isSelected ? 'var(--text-title)' : 'var(--text-main)'
                      }}
                    >
                      <span style={{
                        ...styles.optionLetter,
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                        color: isSelected ? '#0b0f19' : 'var(--text-muted)'
                      }}>
                        {opt}
                      </span>
                      <span style={styles.optionContent}>{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.examFooter}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrevQuestion} 
                disabled={currentQuestionIdx === 0}
              >
                Anterior
              </button>

              {currentQuestionIdx < activeActivity.questions.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswers[activeActivity.questions[currentQuestionIdx]?.id]}
                >
                  Próxima
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={finishExam}
                  disabled={!selectedAnswers[activeActivity.questions[currentQuestionIdx]?.id]}
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  Finalizar atividade
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. EXAM CORRECTION VIEW -------------------- */}
      {activeActivity && examResult && (
        <div style={styles.examContainer} className="animated-fade">
          <div className="card" style={{ maxWidth: '750px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <CheckCircle size={56} color="var(--color-success)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem' }}>Atividade Concluída!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Os seus dados foram corrigidos e computados no sistema.
              </p>
            </div>

            {/* Score Ring / Block */}
            <div style={styles.scoreBlock}>
              <div style={styles.scoreItem}>
                <span style={styles.scoreLabel}>Nota Geral</span>
                <span style={{ 
                  ...styles.scoreValue, 
                  color: examResult.assignment.score >= 7 ? 'var(--color-success)' : 'var(--color-error)' 
                }}>
                  {examResult.assignment.score}/{examResult.assignment.max_score}
                </span>
              </div>
              <div style={styles.scoreItem}>
                <span style={styles.scoreLabel}>Aproveitamento</span>
                <span style={{ 
                  ...styles.scoreValue,
                  color: examResult.assignment.score >= 7 ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                  {Math.round((examResult.assignment.score / examResult.assignment.max_score) * 100)}%
                </span>
              </div>
              <div style={styles.scoreItem}>
                <span style={styles.scoreLabel}>Status</span>
                <span className={`badge ${examResult.assignment.score >= 7 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                  {examResult.assignment.score >= 7 ? 'Aprovado' : 'Reforço Necessário'}
                </span>
              </div>
            </div>

            {/* Show Explanations/Correction Details Toggle */}
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginBottom: '1.5rem' }}
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? 'Ocultar Correção Detalhada' : 'Visualizar Correção Detalhada (Gabarito)'}
            </button>

            {showExplanation && (
              <div style={styles.gabaritoList}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-title)' }}>Revisão de Questões:</h4>
                {examResult.questions.map((q, idx) => (
                  <div 
                    key={q.id} 
                    style={{ 
                      ...styles.gabaritoItem,
                      borderColor: q.is_correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      backgroundColor: q.is_correct ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>Questão {idx + 1}</span>
                      <span className={q.is_correct ? 'badge badge-success' : 'badge-danger badge'}>
                        {q.is_correct ? 'Acertou' : `Errou (Marcou ${q.chosen_option})`}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-title)' }}>{q.question_text}</p>
                    
                    <div style={styles.gabaritoOptionsList}>
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const isCorrectOpt = q.correct_option === opt;
                        const isSelectedOpt = q.chosen_option === opt;
                        return (
                          <div 
                            key={opt}
                            style={{
                              ...styles.gabaritoOption,
                              color: isCorrectOpt ? 'var(--color-success)' : isSelectedOpt ? 'var(--color-error)' : 'var(--text-muted)',
                              fontWeight: isCorrectOpt ? 'bold' : 'normal'
                            }}
                          >
                            <span>({opt}) {q[`option_${opt.toLowerCase()}`]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={styles.explanationBox}>
                        <strong style={{ color: '#EAB308', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Explicação:</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setActiveActivity(null);
                  setExamResult(null);
                  setCurrentTab('dashboard'); // go back to dashboard
                }}
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. PORTAL TABS -------------------- */}
      {!activeActivity && (
        <>
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="animated-fade">
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-title)', marginBottom: '0.25rem' }}>
                  Bom dia, {currentUser.name.split(' ')[0]}!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Veja suas pendências e progresso de capacitação.
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{currentUser.unit_id === 'u-teresina' ? 'Coco Bambu - Teresina' : currentUser.unit_id === 'u-matriz' ? 'Coco Bambu - Matriz' : 'Geral'}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div style={styles.kpiHeader}>
                    <span style={styles.kpiLabel}>Aproveitamento Médio</span>
                    <TrendingUp size={20} color="#10B981" />
                  </div>
                  <div style={styles.kpiValue}>{averageGrade > 0 ? `${averageGrade * 10}%` : '0%'}</div>
                  <div style={styles.kpiSubText}>Baseado em {completedAssignments.length} avaliações</div>
                </div>

                <div className="card">
                  <div style={styles.kpiHeader}>
                    <span style={styles.kpiLabel}>Pendências</span>
                    <AlertTriangle size={20} color={pendingAssignments.length > 0 ? '#EAB308' : '#94A3B8'} />
                  </div>
                  <div style={{ ...styles.kpiValue, color: pendingAssignments.length > 0 ? '#EAB308' : '#F8FAFC' }}>
                    {pendingAssignments.length}
                  </div>
                  <div style={styles.kpiSubText}>Atividades a realizar</div>
                </div>

                <div className="card">
                  <div style={styles.kpiHeader}>
                    <span style={styles.kpiLabel}>Próxima Capacitação</span>
                    <Calendar size={20} color="#3B82F6" />
                  </div>
                  <div style={{ ...styles.kpiValue, fontSize: '1.2rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                    {trainings.length > 0 ? trainings[0].title : 'Nenhuma marcada'}
                  </div>
                  <div style={styles.kpiSubText}>
                    {trainings.length > 0 ? `${trainings[0].date} às ${trainings[0].time}` : 'Fique atento à escala'}
                  </div>
                </div>

                <div className="card">
                  <div style={styles.kpiHeader}>
                    <span style={styles.kpiLabel}>Atividades Concluídas</span>
                    <CheckCircle size={20} color="#10B981" />
                  </div>
                  <div style={styles.kpiValue}>{completedAssignments.length}</div>
                  <div style={styles.kpiSubText}>No período vigente</div>
                </div>
              </div>

              {/* Today's Activity Card */}
              {todayActivity ? (
                <div className="card" style={{ ...styles.todayCard, marginBottom: '2rem' }}>
                  <div style={styles.todayCardContent}>
                    <div>
                      <span style={styles.todayCardBadge}>ATIVIDADE DE HOJE</span>
                      <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0.25rem 0' }}>{todayActivity.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', maxWidth: '500px' }}>
                        Tema: {todayActivity.theme} • 10 Questões • Prazo: {todayActivity.deadline}
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => startExam(todayActivity)} style={{ background: '#fff', color: '#0b0f19' }}>
                      <Play size={16} fill="#0b0f19" />
                      Começar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ ...styles.todayCardEmpty, marginBottom: '2rem' }}>
                  <CheckCircle size={32} color="#10B981" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>Você está em dia com as atividades!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma atividade pendente para hoje.</p>
                  </div>
                </div>
              )}

              {/* Two Column Section */}
              <div className="grid-cols-2">
                {/* Esquenta / Alinhamento Recente */}
                <div className="card">
                  <h3 className="card-title">
                    <Clock size={20} color="#10B981" />
                    Esquenta de Hoje / Últimos Alinhamentos
                  </h3>
                  {warmups.length > 0 ? (
                    <div style={styles.warmupList}>
                      {warmups.map(w => (
                        <div key={w.id} style={styles.warmupItem}>
                          <div style={styles.warmupHeader}>
                            <h4 style={{ fontSize: '0.95rem' }}>{w.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.date} • {w.shift}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>{w.content}</p>
                          <div style={styles.warmupFooter}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Setor: {currentUser.department_id === 'd-cozinha' ? 'Cozinha' : 'Atendimento'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Inbox className="empty-state-icon" />
                      <div className="empty-state-title">Nenhum esquenta registrado</div>
                      <div className="empty-state-desc">Aguarde o gerente realizar o alinhamento do turno.</div>
                    </div>
                  )}
                </div>

                {/* Últimos Resultados */}
                <div className="card">
                  <h3 className="card-title">
                    <Award size={20} color="#EAB308" />
                    Últimos Resultados obtidos
                  </h3>
                  {completedAssignments.length > 0 ? (
                    <div style={styles.resultsList}>
                      {completedAssignments.map(asg => (
                        <div key={asg.id} style={styles.resultItem}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-title)' }}>{asg.title}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concluído em: {new Date(asg.completion_date).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ 
                              fontSize: '1.15rem', 
                              fontWeight: 'bold', 
                              color: asg.score >= 7 ? 'var(--color-success)' : 'var(--color-error)'
                            }}>
                              {asg.score}/10
                            </span>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                const details = await supabaseService.getAssignmentDetails(asg.assignment_id);
                                setExamResult(details);
                                setActiveActivity(asg);
                              }}
                            >
                              Gabarito
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Inbox className="empty-state-icon" />
                      <div className="empty-state-title">Sem histórico</div>
                      <div className="empty-state-desc">Realize sua primeira atividade para ver as notas aqui.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ATIVIDADES */}
          {currentTab === 'atividades' && (
            <div className="animated-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Avaliações e Atividades</h1>
                <p style={{ color: 'var(--text-muted)' }}>Lista de todas as atividades disponíveis para o seu setor.</p>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Tema</th>
                      <th>Prazo</th>
                      <th>Nota</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(act => (
                      <tr key={act.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{act.title}</td>
                        <td>{act.theme}</td>
                        <td>{act.deadline}</td>
                        <td style={{ fontWeight: 'bold' }}>
                          {act.score !== null ? `${act.score}/10` : '-'}
                        </td>
                        <td>
                          {act.status_assignment === 'completed' ? (
                            <span className="badge badge-success">Concluída</span>
                          ) : (
                            <span className="badge badge-warning">Pendente</span>
                          )}
                        </td>
                        <td>
                          {act.status_assignment === 'completed' ? (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                const details = await supabaseService.getAssignmentDetails(act.assignment_id);
                                setExamResult(details);
                                setActiveActivity(act);
                              }}
                            >
                              Ver Gabarito
                            </button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => startExam(act)}>
                              Responder
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                          Nenhuma atividade ativa no momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CONHECIMENTO */}
          {currentTab === 'conhecimento' && (
            <div className="animated-fade">
              <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Central de Conhecimento</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Documentos, manuais operacionais e Checklists autorizados.</p>
                </div>
                {/* Search input */}
                <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pesquisar guias..."
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid of Documents */}
              <div className="grid-cols-3">
                {documents
                  .filter(doc => doc.name.toLowerCase().includes(searchDoc.toLowerCase()))
                  .map(doc => (
                    <div key={doc.id} className="card" style={styles.docCard}>
                      <div style={styles.docBadgeRow}>
                        <span className="badge badge-info">{doc.category}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.version}</span>
                      </div>
                      <h3 style={styles.docCardTitle}>{doc.name}</h3>
                      <p style={styles.docCardExcerpt}>
                        {doc.fileContent ? doc.fileContent.substring(0, 100) + '...' : 'Sem descrição disponível.'}
                      </p>
                      <div style={styles.docCardFooter}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Atualizado: {doc.date}
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(doc)}>
                          Visualizar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {documents.length === 0 && (
                <div className="empty-state">
                  <BookOpen className="empty-state-icon" />
                  <div className="empty-state-title">Nenhum documento autorizado</div>
                  <div className="empty-state-desc">Você não possui documentos oficiais cadastrados para seu setor.</div>
                </div>
              )}

              {/* Document Detail Modal */}
              {selectedDoc && (
                <div className="modal-overlay">
                  <div className="modal-content" style={{ maxWidth: '650px' }}>
                    <div className="modal-header">
                      <div>
                        <span className="badge badge-info" style={{ marginBottom: '0.25rem' }}>{selectedDoc.category}</span>
                        <h3 className="modal-title">{selectedDoc.name}</h3>
                      </div>
                      <button style={styles.closeBtn} onClick={() => setSelectedDoc(null)}>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="modal-body" style={{ lineHeight: '1.6' }}>
                      <div style={styles.docMetaGrid}>
                        <div><strong>Versão:</strong> {selectedDoc.version}</div>
                        <div><strong>Última Alteração:</strong> {selectedDoc.date}</div>
                        <div><strong>Setor:</strong> {currentUser.department_id === 'd-cozinha' ? 'Cozinha' : 'Atendimento'}</div>
                      </div>
                      <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: 'var(--text-title)' }}>Conteúdo Oficial:</h4>
                      <p style={{ whiteSpace: 'pre-line', color: 'var(--text-main)' }}>{selectedDoc.fileContent}</p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-primary" onClick={() => setSelectedDoc(null)}>
                        Fechar Leitura
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ESCALA (Matriz Mensal) */}
          {currentTab === 'escala' && (
            <div className="animated-fade">
              <MonthlyScheduleMatrix currentUser={currentUser} canEdit={false} />
            </div>
          )}

          {/* TAB: CAPACITACOES */}
          {currentTab === 'capacitacoes' && (
            <div className="animated-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Minhas Capacitações</h1>
                <p style={{ color: 'var(--text-muted)' }}>Lista de treinamentos agendados e capacitações de equipe.</p>
              </div>

              <div className="grid-cols-2">
                {trainings.map(tr => (
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

                    <div style={styles.trMetaRow}>
                      <div style={styles.trMetaItem}>
                        <Calendar size={16} color="#10B981" />
                        <span>{tr.date}</span>
                      </div>
                      <div style={styles.trMetaItem}>
                        <Clock size={16} color="#10B981" />
                        <span>{tr.time} ({tr.duration})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {trainings.length === 0 && (
                <div className="empty-state">
                  <Award className="empty-state-icon" />
                  <div className="empty-state-title">Nenhum treinamento agendado</div>
                  <div className="empty-state-desc">Você está em dia com todas as capacitações.</div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MEU PROGRESSO */}
          {currentTab === 'progresso' && (
            <div className="animated-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Meu Progresso Operacional</h1>
                <p style={{ color: 'var(--text-muted)' }}>Estatísticas de desempenho acumuladas e histórico de avaliações.</p>
              </div>

              {/* Stats overview cards */}
              <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div style={styles.progressStatTitle}>Aproveitamento Geral</div>
                  <div style={{ ...styles.progressStatValue, color: '#10B981' }}>{averageGrade > 0 ? `${averageGrade * 10}%` : '0%'}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Média total de acertos</p>
                </div>
                
                <div className="card">
                  <div style={styles.progressStatTitle}>Atividades Concluídas</div>
                  <div style={styles.progressStatValue}>{completedAssignments.length}/{activities.length}</div>
                  <div style={styles.progressBarWrapper}>
                    <div style={{ ...styles.progressBarFill, width: `${completionPercentage}%` }} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{completionPercentage}% de conclusão</p>
                </div>

                <div className="card">
                  <div style={styles.progressStatTitle}>Tempo Médio por Atividade</div>
                  <div style={styles.progressStatValue}>4m 12s</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agilidade e prontidão operacional</p>
                </div>
              </div>

              {/* Graphic Mock */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Desempenho por Avaliação</h3>
                {completedAssignments.length > 0 ? (
                  <div style={styles.chartWrapper}>
                    {/* SVG Render bar chart */}
                    <svg viewBox="0 0 500 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                      <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border-color)" strokeWidth="2" />
                      {completedAssignments.map((asg, idx) => {
                        const barWidth = 30;
                        const spacing = (500 / completedAssignments.length);
                        const x = idx * spacing + (spacing / 2) - (barWidth / 2);
                        const height = asg.score * 10; // 0 to 100 height
                        const y = 120 - height;
                        return (
                          <g key={asg.id}>
                            {/* Bar shadow */}
                            <rect x={x} y={y} width={barWidth} height={height} rx="4" fill="url(#barGrad)" />
                            {/* Label */}
                            <text x={x + barWidth/2} y={y - 8} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{asg.score}/10</text>
                            {/* Title */}
                            <text x={x + barWidth/2} y="140" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                              {asg.title.length > 12 ? asg.title.substring(0, 10) + '...' : asg.title}
                            </text>
                          </g>
                        );
                      })}
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34D399" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Dados insuficientes para gerar gráficos de evolução.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MEU PERFIL */}
          {currentTab === 'perfil' && (
            <div className="animated-fade">
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Meu Perfil Profissional</h1>
                <p style={{ color: 'var(--text-muted)' }}>Informações cadastrais e de atuação operacional.</p>
              </div>

              <div className="card" style={styles.profileCard}>
                <div style={styles.profileHeaderSection}>
                  <div style={styles.profileAvatar}>
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-title)' }}>{currentUser.name}</h2>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {currentUser.position_id === 'p-garcom' ? 'Garçom' : currentUser.position_id === 'p-cozinheiro' ? 'Cozinheiro' : 'Colaborador'}
                    </p>
                  </div>
                </div>

                <div style={styles.profileInfoGrid}>
                  <div style={styles.profileInfoItem}>
                    <span style={styles.profileInfoLabel}>E-mail Institucional</span>
                    <span style={styles.profileInfoValue}>{currentUser.email}</span>
                  </div>
                  <div style={styles.profileInfoItem}>
                    <span style={styles.profileInfoLabel}>Unidade Coco Bambu</span>
                    <span style={styles.profileInfoValue}>
                      {currentUser.unit_id === 'u-teresina' ? 'Coco Bambu - Teresina' : currentUser.unit_id === 'u-matriz' ? 'Coco Bambu - Matriz' : 'Geral'}
                    </span>
                  </div>
                  <div style={styles.profileInfoItem}>
                    <span style={styles.profileInfoLabel}>Setor / Área</span>
                    <span style={styles.profileInfoValue}>
                      {currentUser.department_id === 'd-cozinha' ? 'Cozinha' : 'Salão / Atendimento'}
                    </span>
                  </div>
                  <div style={styles.profileInfoItem}>
                    <span style={styles.profileInfoLabel}>Status Operacional</span>
                    <span style={styles.profileInfoValue}>
                      <span className="badge badge-success">Ativo</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  examContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 0'
  },
  examHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  examPreTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--color-primary)',
    fontWeight: 'bold',
    letterSpacing: '0.05em'
  },
  examTitle: {
    fontSize: '1.5rem',
    fontFamily: 'var(--font-title)',
    marginTop: '0.2rem'
  },
  progressBarWrapper: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--border-color)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    marginBottom: '2rem'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    transition: 'width 0.3s ease'
  },
  questionBox: {
    marginBottom: '2rem'
  },
  questionText: {
    fontSize: '1.15rem',
    lineHeight: '1.5',
    color: 'var(--text-title)',
    marginBottom: '1.5rem',
    fontWeight: '500'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease'
  },
  optionLetter: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    flexShrink: 0
  },
  optionContent: {
    flex: 1,
    lineHeight: '1.4'
  },
  examFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem'
  },
  scoreBlock: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: 'var(--bg-block)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem'
  },
  scoreLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: 'bold'
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)'
  },
  gabaritoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem'
  },
  gabaritoItem: {
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem'
  },
  gabaritoOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1rem',
    paddingLeft: '0.5rem'
  },
  gabaritoOption: {
    fontSize: '0.85rem'
  },
  explanationBox: {
    backgroundColor: 'var(--bg-main)',
    borderLeft: '3px solid #EAB308',
    padding: '0.75rem 1rem',
    borderRadius: '0 6px 6px 0',
    marginTop: '0.5rem'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  kpiLabel: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-title)',
    marginBottom: '0.25rem'
  },
  kpiSubText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  todayCard: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    border: 'none',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
  },
  todayCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  todayCardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em'
  },
  todayCardEmpty: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem'
  },
  warmupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem'
  },
  warmupItem: {
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color)'
  },
  warmupItem: {
    padding: '1rem',
    backgroundColor: 'var(--bg-block)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  warmupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  warmupFooter: {
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between'
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    backgroundColor: 'var(--bg-block)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  },
  docCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '200px'
  },
  docBadgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  docCardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-title)',
    margin: '0.5rem 0'
  },
  docCardExcerpt: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    flex: 1
  },
  docCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  docMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    backgroundColor: 'var(--bg-block)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  scheduleCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    border: '1px solid'
  },
  trMetaRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem'
  },
  trMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.825rem',
    color: 'var(--text-muted)'
  },
  progressStatTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  progressStatValue: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-title)',
    marginBottom: '0.5rem'
  },
  chartWrapper: {
    padding: '1rem 0'
  },
  profileCard: {
    maxWidth: '650px'
  },
  profileHeaderSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem'
  },
  profileAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    backgroundColor: 'var(--border-color)',
    color: 'var(--color-primary)',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  profileInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  },
  profileInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  profileInfoLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  profileInfoValue: {
    fontSize: '1rem',
    color: 'var(--text-title)',
    fontWeight: '500'
  }
};
