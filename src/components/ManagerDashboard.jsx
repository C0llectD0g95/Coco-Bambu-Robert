import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { 
  Users, 
  Flame, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  FileText, 
  Cpu, 
  ArrowUpRight, 
  Upload, 
  X,
  FileCheck,
  Eye,
  Info
} from 'lucide-react';
import MonthlyScheduleMatrix from './MonthlyScheduleMatrix';

export default function ManagerDashboard({ currentUser, currentTab, setCurrentTab }) {
  // Database Tables State
  const [teamUsers, setTeamUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [warmups, setWarmups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Dashboard Metrics
  const [stats, setStats] = useState(null);

  // --- WARMUP (ESQUENTA) STATE ---
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [newWarmup, setNewWarmup] = useState({
    title: '', theme: '', sector_id: 'd-atendimento', date: new Date().toISOString().split('T')[0],
    shift: 'Almoço', duration: '10 min', content: '', guide_id: '', notes: ''
  });

  // --- ACTIVITY CREATION STATE ---
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: '', theme: '', sector_id: 'd-atendimento', target_audience: 'Todos',
    date: new Date().toISOString().split('T')[0], deadline: '', description: '', material_id: ''
  });
  const [activityQuestions, setActivityQuestions] = useState([]); // List of questions in draft
  
  // Single Question form
  const [questionForm, setQuestionForm] = useState({
    id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_option: 'A', explanation: '', guide_id: ''
  });
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(-1);

  // AI & Import sub-states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTheme, setAiTheme] = useState('');
  const [aiGuideId, setAiGuideId] = useState('');
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  // --- EVALUATION CREATION STATE ---
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [newEval, setNewEval] = useState({
    employee_id: '', period: 'Agosto 2026', positives: '', improvements: '',
    remarks: '', training_needed: '', feedback: '', date: new Date().toISOString().split('T')[0]
  });

  // --- ESCALA (WORK SCHEDULE) EDIT STATE ---
  const [weekDates, setWeekDates] = useState([]);
  const [scheduleGrid, setScheduleGrid] = useState({}); // { 'userId_date': { shift, hours, off_day } }
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // --- EMPLOYEE PERFORMANCE DETAIL STATE ---
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeStats, setSelectedEmployeeStats] = useState(null);

  // --- SEED NOTIFICATIONS / GENERAL MESSAGES ---
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, currentTab]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [allUsers, docs, allWarmups, allActs, allAsgs, allEvals, allSchedules, st] = await Promise.all([
        supabaseService.getTable('users'),
        supabaseService.getTable('documents'),
        supabaseService.getTable('warmups'),
        supabaseService.getTable('activities'),
        supabaseService.getTable('activity_assignments'),
        supabaseService.getTable('evaluations'),
        supabaseService.getTable('work_schedules'),
        supabaseService.getManagerStats(currentUser.id, currentUser.unit_id)
      ]);

      const users = allUsers.filter(u => u.unit_id === currentUser.unit_id && u.role === 'funcionario');
      setTeamUsers(users);
      setDocuments(docs);
      setWarmups(allWarmups.filter(w => w.unit_id === currentUser.unit_id));
      setActivities(allActs.filter(a => a.unit_id === currentUser.unit_id));
      setAssignments(allAsgs);
      setEvaluations(allEvals.filter(e => e.manager_id === currentUser.id));
      setStats(st);

      // Setup week dates
      const dates = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30'];
      setWeekDates(dates);

      // Load work schedules
      const userIds = users.map(u => u.id);
      const schs = allSchedules.filter(s => userIds.includes(s.user_id));
      setSchedules(schs);

      // Build schedule edit grid
      const grid = {};
      schs.forEach(s => {
        grid[`${s.user_id}_${s.date}`] = {
          shift: s.shift,
          hours: s.hours,
          off_day: s.off_day
        };
      });
      setScheduleGrid(grid);
    } catch (e) {
      console.error('Error loading manager dashboard data:', e);
    }
  };

  // --- WARMUP (ESQUENTA) CONTROLLERS ---
  const handleSaveWarmup = async (e) => {
    e.preventDefault();
    if (!newWarmup.title || !newWarmup.theme || !newWarmup.content) {
      triggerToast('Preencha os campos obrigatórios.', true);
      return;
    }

    const warmupToSave = {
      ...newWarmup,
      manager_id: currentUser.id,
      unit_id: currentUser.unit_id,
      status: 'completed',
      date_created: new Date().toISOString()
    };

    await supabaseService.saveItem('warmups', warmupToSave);
    triggerToast('Esquenta registrado com sucesso!');
    setShowWarmupModal(false);
    setNewWarmup({
      title: '', theme: '', sector_id: 'd-atendimento', date: new Date().toISOString().split('T')[0],
      shift: 'Almoço', duration: '10 min', content: '', guide_id: '', notes: ''
    });
    loadData();
  };

  // --- ACTIVITY & QUESTIONS CONTROLLERS ---
  const handleOpenCreateActivity = () => {
    setActivityForm({
      title: '', theme: '', sector_id: 'd-atendimento', target_audience: 'Todos',
      date: new Date().toISOString().split('T')[0], deadline: '', description: '', material_id: ''
    });
    setActivityQuestions([]);
    setQuestionForm({
      id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
      correct_option: 'A', explanation: '', guide_id: ''
    });
    setEditingQuestionIdx(-1);
    setShowActivityModal(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.question_text || !questionForm.option_a || !questionForm.option_b || !questionForm.option_c || !questionForm.option_d) {
      triggerToast('Preencha todos os campos da questão.', true);
      return;
    }

    const updatedQs = [...activityQuestions];
    if (editingQuestionIdx !== -1) {
      updatedQs[editingQuestionIdx] = { ...questionForm };
      setEditingQuestionIdx(-1);
    } else {
      const newQ = {
        ...questionForm,
        id: `q-temp-${Date.now()}`
      };
      updatedQs.push(newQ);
    }

    setActivityQuestions(updatedQs);
    setQuestionForm({
      id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
      correct_option: 'A', explanation: '', guide_id: ''
    });
    triggerToast('Questão adicionada ao rascunho!');
  };

  const editQuestion = (idx) => {
    setQuestionForm(activityQuestions[idx]);
    setEditingQuestionIdx(idx);
  };

  const deleteQuestion = (idx) => {
    const updated = activityQuestions.filter((_, i) => i !== idx);
    setActivityQuestions(updated);
    triggerToast('Questão removida.');
  };

  const duplicateQuestion = (idx) => {
    const q = activityQuestions[idx];
    const dup = {
      ...q,
      id: `q-temp-${Date.now()}`,
      question_text: `${q.question_text} (Cópia)`
    };
    setActivityQuestions([...activityQuestions, dup]);
    triggerToast('Questão duplicada!');
  };

  const moveQuestion = (idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === activityQuestions.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const list = [...activityQuestions];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setActivityQuestions(list);
  };

  const handleAiQuestionGenerate = () => {
    if (!aiTheme || !aiGuideId) {
      alert('Selecione o Tema e o Guide correspondente.');
      return;
    }

    const guide = documents.find(d => d.id === aiGuideId);
    const guideName = guide ? guide.name : 'Guide Geral';

    const mockAiGenerated = [
      { id: `q-ai-1`, question_text: `Sobre o tema "${aiTheme}" no ${guideName}, qual a norma primária de segurança sanitária?`, option_a: 'Manter temperatura refrigerada adequada.', option_b: 'Limpar apenas uma vez por dia.', option_c: 'Não utilizar EPI.', option_d: 'Usar adornos livremente.', correct_option: 'A', explanation: 'A conservação sob temperatura fria correta impede a proliferação bacteriana acelerada.', guide_id: aiGuideId },
      { id: `q-ai-2`, question_text: `No alinhamento do Coco Bambu, qual o tempo de resposta ideal para a solicitação do cliente?`, option_a: 'Deixar aguardar 20 minutos.', option_b: 'Imediato, com atenção e cordialidade.', option_c: 'Somente se houver insistência.', option_d: '15 minutos.', correct_option: 'B', explanation: 'Rapidez e simpatia definem o acolhimento ao cliente.', guide_id: aiGuideId },
      { id: `q-ai-3`, question_text: `Conforme o manual do Coco Bambu, qual procedimento ao derramar líquidos no salão?`, option_a: 'Colocar placa de sinalização e solicitar limpeza imediata.', option_b: 'Ignorar o ocorrido.', option_c: 'Limpar apenas no final do expediente.', option_d: 'Deixar que o cliente limpe.', correct_option: 'A', explanation: 'Previne acidentes físicos de quedas.', guide_id: aiGuideId },
      { id: `q-ai-4`, question_text: `Ao manusear camarão congelado, o descongelamento deve ser realizado em:`, option_a: 'Água fervente.', option_b: 'Temperatura ambiente.', option_c: 'Refrigeração lenta (até 4°C).', option_d: 'Exposição direta ao sol.', correct_option: 'C', explanation: 'O descongelamento lento evita a contaminação microbiológica.', guide_id: aiGuideId },
      { id: `q-ai-5`, question_text: `Qual atitude tomar se um equipamento de frio apresentar oscilação de temperatura?`, option_a: 'Ignorar e continuar usando.', option_b: 'Reportar imediatamente ao gerente e transferir insumos para outro freezer ativo.', option_c: 'Esperar que o equipamento desligue sozinho.', option_d: 'Desconectar a tomada.', correct_option: 'B', explanation: 'O isolamento do insumo garante a segurança alimentar.', guide_id: aiGuideId },
      { id: `q-ai-6`, question_text: `No fechamento de praça de garçom, qual o item mais importante a verificar?`, option_a: 'Limpeza dos galheteiros e organização das mesas.', option_b: 'Deixar guardanapos no chão.', option_c: 'Não há itens obrigatórios.', option_d: 'Apenas desligar as luzes.', correct_option: 'A', explanation: 'A praça deve estar pronta para o próximo turno.', guide_id: aiGuideId },
      { id: `q-ai-7`, question_text: `Qual a regra para higienização de hortifrutis consumidos crus no Coco Bambu?`, option_a: 'Sanitização com cloro próprio para alimentos.', option_b: 'Apenas passar água quente.', option_c: 'Usar detergente de louça comum.', option_d: 'Não higienizar.', correct_option: 'A', explanation: 'Cloro elimina micro-organismos nocivos.', guide_id: aiGuideId },
      { id: `q-ai-8`, question_text: `Em relação à higiene pessoal, as unhas dos manipuladores devem estar:`, option_a: 'Compridas com esmalte escuro.', option_b: 'Curvas e decoradas.', option_c: 'Curtas, limpas e sem nenhum esmalte.', option_d: 'Com esmalte claro apenas.', correct_option: 'C', explanation: 'Unhas pintadas ocultam sujeiras e contaminam os alimentos.', guide_id: aiGuideId },
      { id: `q-ai-9`, question_text: `O ticket médio da mesa pode ser impulsionado de qual forma correta?`, option_a: 'Forçando o cliente a pedir o prato mais caro.', option_b: 'Oferecendo sugestões de entradas e sobremesas de forma sutil e atrativa.', option_c: 'Cobrando taxa adicional de serviço por fora.', option_d: 'Servindo pratos que não foram pedidos.', correct_option: 'B', explanation: 'Técnicas de vendas agregam valor à experiência do cliente.', guide_id: aiGuideId },
      { id: `q-ai-10`, question_text: `Qual o papel principal do Esquenta diário da equipe?`, option_a: 'Cobrar metas de vendas agressivamente.', option_b: 'Alinhar o time nos padrões, motivar e revisar regras operacionais do dia.', option_c: 'Apenas bater ponto.', option_d: 'Fazer fofocas internas.', correct_option: 'B', explanation: 'O esquenta é a rotina de capacitação diária rápida da operação.', guide_id: aiGuideId }
    ];

    setActivityQuestions(mockAiGenerated);
    setShowAiModal(false);
    triggerToast('10 Questões geradas pela IA no rascunho com sucesso!');
  };

  const handleImportQuestions = () => {
    if (!importText.trim()) {
      alert('Insira o texto das questões para importar.');
      return;
    }

    setImportStatus('Lendo e identificando questões...');
    setTimeout(() => {
      const parsed = Array.from({ length: 10 }).map((_, i) => ({
        id: `q-imp-${Date.now()}-${i}`,
        question_text: `[Importada] Questão número ${i + 1} sobre padrões operacionais.`,
        option_a: `Alternativa A importada`,
        option_b: `Alternativa B importada`,
        option_c: `Alternativa C importada`,
        option_d: `Alternativa D importada`,
        correct_option: 'A',
        explanation: 'Revisar explicação importada.',
        guide_id: ''
      }));
      setActivityQuestions(parsed);
      setImportStatus('');
      setShowImportModal(false);
      triggerToast('10 Questões importadas para rascunho. Revise antes de publicar.');
    }, 1200);
  };

  const saveActivity = async (status = 'draft') => {
    if (!activityForm.title || !activityForm.theme || !activityForm.deadline) {
      triggerToast('Preencha Título, Tema e Prazo da Atividade.', true);
      return;
    }

    if (status === 'published' && activityQuestions.length !== 10) {
      triggerToast(`Uma atividade precisa ter exatamente 10 questões para ser publicada. (Atual: ${activityQuestions.length}/10)`, true);
      return;
    }

    const actObj = {
      ...activityForm,
      manager_id: currentUser.id,
      unit_id: currentUser.unit_id,
      status: status
    };

    const savedAct = await supabaseService.saveItem('activities', actObj);

    // Save questions
    for (let idx = 0; idx < activityQuestions.length; idx++) {
      const q = activityQuestions[idx];
      const qId = q.id && !q.id.startsWith('q-temp') && !q.id.startsWith('q-ai') && !q.id.startsWith('q-imp') ? q.id : `q-${savedAct.id}-${idx}`;
      await supabaseService.saveItem('questions', {
        ...q,
        id: qId,
        activity_id: savedAct.id,
        question_index: idx
      });
    }

    // If published, assign to team and notify
    if (status === 'published') {
      const assignments = await supabaseService.getTable('activity_assignments');
      for (const u of teamUsers) {
        const exist = assignments.find(a => a.activity_id === savedAct.id && a.user_id === u.id);
        if (!exist) {
          await supabaseService.saveItem('activity_assignments', {
            id: `asg-${savedAct.id}-${u.id}`,
            activity_id: savedAct.id,
            user_id: u.id,
            status: 'pending',
            completion_date: null,
            score: null,
            max_score: 10
          });

          await supabaseService.saveItem('notifications', {
            id: `nt-${Date.now()}-${u.id}`,
            user_id: u.id,
            message: `Nova atividade disponível: "${savedAct.title}". Responda até ${savedAct.deadline}.`,
            is_read: false,
            date: new Date().toISOString(),
            type: 'activity'
          });
        }
      }
      triggerToast('Atividade publicada! Funcionários notificados.');
    } else {
      triggerToast('Atividade salva como rascunho com sucesso.');
    }

    setShowActivityModal(false);
    loadData();
  };

  const handleDeleteActivity = async (actId) => {
    if (confirm('Tem certeza que deseja excluir esta atividade permanentemente?')) {
      await supabaseService.deleteItem('activities', actId);
      triggerToast('Atividade excluída.');
      loadData();
    }
  };

  const handleScheduleChange = (userId, date, field, value) => {
    const key = `${userId}_${date}`;
    const current = scheduleGrid[key] || { shift: 'Folga', hours: 'Folga', off_day: true };
    
    let updated;
    if (field === 'shift') {
      const isOff = value === 'Folga';
      const hours = value === 'Almoço' ? '08:00 - 16:00' : value === 'Jantar' ? '15:00 - 23:00' : 'Folga';
      updated = { ...current, shift: value, hours, off_day: isOff };
    } else {
      updated = { ...current, [field]: value };
    }

    setScheduleGrid(prev => ({
      ...prev,
      [key]: updated
    }));
  };

  const handleSaveSchedules = async () => {
    const payload = [];
    Object.keys(scheduleGrid).forEach(key => {
      const [userId, date] = key.split('_');
      payload.push({
        user_id: userId,
        date: date,
        ...scheduleGrid[key]
      });
    });

    await supabaseService.saveWorkSchedules(payload);
    setIsEditingSchedule(false);
    triggerToast('Escala de trabalho da equipe salva com sucesso!');
    loadData();
  };

  const handleSaveEval = async (e) => {
    e.preventDefault();
    if (!newEval.employee_id || !newEval.positives || !newEval.improvements) {
      triggerToast('Preencha os campos obrigatórios da avaliação.', true);
      return;
    }

    const evalObj = {
      ...newEval,
      manager_id: currentUser.id
    };

    await supabaseService.saveItem('evaluations', evalObj);
    triggerToast('Avaliação de desempenho salva com sucesso.');
    setShowEvalModal(false);
    setNewEval({
      employee_id: '', period: 'Agosto 2026', positives: '', improvements: '',
      remarks: '', training_needed: '', feedback: '', date: new Date().toISOString().split('T')[0]
    });
    loadData();
  };

  const handleDeleteEval = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      await supabaseService.deleteItem('evaluations', id);
      triggerToast('Avaliação excluída.');
      loadData();
    }
  };

  const handleOpenEmployeeDetail = async (emp) => {
    const empEvals = evaluations.filter(e => e.employee_id === emp.id);
    const allAsgs = await supabaseService.getTable('activity_assignments');
    
    const empAsgs = allAsgs
      .filter(asg => asg.user_id === emp.id && asg.status === 'completed')
      .map(asg => {
        const act = activities.find(a => a.id === asg.activity_id);
        return {
          ...asg,
          title: act ? act.title : 'Atividade'
        };
      });

    const scoreSum = empAsgs.reduce((acc, a) => acc + (a.score || 0), 0);
    const avg = empAsgs.length > 0 ? parseFloat((scoreSum / empAsgs.length).toFixed(1)) : 0;

    setSelectedEmployee(emp);
    setSelectedEmployeeStats({
      evaluations: empEvals,
      assignments: empAsgs,
      average: avg
    });
  };

  return (
    <div className="content-body">
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeftColor: toastMessage.isError ? '#EF4444' : '#10B981' }}>
            {toastMessage.text}
          </div>
        </div>
      )}

      {/* TAB: DASHBOARD */}
      {currentTab === 'dashboard' && stats && (
        <div className="animated-fade">
          {/* Header */}
          <div style={{ marginBottom: '2.25rem', borderBottom: '1px solid #EAE3D9', paddingBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#281D17', fontFamily: 'var(--font-title)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Bom dia, {currentUser.name.split(' ')[0]}!
            </h1>
            <p style={{ color: '#8A7B70', fontSize: '0.95rem', marginBottom: '0.65rem' }}>
              Acompanhe o desenvolvimento da sua equipe e os treinamentos da unidade.
            </p>
            <div style={{ fontSize: '0.825rem', color: '#8A7B70', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#C9A24A', fontWeight: '600' }}>{currentUser.unit_id === 'u-teresina' ? 'Coco Bambu - Teresina' : currentUser.unit_id === 'u-matriz' ? 'Coco Bambu - Matriz' : 'Geral'}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
            {/* KPI 1: Equipe */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8A7B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EQUIPE</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(201, 162, 74, 0.1)', color: '#C9A24A' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#281D17', lineHeight: '1.2' }}>{stats.total_team}</div>
              <span style={{ fontSize: '0.775rem', color: '#8A7B70' }}>colaboradores ativos</span>
            </div>

            {/* KPI 2: Capacitações */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8A7B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CAPACITAÇÕES</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(90, 57, 37, 0.08)', color: '#5A3925' }}>
                  <Flame size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#281D17', lineHeight: '1.2' }}>{stats.warmups_count}</div>
              <span style={{ fontSize: '0.775rem', color: '#8A7B70' }}>este mês</span>
            </div>

            {/* KPI 3: Desempenho */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8A7B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DESEMPENHO</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(30, 126, 78, 0.1)', color: '#1E7E4E' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-title)', lineHeight: '1.2' }}>
                {stats.activities.length > 0 
                  ? Math.round(stats.activities.reduce((acc, a) => acc + a.average_score, 0) / stats.activities.length * 10)
                  : 0}%
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>média da equipe</span>
            </div>

            {/* KPI 4: Atividades */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atividades</span>
                <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' }}>
                  <ClipboardList size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-title)', lineHeight: '1.2' }}>{stats.activities.length}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>em andamento</span>
            </div>
          </div>

          {/* Evolution Chart */}
          {(() => {
            const chartActivities = [...stats.activities].reverse();
            const pointsCount = chartActivities.length;
            const width = 500;
            const height = 100;
            const padding = 20;

            const points = chartActivities.map((act, idx) => {
              const x = pointsCount > 1 
                ? padding + idx * ((width - 2 * padding) / (pointsCount - 1))
                : width / 2;
              const scoreVal = act.average_score || 0;
              const y = height - padding - (scoreVal / 10) * (height - 2 * padding);
              return { x, y, score: scoreVal, title: act.title };
            });

            const pathD = points.length > 0
              ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
              : '';

            const areaD = points.length > 0
              ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
              : '';

            return (
              <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-title)', marginBottom: '0.25rem' }}>
                      Desempenho da Equipe
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Acompanhe a evolução das avaliações da sua equipe.
                    </p>
                  </div>
                  <div>
                    <select style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-title)', outline: 'none' }}>
                      <option>Últimos 30 dias</option>
                    </select>
                  </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="150" style={{ overflow: 'visible', minWidth: '400px' }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B87C" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#00B87C" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />

                    {areaD && <path d={areaD} fill="url(#areaGrad)" />}
                    {pathD && <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />}

                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--color-primary)" strokeWidth="2" />
                        <text x={p.x} y={p.y - 8} fill="var(--text-title)" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {p.score}/10
                        </text>
                        <text x={p.x} y={height - 2} fill="var(--text-muted)" fontSize="8" textAnchor="middle">
                          {p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            );
          })()}

          {/* Two Column Grid (Esquenta & Atividade Recente) */}
          <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
            {/* Esquenta card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-title)' }}>
                    <span>🔥</span> Esquenta de Hoje
                  </h3>
                  <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Pendente Hoje</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-title)', marginBottom: '0.5rem' }}>Alinhamento rápido antes da abertura</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Reúna sua equipe por 10 minutos e revise as principais dificuldades identificadas nas últimas avaliações.
                </p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', backgroundColor: 'var(--color-primary)', border: 'none', color: '#fff', padding: '0.75rem', borderRadius: '8px', fontWeight: '600' }}
                onClick={() => setShowWarmupModal(true)}
              >
                + Registrar esquenta realizado
              </button>
            </div>

            {/* Atividades Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '16px' }}>
              {stats.activities.length > 0 ? (
                (() => {
                  const act = stats.activities[0];
                  const pct = Math.round((act.completed / act.total_assigned) * 100);
                  return (
                    <>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atividade Recente</span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-title)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>{act.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{act.theme}</p>
                        
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                            <span>{act.completed} de {act.total_assigned} colaboradores concluíram</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-title)' }}>{pct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-block)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Média da equipe</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-title)' }}>{act.average_score} / 10</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%' }}
                        onClick={() => setCurrentTab('atividades')}
                      >
                        Ver resultados
                      </button>
                    </>
                  );
                })()
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>
                  <ClipboardList size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.9rem' }}>Nenhuma atividade publicada para a equipe ainda.</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Pontos de Atenção & Minha Equipe */}
          <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
            {/* Attention Points Section */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-title)', marginBottom: '0.25rem' }}>
                Pontos de Atenção
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Identificados automaticamente a partir dos dados da equipe.
              </p>

              {stats.attention_points.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.attention_points.map((pt, idx) => (
                    <div key={pt.question_id} style={{ paddingBottom: idx < stats.attention_points.length - 1 ? '1rem' : '0', borderBottom: idx < stats.attention_points.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>⚠</span>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-title)' }}>
                            Alto índice de erro: {pt.activity_title}
                          </span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {pt.wrong_count} colaboradores erraram a pergunta: "{pt.question_text.length > 60 ? pt.question_text.substring(0, 57) + '...' : pt.question_text}"
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          style={{ background: 'none', border: 'none', color: '#5B6CFF', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setCurrentTab('atividades')}
                        >
                          Ver detalhes →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px' }}>
                  <CheckCircle size={20} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-title)', fontWeight: '500' }}>
                    Excelente aproveitamento! Nenhum ponto de atenção identificado.
                  </span>
                </div>
              )}
            </div>

            {/* Minha Equipe Section */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-title)' }}>Minha Equipe</h3>
                <button 
                  style={{ background: 'none', border: 'none', color: '#5B6CFF', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => setCurrentTab('equipe')}
                >
                  Ver equipe →
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {teamUsers.length} colaboradores
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Colaborador</th>
                      <th style={{ padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Desempenho</th>
                      <th style={{ padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamUsers.slice(0, 3).map(emp => {
                      const empAsgs = assignments.filter(a => a.user_id === emp.id && a.status === 'completed');
                      const avg = empAsgs.length > 0
                        ? Math.round((empAsgs.reduce((acc, a) => acc + (a.score || 0), 0) / empAsgs.length) * 10)
                        : 0;
                      return (
                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-title)' }}>
                            {emp.name}
                          </td>
                          <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                              <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${avg}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-title)' }}>{avg}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: emp.status === 'active' ? 'var(--color-primary)' : 'var(--color-error)' }}>
                              ● <span style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>{emp.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ESQUENTA */}
      {currentTab === 'esquenta' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Esquentas e Alinhamentos</h1>
              <p style={{ color: 'var(--text-muted)' }}>Registro de reuniões operacionais de turnos do Coco Bambu.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowWarmupModal(true)}>
              <Plus size={18} />
              Novo Esquenta
            </button>
          </div>

          {/* Warmup History List */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Esquenta</th>
                  <th>Tema</th>
                  <th>Turno</th>
                  <th>Duração</th>
                  <th>Guide Associado</th>
                  <th>Responsável</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {warmups.map(w => {
                  const guide = documents.find(d => d.id === w.guide_id);
                  const manager = teamUsers.find(u => u.id === w.manager_id) || { name: currentUser.name };
                  return (
                    <tr key={w.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{w.title}</td>
                      <td>{w.theme}</td>
                      <td>
                        <span className="badge badge-info">{w.shift}</span>
                      </td>
                      <td>{w.duration}</td>
                      <td style={{ fontSize: '0.85rem' }}>{guide ? guide.name : '-'}</td>
                      <td>{manager ? manager.name : 'Gestor'}</td>
                      <td>{w.date}</td>
                    </tr>
                  );
                })}
                {warmups.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                      Nenhum esquenta registrado para esta unidade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ATIVIDADES */}
      {currentTab === 'atividades' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Painel de Atividades</h1>
              <p style={{ color: 'var(--text-muted)' }}>Crie, configure e aplique questionários rápidos de 10 perguntas à equipe.</p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateActivity}>
              <Plus size={18} />
              Nova Atividade
            </button>
          </div>

          {/* List of active activities */}
          <div className="grid-cols-2">
            {activities.map(act => {
              const matchedAsg = stats?.activities?.find(a => a.id === act.id) || { completed: 0, total_assigned: teamUsers.length, average_score: 0 };
              return (
                <div key={act.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div className="flex-between">
                      <span className="badge badge-info">{act.theme}</span>
                      <span className={`badge ${act.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {act.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-title)', marginTop: '0.75rem' }}>{act.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                      {act.description}
                    </p>
                    
                    {act.status === 'published' && (
                      <div style={styles.trMetaRow}>
                        <div style={styles.trMetaItem}>
                          <strong>Aproveitamento:</strong> {matchedAsg.average_score * 10}%
                        </div>
                        <div style={styles.trMetaItem}>
                          <strong>Completaram:</strong> {matchedAsg.completed} / {matchedAsg.total_assigned}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        setActivityForm(act);
                        const qs = await supabaseService.getActivityQuestions(act.id);
                        setActivityQuestions(qs);
                        setEditingQuestionIdx(-1);
                        setShowActivityModal(true);
                      }}
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(act.id)}>
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {activities.length === 0 && (
            <div className="empty-state">
              <ClipboardList className="empty-state-icon" />
              <div className="empty-state-title">Nenhuma atividade cadastrada</div>
              <div className="empty-state-desc">Clique no botão superior para criar sua primeira avaliação de 10 questões.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB: MINHA EQUIPE */}
      {currentTab === 'equipe' && (
        <div className="animated-fade">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Gestão da Equipe</h1>
            <p style={{ color: 'var(--text-muted)' }}>Desempenho operacional e fichas dos colaboradores de sua unidade.</p>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Setor</th>
                  <th>Aproveitamento Médio</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {teamUsers.map(emp => {
                  const empAsgs = assignments.filter(a => a.user_id === emp.id && a.status === 'completed');
                  const avg = empAsgs.length > 0
                    ? Math.round((empAsgs.reduce((acc, a) => acc + (a.score || 0), 0) / empAsgs.length) * 10)
                    : 0;

                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{emp.name}</td>
                      <td>{emp.position_id === 'p-garcom' ? 'Garçom' : emp.position_id === 'p-cozinheiro' ? 'Cozinheiro' : 'Colaborador'}</td>
                      <td>{emp.department_id === 'd-cozinha' ? 'Cozinha' : 'Atendimento'}</td>
                      <td style={{ fontWeight: 'bold', color: avg >= 70 ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {avg > 0 ? `${avg}%` : '-'}
                      </td>
                      <td>
                        <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {emp.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEmployeeDetail(emp)}>
                          <Eye size={14} />
                          Ver Perfil de Desempenho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ESCALA (Matriz Mensal) */}
      {currentTab === 'escala' && (
        <div className="animated-fade">
          <MonthlyScheduleMatrix currentUser={currentUser} canEdit={true} />
        </div>
      )}

      {/* TAB: AVALIACOES */}
      {currentTab === 'avaliacoes' && (
        <div className="animated-fade">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Fichas de Avaliação de Desempenho</h1>
              <p style={{ color: 'var(--text-muted)' }}>Gestão de feedbacks individuais e necessidades de treinamento.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowEvalModal(true)}>
              <Plus size={18} />
              Criar Avaliação
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Período</th>
                  <th>Pontos Fortes</th>
                  <th>Necessidade Treinamento</th>
                  <th>Data Registro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map(ev => {
                  const emp = teamUsers.find(u => u.id === ev.employee_id);
                  return (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-title)' }}>{emp ? emp.name : 'Desconhecido'}</td>
                      <td>{ev.period}</td>
                      <td style={{ fontSize: '0.85rem' }}>{ev.positives.substring(0, 50)}...</td>
                      <td>
                        <span className="badge badge-warning">{ev.training_needed}</span>
                      </td>
                      <td>{ev.date}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEval(ev.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {evaluations.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                      Nenhuma avaliação de desempenho cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- MODALS -------------------- */}

      {/* 1. NEW WARMUP MODAL */}
      {showWarmupModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="#10B981" />
                Registrar Novo Esquenta
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowWarmupModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveWarmup}>
              <div className="modal-body">
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Título do Esquenta</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Alinhamento de Abertura Sábado"
                      value={newWarmup.title} 
                      onChange={(e) => setNewWarmup({...newWarmup, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tema Principal</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Tempo de Prato / Postura"
                      value={newWarmup.theme} 
                      onChange={(e) => setNewWarmup({...newWarmup, theme: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">Setor</label>
                    <select 
                      className="form-select"
                      value={newWarmup.sector_id}
                      onChange={(e) => setNewWarmup({...newWarmup, sector_id: e.target.value})}
                    >
                      <option value="d-atendimento">Atendimento</option>
                      <option value="d-cozinha">Cozinha</option>
                      <option value="d-bar">Bar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Turno / Horário</label>
                    <select 
                      className="form-select"
                      value={newWarmup.shift}
                      onChange={(e) => setNewWarmup({...newWarmup, shift: e.target.value})}
                    >
                      <option value="Almoço">Almoço</option>
                      <option value="Jantar">Jantar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duração</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newWarmup.duration}
                      onChange={(e) => setNewWarmup({...newWarmup, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Documento/Guide de Referência</label>
                  <select 
                    className="form-select"
                    value={newWarmup.guide_id}
                    onChange={(e) => setNewWarmup({...newWarmup, guide_id: e.target.value})}
                  >
                    <option value="">Nenhum Guide Associado</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resumo do Alinhamento (Instruções repassadas)</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Quais pontos operacionais foram reforçados?"
                    value={newWarmup.content}
                    onChange={(e) => setNewWarmup({...newWarmup, content: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Observações e Feedbacks Rápidos do Gestor</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Camarão com alta saída hoje, alertar atendentes."
                    value={newWarmup.notes}
                    onChange={(e) => setNewWarmup({...newWarmup, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWarmupModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Esquenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CREATE ACTIVITY MODAL (10 QUESTIONS BUILDER) */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Configurar Nova Avaliação (Questões: {activityQuestions.length}/10)</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAiModal(true)}>
                  <Cpu size={14} />
                  IA Questões
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(true)}>
                  <Upload size={14} />
                  Importar
                </button>
                <button style={styles.closeBtn} onClick={() => setShowActivityModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', maxHeight: '75vh' }}>
              {/* Left Side: General metadata & active questions list */}
              <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-title)' }}>1. Dados da Atividade</h4>
                
                <div className="form-group">
                  <label className="form-label">Título da Avaliação</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Padrões Sanitários da Cozinha"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Tema</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Higienização"
                      value={activityForm.theme}
                      onChange={(e) => setActivityForm({...activityForm, theme: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prazo de Resposta</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={activityForm.deadline}
                      onChange={(e) => setActivityForm({...activityForm, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Setor</label>
                    <select 
                      className="form-select"
                      value={activityForm.sector_id}
                      onChange={(e) => setActivityForm({...activityForm, sector_id: e.target.value})}
                    >
                      <option value="d-atendimento">Atendimento</option>
                      <option value="d-cozinha">Cozinha</option>
                      <option value="d-bar">Bar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guide Vinculado</label>
                    <select 
                      className="form-select"
                      value={activityForm.material_id}
                      onChange={(e) => setActivityForm({...activityForm, material_id: e.target.value})}
                    >
                      <option value="">Nenhum Guide Associado</option>
                      {documents.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Geral da Prova</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Instruções aos colaboradores..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                  />
                </div>

                <h4 style={{ margin: '1.5rem 0 0.75rem 0', color: 'var(--text-title)' }}>Questões Adicionadas ({activityQuestions.length}/10)</h4>
                <div style={styles.questionsDraftList}>
                  {activityQuestions.map((q, idx) => (
                    <div key={q.id || idx} style={styles.questionDraftItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Questão {idx + 1}</span>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.1rem 0.3rem' }} onClick={() => moveQuestion(idx, 'up')}>↑</button>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.1rem 0.3rem' }} onClick={() => moveQuestion(idx, 'down')}>↓</button>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.1rem 0.3rem' }} onClick={() => editQuestion(idx)}>
                            <Edit3 size={12} />
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.1rem 0.3rem' }} onClick={() => duplicateQuestion(idx)}>Copia</button>
                          <button type="button" className="btn btn-danger btn-sm" style={{ padding: '0.1rem 0.3rem' }} onClick={() => deleteQuestion(idx)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{q.question_text}</p>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Gabarito: {q.correct_option}</span>
                    </div>
                  ))}
                  {activityQuestions.length === 0 && (
                    <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Nenhuma questão cadastrada. Use o construtor ao lado para adicionar.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Manual Question Editor */}
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-title)' }}>
                  {editingQuestionIdx !== -1 ? 'Editar Questão' : '2. Construtor de Questão Manual'}
                </h4>
                <form onSubmit={handleSaveQuestion}>
                  <div className="form-group">
                    <label className="form-label">Enunciado da Questão</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Escreva a pergunta da questão..."
                      rows="2"
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alternativa A</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Resposta alternativa A"
                      value={questionForm.option_a}
                      onChange={(e) => setQuestionForm({...questionForm, option_a: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alternativa B</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Resposta alternativa B"
                      value={questionForm.option_b}
                      onChange={(e) => setQuestionForm({...questionForm, option_b: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alternativa C</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Resposta alternativa C"
                      value={questionForm.option_c}
                      onChange={(e) => setQuestionForm({...questionForm, option_c: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alternativa D</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Resposta alternativa D"
                      value={questionForm.option_d}
                      onChange={(e) => setQuestionForm({...questionForm, option_d: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Resposta Correta</label>
                      <select 
                        className="form-select"
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({...questionForm, correct_option: e.target.value})}
                      >
                        <option value="A">Alternativa A</option>
                        <option value="B">Alternativa B</option>
                        <option value="C">Alternativa C</option>
                        <option value="D">Alternativa D</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Guide do Tema</label>
                      <select 
                        className="form-select"
                        value={questionForm.guide_id}
                        onChange={(e) => setQuestionForm({...questionForm, guide_id: e.target.value})}
                      >
                        <option value="">Nenhum Guide</option>
                        {documents.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explicação da Resposta (Gabarito comentado)</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Descreva por que essa alternativa é a correta..."
                      rows="2"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                    {editingQuestionIdx !== -1 ? 'Atualizar Questão' : '+ Salvar Questão na Lista'}
                  </button>
                </form>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => saveActivity('draft')}>
                Salvar Rascunho
              </button>
              {/* LOCK PUBLISH IF NOT EXACTLY 10 QUESTIONS */}
              <button 
                className="btn btn-primary" 
                onClick={() => saveActivity('published')}
                disabled={activityQuestions.length !== 10}
                title={activityQuestions.length !== 10 ? 'Você precisa cadastrar exatamente 10 questões para poder publicar.' : ''}
              >
                Publicar Atividade (Counter: {activityQuestions.length}/10)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.1 AI QUESTIONS GENERATION MODAL */}
      {showAiModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="#10B981" />
                Gerar Questões com IA
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowAiModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                A IA analisará o Guide selecionado e construirá um questionário com exatamente 10 questões robustas e gabarito comentado.
              </p>
              
              <div className="form-group">
                <label className="form-label">Tema da Geração</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Higiene Alimentar Avançada"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guide Base de Conhecimento</label>
                <select 
                  className="form-select"
                  value={aiGuideId}
                  onChange={(e) => setAiGuideId(e.target.value)}
                >
                  <option value="">Selecione o Guide</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleAiQuestionGenerate}>
                Gerar 10 Questões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.2 IMPORT QUESTIONS MODAL */}
      {showImportModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="#10B981" />
                Importar Questões
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Cole um bloco de texto com perguntas estruturadas em formato de testes de múltipla escolha. O motor de leitura tentará organizá-las no editor.
              </p>
              
              <div className="form-group">
                <label className="form-label">Cole o texto do Documento:</label>
                <textarea 
                  className="form-textarea" 
                  rows="6"
                  placeholder="Questão 1: ... A) ... B) ... C) ... D) ..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>

              {importStatus && (
                <div style={{ color: '#EAB308', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {importStatus}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleImportQuestions}>
                Revisar e Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE EVALUATION MODAL */}
      {showEvalModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#10B981" />
                Criar Avaliação de Desempenho
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowEvalModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEval}>
              <div className="modal-body">
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Funcionário</label>
                    <select
                      className="form-select"
                      value={newEval.employee_id}
                      onChange={(e) => setNewEval({...newEval, employee_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione o Colaborador</option>
                      {teamUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Período de Avaliação</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Agosto 2026"
                      value={newEval.period}
                      onChange={(e) => setNewEval({...newEval, period: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pontos Fortes (Atuações Positivas)</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="O que o colaborador tem apresentado de excelente na rotina?"
                    value={newEval.positives}
                    onChange={(e) => setNewEval({...newEval, positives: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pontos de Melhoria</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Quais processos o colaborador precisa otimizar?"
                    value={newEval.improvements}
                    onChange={(e) => setNewEval({...newEval, improvements: e.target.value})}
                    required
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Necessidade de Capacitação</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Práticas Sanitárias / Vendas"
                      value={newEval.training_needed}
                      onChange={(e) => setNewEval({...newEval, training_needed: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Observações e Feedback Geral</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Alinhado na reunião individual."
                      value={newEval.remarks}
                      onChange={(e) => setNewEval({...newEval, remarks: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEvalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EMPLOYEE DETAIL PERFORMANCE MODAL */}
      {selectedEmployee && selectedEmployeeStats && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Ficha de Desempenho: {selectedEmployee.name}</h3>
              <button style={styles.closeBtn} onClick={() => setSelectedEmployee(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={styles.profileHeaderSection}>
                <div style={styles.profileAvatar}>
                  {selectedEmployee.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--text-title)' }}>
                    {selectedEmployee.name}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    Cargo: {selectedEmployee.position_id === 'p-garcom' ? 'Garçom' : 'Cozinheiro'}
                  </p>
                </div>
              </div>

              {/* Stats Block */}
              <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLabel}>Aproveitamento Médio</span>
                  <span style={{ ...styles.scoreValue, color: '#10B981' }}>
                    {selectedEmployeeStats.average > 0 ? `${selectedEmployeeStats.average * 10}%` : '-'}
                  </span>
                </div>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLabel}>Atividades Feitas</span>
                  <span style={styles.scoreValue}>{selectedEmployeeStats.assignments.length}</span>
                </div>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLabel}>Status</span>
                  <span className="badge badge-success" style={{ padding: '0.25rem 0.5rem', marginTop: '0.5rem' }}>Ativo</span>
                </div>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: 'var(--text-title)' }}>Histórico de Atividades Realizadas</h4>
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Nota</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployeeStats.assignments.map(asg => (
                      <tr key={asg.id}>
                        <td style={{ fontWeight: '600' }}>{asg.title}</td>
                        <td style={{ fontWeight: 'bold', color: asg.score >= 7 ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {asg.score}/10
                        </td>
                        <td>{new Date(asg.completion_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {selectedEmployeeStats.assignments.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                          Nenhuma atividade concluída.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.5rem 0', color: 'var(--text-title)' }}>Fichas de Avaliação Recentes</h4>
              <div style={styles.questionsDraftList}>
                {selectedEmployeeStats.evaluations.map(ev => (
                  <div key={ev.id} style={{ ...styles.questionDraftItem, border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Período: {ev.period}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.date}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <p><strong>Pontos Positivos:</strong> {ev.positives}</p>
                      <p style={{ marginTop: '0.25rem' }}><strong>Pontos de Melhoria:</strong> {ev.improvements}</p>
                      {ev.training_needed && (
                        <p style={{ marginTop: '0.25rem' }}>
                          <strong>Treinamento Indicado:</strong> <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{ev.training_needed}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {selectedEmployeeStats.evaluations.length === 0 && (
                  <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Nenhuma avaliação física cadastrada pelo gestor.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedEmployee(null)}>
                Fechar Ficha
              </button>
            </div>
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
    marginBottom: '0.75rem'
  },
  kpiLabel: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-title)',
    marginBottom: '0.25rem'
  },
  kpiSubText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  todayActivityMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-block)',
    borderRadius: '6px',
    fontSize: '0.85rem'
  },
  attentionPointsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  attentionPointItem: {
    padding: '1.25rem',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: 'var(--radius-md)'
  },
  attentionPointMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  attentionPointText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-title)',
    lineHeight: '1.4'
  },
  aiRecommendationBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    marginTop: '0.75rem',
    fontSize: '0.85rem'
  },
  emptyAttention: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    justifyContent: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  questionsDraftList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  questionDraftItem: {
    backgroundColor: 'var(--bg-block)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem'
  },
  trMetaRow: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  trMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    textAlign: 'center'
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
  profileHeaderSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem'
  },
  profileAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    backgroundColor: 'var(--border-color)',
    color: 'var(--color-primary)',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
