import { supabase } from './supabaseClient';

export const supabaseService = {
  // ---------------- GENERIC CRUD ----------------
  async getTable(tableName) {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error fetching table ${tableName}:`, error);
      return [];
    }
    return data || [];
  },

  async getById(tableName, id) {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) {
      console.error(`Error fetching ${tableName} by id ${id}:`, error);
      return null;
    }
    return data;
  },

  async saveItem(tableName, item) {
    try {
      const itemToSave = { ...item };
      if (!itemToSave.id) {
        itemToSave.id = `${tableName.substring(0, 3)}-${Date.now()}`;
        const { data, error } = await supabase.from(tableName).insert(itemToSave).select().single();
        if (error) console.error(`Error inserting into ${tableName}:`, error);
        return data || itemToSave;
      } else {
        const { data, error } = await supabase.from(tableName).upsert(itemToSave).select().single();
        if (error) console.error(`Error upserting into ${tableName}:`, error);
        return data || itemToSave;
      }
    } catch (e) {
      console.error(`Error in saveItem for ${tableName}:`, e);
      return item;
    }
  },

  async deleteItem(tableName, id) {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) console.error(`Error deleting from ${tableName}:`, error);
    return !error;
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  async markAllNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) console.error('Error marking notifications as read:', error);
    return !error;
  },

  async deleteNotification(id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting notification:', error);
    return !error;
  },

  // ---------------- EMPLOYEE DASHBOARD ----------------
  async getEmployeeActivities(user) {
    try {
      let query = supabase.from('activities').select('*').eq('status', 'published');
      const { data: activities, error: actError } = await query;
      if (actError || !activities) return [];

      const filteredActivities = activities.filter(act => {
        const matchesUnit = user.role === 'admin' || !act.unit_id || act.unit_id === user.unit_id;
        const matchesAudience = user.role === 'admin' || act.target_audience === 'Todos' || act.sector_id === user.department_id;
        return matchesUnit && matchesAudience;
      });

      const { data: assignments } = await supabase
        .from('activity_assignments')
        .select('*')
        .eq('user_id', user.id);

      const asgList = assignments || [];

      return filteredActivities.map(act => {
        const asg = asgList.find(a => a.activity_id === act.id);
        return {
          ...act,
          assignment_id: asg ? asg.id : null,
          status_assignment: asg ? asg.status : 'pending',
          score: asg ? asg.score : null,
          max_score: asg ? asg.max_score : 10,
          completion_date: asg ? asg.completion_date : null
        };
      });
    } catch (e) {
      console.error('Error in getEmployeeActivities:', e);
      return [];
    }
  },

  async getDocuments(user) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'active');
      if (error || !data) return [];

      return data.filter(d => 
        user.role === 'admin' || !d.sector_id || d.sector_id === user.department_id
      );
    } catch (e) {
      console.error('Error in getDocuments:', e);
      return [];
    }
  },

  async getWarmups(user) {
    try {
      let query = supabase
        .from('warmups')
        .select('*')
        .eq('status', 'completed')
        .order('date_created', { ascending: false });

      if (user.role !== 'admin' && user.unit_id) {
        query = query.eq('unit_id', user.unit_id);
      }
      if (user.role !== 'admin' && user.department_id) {
        query = query.eq('sector_id', user.department_id);
      }

      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch (e) {
      console.error('Error in getWarmups:', e);
      return [];
    }
  },

  async getTrainings(user) {
    try {
      let query = supabase
        .from('trainings')
        .select('*')
        .eq('status', 'scheduled')
        .order('date', { ascending: true });

      const { data, error } = await query;
      if (error || !data) return [];

      return data.filter(t => 
        (user.role === 'admin' || !t.unit_id || t.unit_id === user.unit_id) &&
        (user.role === 'admin' || !t.sector_id || t.sector_id === user.department_id)
      );
    } catch (e) {
      console.error('Error in getTrainings:', e);
      return [];
    }
  },

  async getWorkSchedules(userId) {
    try {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      if (error) return [];
      return data || [];
    } catch (e) {
      console.error('Error in getWorkSchedules:', e);
      return [];
    }
  },

  async getActivityQuestions(activityId) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('activity_id', activityId)
        .order('question_index', { ascending: true });
      if (error) return [];
      return data || [];
    } catch (e) {
      console.error('Error in getActivityQuestions:', e);
      return [];
    }
  },

  async submitActivity(userId, activityId, answersList) {
    try {
      const questions = await this.getActivityQuestions(activityId);

      const { data: existingAsg } = await supabase
        .from('activity_assignments')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', userId)
        .single();

      if (existingAsg && existingAsg.status === 'completed') {
        return { success: false, message: 'Atividade já concluída.' };
      }

      let assignmentId = existingAsg ? existingAsg.id : `asg-${Date.now()}`;
      let score = 0;

      const answersToInsert = answersList.map(ans => {
        const question = questions.find(q => q.id === ans.question_id);
        const isCorrect = question ? question.correct_option === ans.chosen_option : false;
        if (isCorrect) score++;

        return {
          id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          assignment_id: assignmentId,
          question_id: ans.question_id,
          chosen_option: ans.chosen_option,
          is_correct: isCorrect
        };
      });

      const asgData = {
        id: assignmentId,
        activity_id: activityId,
        user_id: userId,
        status: 'completed',
        completion_date: new Date().toISOString(),
        score: score,
        max_score: questions.length || 10
      };

      if (existingAsg) {
        await supabase.from('activity_assignments').update(asgData).eq('id', assignmentId);
      } else {
        await supabase.from('activity_assignments').insert(asgData);
      }

      if (answersToInsert.length > 0) {
        await supabase.from('answers').insert(answersToInsert);
      }

      return { success: true, assignment: asgData, score, total: questions.length };
    } catch (e) {
      console.error('Error in submitActivity:', e);
      return { success: false, message: 'Erro ao enviar atividade.' };
    }
  },

  async getAssignmentDetails(assignmentId) {
    try {
      const { data: asg } = await supabase
        .from('activity_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (!asg) return null;

      const { data: activity } = await supabase
        .from('activities')
        .select('*')
        .eq('id', asg.activity_id)
        .single();

      const questions = await this.getActivityQuestions(asg.activity_id);

      const { data: answers } = await supabase
        .from('answers')
        .select('*')
        .eq('assignment_id', asg.id);

      const ansList = answers || [];

      const questionsWithAnswers = questions.map(q => {
        const ans = ansList.find(a => a.question_id === q.id);
        return {
          ...q,
          chosen_option: ans ? ans.chosen_option : null,
          is_correct: ans ? ans.is_correct : false
        };
      });

      return {
        assignment: asg,
        activity,
        questions: questionsWithAnswers
      };
    } catch (e) {
      console.error('Error in getAssignmentDetails:', e);
      return null;
    }
  },

  // ---------------- MANAGER DASHBOARD ----------------
  async getManagerStats(managerId, unitId) {
    try {
      const { data: teamUsers } = await supabase
        .from('users')
        .select('*')
        .eq('unit_id', unitId)
        .eq('role', 'funcionario');
      const team = teamUsers || [];
      const teamUserIds = team.map(u => u.id);

      const { data: warmups } = await supabase
        .from('warmups')
        .select('*')
        .eq('unit_id', unitId);

      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .or(`manager_id.eq.${managerId},unit_id.eq.${unitId}`);

      const actList = activities || [];
      const actIds = actList.map(a => a.id);

      let assignments = [];
      if (teamUserIds.length > 0) {
        const { data: asgs } = await supabase
          .from('activity_assignments')
          .select('*')
          .in('user_id', teamUserIds);
        assignments = asgs || [];
      }

      const activitiesStats = actList.map(act => {
        const actAsgs = assignments.filter(asg => asg.activity_id === act.id);
        const completed = actAsgs.filter(asg => asg.status === 'completed');
        const totalGraded = completed.length;
        
        let average = 0;
        if (totalGraded > 0) {
          const sum = completed.reduce((acc, a) => acc + (a.score || 0), 0);
          average = parseFloat((sum / totalGraded).toFixed(1));
        }

        return {
          ...act,
          total_assigned: team.length,
          completed: totalGraded,
          pending: team.length - totalGraded,
          average_score: average
        };
      });

      let attentionPoints = [];
      if (actIds.length > 0) {
        const { data: questions } = await supabase
          .from('questions')
          .select('*')
          .in('activity_id', actIds);

        const activeQuestions = questions || [];
        const asgIds = assignments.map(a => a.id);

        let answers = [];
        if (asgIds.length > 0) {
          const { data: ans } = await supabase
            .from('answers')
            .select('*')
            .in('assignment_id', asgIds);
          answers = ans || [];
        }

        attentionPoints = activeQuestions.map(q => {
          const qAnswers = answers.filter(ans => ans.question_id === q.id);
          const total = qAnswers.length;
          const wrong = qAnswers.filter(ans => !ans.is_correct).length;
          const errorRate = total > 0 ? Math.round((wrong / total) * 100) : 0;
          const activity = actList.find(a => a.id === q.activity_id);
          
          return {
            question_id: q.id,
            question_text: q.question_text,
            activity_title: activity ? activity.title : '',
            error_rate: errorRate,
            total_answers: total,
            wrong_count: wrong
          };
        }).filter(q => q.error_rate > 0).sort((a, b) => b.error_rate - a.error_rate);
      }

      return {
        total_team: team.length,
        active_team: team.filter(u => u.status === 'active').length,
        warmups_count: (warmups || []).length,
        activities: activitiesStats,
        attention_points: attentionPoints.slice(0, 5)
      };
    } catch (e) {
      console.error('Error in getManagerStats:', e);
      return null;
    }
  },

  async saveWorkSchedules(schedulesList) {
    try {
      for (const item of schedulesList) {
        const scheduleId = item.id || `sch-${item.user_id}-${item.date}`;
        await supabase.from('work_schedules').upsert({
          id: scheduleId,
          user_id: item.user_id,
          date: item.date,
          shift: item.shift,
          hours: item.hours,
          off_day: item.off_day
        });
      }
      return true;
    } catch (e) {
      console.error('Error saving work schedules:', e);
      return false;
    }
  },

  // ---------------- ADMIN DASHBOARD ----------------
  async getAdminStats() {
    try {
      const [users, units, activities, assignments] = await Promise.all([
        this.getTable('users'),
        this.getTable('units'),
        this.getTable('activities'),
        this.getTable('activity_assignments')
      ]);

      const completed = assignments.filter(a => a.status === 'completed');
      let averageScore = 0;
      if (completed.length > 0) {
        const sum = completed.reduce((acc, a) => acc + (a.score || 0), 0);
        averageScore = parseFloat((sum / completed.length).toFixed(1));
      }

      return {
        active_employees: users.filter(u => u.status === 'active' && u.role === 'funcionario').length,
        gestores_count: users.filter(u => u.role === 'gestor').length,
        units_count: units.length,
        activities_count: activities.length,
        assignments_completed: completed.length,
        general_average: averageScore,
        by_unit: units.map(un => {
          const unitUsers = users.filter(u => u.unit_id === un.id && u.role === 'funcionario').map(u => u.id);
          const unitAsgs = assignments.filter(asg => unitUsers.includes(asg.user_id));
          let avg = 0;
          if (unitAsgs.length > 0) {
            avg = parseFloat((unitAsgs.reduce((acc, a) => acc + (a.score || 0), 0) / unitAsgs.length).toFixed(1));
          }
          return {
            unit_name: un.name,
            completions: unitAsgs.length,
            average: avg
          };
        })
      };
    } catch (e) {
      console.error('Error in getAdminStats:', e);
      return null;
    }
  }
};
