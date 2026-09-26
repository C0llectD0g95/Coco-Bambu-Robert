import React, { useState, useEffect, useMemo } from 'react';
import { supabaseService } from '../services/supabaseService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  X, 
  CheckCircle2 
} from 'lucide-react';

export default function MonthlyScheduleMatrix({ currentUser, canEdit = true }) {
  // Navigation & Selection states
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // 0-indexed: 7 = Agosto
  const [selectedUnit, setSelectedUnit] = useState('');

  // Loaded DB Data
  const [allUsers, setAllUsers] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  
  // Interactive cell editing state
  const [editingCell, setEditingCell] = useState(null); // { user, dayObj, existing }
  const [editShift, setEditShift] = useState('Almoço');
  const [editHours, setEditHours] = useState('08:00 - 16:00');
  const [editIsOff, setEditIsOff] = useState(false);
  const [editNote, setEditNote] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (text, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, selectedUnit]);

  const loadData = async () => {
    try {
      const [users, units, schedules] = await Promise.all([
        supabaseService.getTable('users'),
        supabaseService.getTable('units'),
        supabaseService.getTable('work_schedules')
      ]);

      setAllUsers(users);
      setAllUnits(units);
      setAllSchedules(schedules);
    } catch (e) {
      console.error('Error loading schedule matrix data:', e);
    }
  };

  // Filter employees based on current user role & unit selection
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      // Must be employee or gestor
      if (u.role !== 'funcionario' && u.role !== 'gestor') return false;

      // Role check: If gestor, only show team members of their unit unless admin
      if (currentUser?.role === 'gestor' && currentUser.unit_id) {
        if (u.unit_id && u.unit_id !== currentUser.unit_id) return false;
      }

      // Unit filter
      if (selectedUnit && u.unit_id !== selectedUnit) return false;

      return true;
    });
  }, [allUsers, currentUser, selectedUnit]);

  // Generate days array for the selected month
  const daysInMonth = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArr = [];

    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dayOfWeekIdx = dateObj.getDay();
      
      const yyyy = selectedYear;
      const mm = String(selectedMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isToday = 
        now.getFullYear() === selectedYear && 
        now.getMonth() === selectedMonth && 
        now.getDate() === day;

      daysArr.push({
        dayNum: dd,
        dayOfWeek: weekDaysShort[dayOfWeekIdx],
        isWeekend: dayOfWeekIdx === 0 || dayOfWeekIdx === 6,
        isSunday: dayOfWeekIdx === 0,
        isSaturday: dayOfWeekIdx === 6,
        isToday,
        dateStr
      });
    }

    return daysArr;
  }, [selectedYear, selectedMonth]);

  // Quick Map for O(1) schedule lookup: key -> `${userId}_${dateStr}`
  const scheduleMap = useMemo(() => {
    const map = new Map();
    allSchedules.forEach(s => {
      map.set(`${s.user_id}_${s.date}`, s);
    });
    return map;
  }, [allSchedules]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Open Cell Edit Modal
  const handleCellClick = (user, dayObj) => {
    if (!canEdit) return;
    const existing = scheduleMap.get(`${user.id}_${dayObj.dateStr}`);
    
    setEditingCell({
      user,
      dayObj,
      existing
    });

    if (existing) {
      setEditShift(existing.shift || 'Almoço');
      setEditHours(existing.hours || '08:00 - 16:00');
      setEditIsOff(existing.off_day || existing.shift === 'Folga');
      setEditNote(existing.note || '');
    } else {
      setEditShift('Almoço');
      setEditHours('08:00 - 16:00');
      setEditIsOff(false);
      setEditNote('');
    }
  };

  // Save single schedule edit
  const handleSaveCell = async (e) => {
    e.preventDefault();
    if (!editingCell) return;

    const { user, dayObj } = editingCell;

    const payload = [{
      user_id: user.id,
      date: dayObj.dateStr,
      shift: editIsOff ? 'Folga' : editShift,
      hours: editIsOff ? 'Folga' : editHours,
      off_day: editIsOff,
      note: editNote
    }];

    await supabaseService.saveWorkSchedules(payload);
    showToast(`Escala de ${user.name} atualizada para ${dayObj.dayNum}/${selectedMonth + 1}!`);
    setEditingCell(null);
    loadData();
  };

  const monthLabelsFull = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const currentUnitName = useMemo(() => {
    if (!selectedUnit) return 'Todas as unidades';
    const found = allUnits.find(u => u.id === selectedUnit);
    return found ? found.name : 'Todas as unidades';
  }, [selectedUnit, allUnits]);

  return (
    <div className="monthly-matrix-wrapper" style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* 1. CABEÇALHO & CONTROLES */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-title)', color: 'var(--text-title)', margin: 0 }}>
              Escala mensal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Unidade: <strong style={{ color: 'var(--text-title)' }}>{currentUnitName}</strong> • Mês: <strong style={{ color: 'var(--text-title)' }}>{monthLabelsFull[selectedMonth]} de {selectedYear}</strong>
            </p>
          </div>

          {/* Controls: Nav month/year/unit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Unit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFFFF', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Building2 size={16} color="var(--color-primary)" />
              <select 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-title)', cursor: 'pointer' }}
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                <option value="">Todas as Unidades</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Month / Year Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#FFFFFF', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                onClick={handlePrevMonth}
                style={{ background: 'none', border: 'none', padding: '0.35rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                title="Mês Anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <select 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-title)', padding: '0 0.25rem', cursor: 'pointer', textTransform: 'capitalize' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthLabelsFull.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select 
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-title)', padding: '0 0.25rem', cursor: 'pointer' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button 
                type="button"
                onClick={handleNextMonth}
                style={{ background: 'none', border: 'none', padding: '0.35rem', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                title="Próximo Mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Legend / Status Helper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0.65rem 1rem', backgroundColor: 'rgba(247, 243, 236, 0.7)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', textAlign: 'center', lineHeight: '18px', fontWeight: 'bold', color: '#1E293B', fontSize: '0.75rem' }}>X</span>
            <span>Escalado (Trabalho)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', textAlign: 'center', lineHeight: '18px', color: '#94A3B8', fontSize: '0.7rem' }}>-</span>
            <span>Folga</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}></span>
            <span>Fim de semana (Sáb / Dom)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#DBEAFE', border: '2px solid #3B82F6' }}></span>
            <span>Dia Atual</span>
          </div>
        </div>
      </div>

      {/* 2. TABELA MATRIZ DA ESCALA */}
      <div 
        className="matrix-container"
        style={{
          width: '100%',
          maxWidth: '100%',
          maxHeight: '68vh',
          overflowX: 'auto',
          overflowY: 'auto',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}
      >
        <table 
          style={{
            minWidth: `${210 + daysInMonth.length * 54 + 20}px`,
            width: 'max-content',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.85rem'
          }}
        >
          <thead>
            <tr>
              {/* STICKY FIRST COLUMN HEADER */}
              <th 
                style={{
                  position: 'sticky',
                  left: 0,
                  top: 0,
                  zIndex: 4,
                  backgroundColor: '#F8FAFC',
                  color: 'var(--text-title)',
                  fontWeight: '700',
                  padding: '0.75rem 1rem',
                  borderBottom: '2px solid var(--border-color)',
                  borderRight: '2px solid var(--border-color)',
                  textAlign: 'left',
                  width: '210px',
                  minWidth: '210px',
                  boxShadow: '3px 0 6px rgba(0,0,0,0.04)'
                }}
              >
                Funcionário
              </th>

              {/* DAY COLUMNS HEADERS */}
              {daysInMonth.map((dayObj, dIdx) => {
                let bgHeader = '#F8FAFC';
                if (dayObj.isToday) bgHeader = '#EFF6FF';
                else if (dayObj.isWeekend) bgHeader = '#FEFCE8';

                const isLast = dIdx === daysInMonth.length - 1;

                return (
                  <th 
                    key={dayObj.dayNum}
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      backgroundColor: bgHeader,
                      color: dayObj.isToday ? '#1E40AF' : dayObj.isWeekend ? '#92400E' : 'var(--text-title)',
                      fontWeight: '700',
                      padding: '0.6rem 0.25rem',
                      borderBottom: '2px solid var(--border-color)',
                      borderRight: isLast ? 'none' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      width: '54px',
                      minWidth: '54px',
                      paddingRight: isLast ? '1rem' : '0.25rem'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>{dayObj.dayNum}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.85, textTransform: 'capitalize' }}>
                      {dayObj.dayOfWeek}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => {
              const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA';

              return (
                <tr key={user.id} style={{ backgroundColor: rowBg }}>
                  {/* STICKY FIRST COLUMN CELL (NAME) */}
                  <td
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      backgroundColor: rowBg,
                      fontWeight: '600',
                      color: 'var(--text-title)',
                      padding: '0.65rem 1rem',
                      borderBottom: '1px solid #E2E8F0',
                      borderRight: '2px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                      width: '210px',
                      minWidth: '210px',
                      boxShadow: '3px 0 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div>{user.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      {user.position_id === 'p-garcom' ? 'Garçom' : user.position_id === 'p-cozinheiro' ? 'Cozinheiro' : user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                    </div>
                  </td>

                  {/* DAY CELLS */}
                  {daysInMonth.map((dayObj, dIdx) => {
                    const schKey = `${user.id}_${dayObj.dateStr}`;
                    const sch = scheduleMap.get(schKey);
                    const isScheduled = sch && !sch.off_day && sch.shift !== 'Folga';
                    const isLast = dIdx === daysInMonth.length - 1;

                    let cellBg = 'transparent';
                    if (dayObj.isToday) cellBg = 'rgba(59, 130, 246, 0.06)';
                    else if (dayObj.isWeekend) cellBg = 'rgba(254, 243, 199, 0.35)';

                    return (
                      <td
                        key={dayObj.dayNum}
                        onClick={() => handleCellClick(user, dayObj)}
                        title={
                          isScheduled 
                            ? `${user.name} - ${dayObj.dayNum}/${selectedMonth + 1}: ${sch.shift} (${sch.hours})`
                            : `${user.name} - ${dayObj.dayNum}/${selectedMonth + 1}: Folga`
                        }
                        style={{
                          backgroundColor: cellBg,
                          borderBottom: '1px solid #E2E8F0',
                          borderRight: isLast ? 'none' : '1px solid #E2E8F0',
                          textAlign: 'center',
                          padding: '0.4rem 0.2rem',
                          paddingRight: isLast ? '1rem' : '0.2rem',
                          width: '54px',
                          minWidth: '54px',
                          cursor: canEdit ? 'pointer' : 'default',
                          userSelect: 'none',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {isScheduled ? (
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                          >
                            X
                          </div>
                        ) : (
                          <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={daysInMonth.length + 1} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Nenhum funcionário encontrado para esta unidade/filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. MODAL DE EDIÇÃO INTERATIVA DA CÉLULA */}
      {editingCell && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.25rem' }}>
                  {editingCell.dayObj.dayNum} / {monthLabelsFull[selectedMonth]} ({editingCell.dayObj.dayOfWeek})
                </span>
                <h3 className="modal-title" style={{ color: 'var(--text-title)', fontSize: '1.15rem' }}>
                  Escala: {editingCell.user.name}
                </h3>
              </div>
              <button 
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setEditingCell(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCell}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input 
                    type="checkbox" 
                    id="isOffCheck"
                    checked={editIsOff}
                    onChange={(e) => setEditIsOff(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isOffCheck" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-title)', cursor: 'pointer' }}>
                    Definir como FOLGA neste dia
                  </label>
                </div>

                {!editIsOff && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Turno de Trabalho</label>
                      <select 
                        className="form-select"
                        value={editShift}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditShift(val);
                          if (val === 'Almoço') setEditHours('08:00 - 16:00');
                          else if (val === 'Jantar') setEditHours('15:00 - 23:00');
                          else if (val === 'Integral') setEditHours('10:00 - 22:00');
                        }}
                      >
                        <option value="Almoço">Almoço (08:00 - 16:00)</option>
                        <option value="Jantar">Jantar (15:00 - 23:00)</option>
                        <option value="Integral">Integral (10:00 - 22:00)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Horário de Trabalho</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        placeholder="ex: 08:00 - 16:00"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Observações (Opcional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="ex: Férias, Atestado, Troca de turno..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCell(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Escala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: toast.isError ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={18} />
          {toast.text}
        </div>
      )}
    </div>
  );
}
