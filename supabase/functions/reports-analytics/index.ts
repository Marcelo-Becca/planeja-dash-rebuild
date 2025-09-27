import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportsRequest {
  project_id?: string;
  team_id?: string;
  period?: string; // '7d', '30d', '90d', '1y'
  start_date?: string;
  end_date?: string;
  metrics?: string[]; // ['tasks_completed', 'team_productivity', 'project_progress', etc.]
  format?: 'json' | 'csv';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    const body: ReportsRequest = await req.json();
    const { 
      project_id, 
      team_id, 
      period = '30d', 
      start_date, 
      end_date, 
      metrics = ['overview'], 
      format = 'json' 
    } = body;

    // Calculate date range
    const dateRange = calculateDateRange(period, start_date, end_date);

    // Generate reports based on requested metrics
    const reports: any = {};

    for (const metric of metrics) {
      switch (metric) {
        case 'overview':
          reports.overview = await generateOverviewReport(supabase, user.id, project_id, dateRange);
          break;
        case 'tasks_completed':
          reports.tasks_completed = await generateTasksCompletedReport(supabase, user.id, dateRange, project_id);
          break;
        case 'team_productivity':
          reports.team_productivity = await generateTeamProductivityReport(supabase, user.id, dateRange, team_id);
          break;
        case 'project_progress':
          reports.project_progress = await generateProjectProgressReport(supabase, user.id, dateRange, project_id);
          break;
        case 'activity_timeline':
          reports.activity_timeline = await generateActivityTimelineReport(supabase, user.id, dateRange, project_id);
          break;
        default:
          console.warn(`Unknown metric: ${metric}`);
      }
    }

    const result = {
      success: true,
      period,
      date_range: dateRange,
      generated_at: new Date().toISOString(),
      reports
    };

    if (format === 'csv') {
      const csv = convertToCSV(result);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="planeja-report.csv"'
        }
      });
    }

    return new Response(
      JSON.stringify(result, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in reports-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'REPORTS_ERROR',
          message: errorMessage 
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function calculateDateRange(period: string, startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return { start: new Date(startDate), end: new Date(endDate) };
  }

  const end = new Date();
  const start = new Date();

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

async function generateOverviewReport(supabase: any, userId: string, projectId?: string, dateRange?: any) {
  const baseQuery = supabase
    .from('projects')
    .select(`
      id,
      name,
      status,
      progress_percentage,
      tasks:tasks(
        id,
        status,
        progress_percentage,
        created_at,
        updated_at
      )
    `);

  // Apply filters based on user access
  let query = baseQuery.or(`owner_id.eq.${userId},project_teams.team_members.user_id.eq.${userId}`);

  if (projectId) {
    query = query.eq('id', projectId);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  
  const allTasks = projects.flatMap((p: any) => p.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length;
  const inProgressTasks = allTasks.filter((t: any) => t.status === 'in_progress').length;
  const pendingTasks = allTasks.filter((t: any) => t.status === 'pending').length;

  const avgProjectProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) / totalProjects)
    : 0;

  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    summary: {
      total_projects: totalProjects,
      active_projects: activeProjects,
      completed_projects: completedProjects,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      in_progress_tasks: inProgressTasks,
      pending_tasks: pendingTasks,
      avg_project_progress: avgProjectProgress,
      completion_rate: completionRate
    },
    projects_breakdown: projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress_percentage,
      total_tasks: p.tasks?.length || 0,
      completed_tasks: p.tasks?.filter((t: any) => t.status === 'completed').length || 0
    }))
  };
}

async function generateTasksCompletedReport(supabase: any, userId: string, dateRange: any, projectId?: string) {
  let query = supabase
    .from('tasks')
    .select(`
      id,
      title,
      status,
      progress_percentage,
      created_at,
      updated_at,
      project:projects(id, name, owner_id)
    `)
    .eq('status', 'completed')
    .gte('updated_at', dateRange.start.toISOString())
    .lte('updated_at', dateRange.end.toISOString())
    .order('updated_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data: tasks, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch completed tasks: ${error.message}`);
  }

  // Filter tasks user has access to
  const accessibleTasks = tasks.filter((task: any) => 
    task.project?.owner_id === userId || 
    // Add team member check logic here if needed
    true
  );

  // Group by day
  const tasksByDay: { [key: string]: number } = {};
  accessibleTasks.forEach((task: any) => {
    const day = new Date(task.updated_at).toISOString().split('T')[0];
    tasksByDay[day] = (tasksByDay[day] || 0) + 1;
  });

  // Group by project
  const tasksByProject: { [key: string]: any } = {};
  accessibleTasks.forEach((task: any) => {
    const projectName = task.project?.name || 'Unknown';
    if (!tasksByProject[projectName]) {
      tasksByProject[projectName] = { count: 0, tasks: [] };
    }
    tasksByProject[projectName].count++;
    tasksByProject[projectName].tasks.push({
      id: task.id,
      title: task.title,
      completed_at: task.updated_at
    });
  });

  return {
    total_completed: accessibleTasks.length,
    daily_breakdown: tasksByDay,
    project_breakdown: tasksByProject,
    recent_completions: accessibleTasks.slice(0, 10).map((t: any) => ({
      id: t.id,
      title: t.title,
      project: t.project?.name,
      completed_at: t.updated_at
    }))
  };
}

async function generateTeamProductivityReport(supabase: any, userId: string, dateRange: any, teamId?: string) {
  let query = supabase
    .from('teams')
    .select(`
      id,
      name,
      team_members(
        user:profiles(id, full_name)
      ),
      task_teams(
        task:tasks(
          id,
          title,
          status,
          progress_percentage,
          time_spent_minutes,
          updated_at,
          task_assignees(
            user:profiles(id, full_name)
          )
        )
      )
    `);

  // Filter teams user has access to
  query = query.or(`leader_id.eq.${userId},team_members.user_id.eq.${userId}`);

  if (teamId) {
    query = query.eq('id', teamId);
  }

  const { data: teams, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }

  const teamReports = teams.map((team: any) => {
    const tasks = team.task_teams?.map((tt: any) => tt.task).filter((t: any) => t) || [];
    const tasksInPeriod = tasks.filter((t: any) => 
      new Date(t.updated_at) >= dateRange.start && 
      new Date(t.updated_at) <= dateRange.end
    );

    const completedTasks = tasksInPeriod.filter((t: any) => t.status === 'completed');
    const totalTimeSpent = tasksInPeriod.reduce((sum: number, t: any) => sum + (t.time_spent_minutes || 0), 0);
    const avgProgress = tasksInPeriod.length > 0 
      ? Math.round(tasksInPeriod.reduce((sum: number, t: any) => sum + (t.progress_percentage || 0), 0) / tasksInPeriod.length)
      : 0;

    const members = team.team_members?.map((tm: any) => tm.user) || [];

    return {
      team_id: team.id,
      team_name: team.name,
      member_count: members.length,
      tasks_in_period: tasksInPeriod.length,
      completed_tasks: completedTasks.length,
      completion_rate: tasksInPeriod.length > 0 
        ? Math.round((completedTasks.length / tasksInPeriod.length) * 100) 
        : 0,
      avg_progress: avgProgress,
      total_time_spent_hours: Math.round(totalTimeSpent / 60),
      members: members.map((m: any) => ({ id: m.id, name: m.full_name }))
    };
  });

  return {
    teams: teamReports,
    summary: {
      total_teams: teams.length,
      avg_completion_rate: teamReports.length > 0 
        ? Math.round(teamReports.reduce((sum: number, t: any) => sum + t.completion_rate, 0) / teamReports.length)
        : 0,
      total_time_spent_hours: teamReports.reduce((sum: number, t: any) => sum + t.total_time_spent_hours, 0)
    }
  };
}

async function generateProjectProgressReport(supabase: any, userId: string, dateRange: any, projectId?: string) {
  // This function would track project progress over time
  // Implementation similar to other report functions
  return {
    message: 'Project progress report - implementation needed based on specific requirements'
  };
}

async function generateActivityTimelineReport(supabase: any, userId: string, dateRange: any, projectId?: string) {
  let query = supabase
    .from('activity_logs')
    .select(`
      id,
      activity_type,
      entity_type,
      entity_id,
      created_at,
      actor:profiles(full_name),
      metadata
    `)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: activities, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  // Group by activity type
  const activitiesByType: { [key: string]: number } = {};
  activities.forEach((activity: any) => {
    activitiesByType[activity.activity_type] = (activitiesByType[activity.activity_type] || 0) + 1;
  });

  // Group by day
  const activitiesByDay: { [key: string]: number } = {};
  activities.forEach((activity: any) => {
    const day = new Date(activity.created_at).toISOString().split('T')[0];
    activitiesByDay[day] = (activitiesByDay[day] || 0) + 1;
  });

  return {
    total_activities: activities.length,
    by_type: activitiesByType,
    by_day: activitiesByDay,
    recent_activities: activities.slice(0, 20).map((a: any) => ({
      type: a.activity_type,
      entity: a.entity_type,
      actor: a.actor?.full_name || 'Unknown',
      timestamp: a.created_at
    }))
  };
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - could be enhanced based on specific needs
  const headers = ['Metric', 'Value', 'Period'];
  const rows = [headers.join(',')];
  
  if (data.reports.overview) {
    const overview = data.reports.overview.summary;
    Object.entries(overview).forEach(([key, value]) => {
      rows.push(`"${key}","${value}","${data.period}"`);
    });
  }
  
  return rows.join('\n');
}