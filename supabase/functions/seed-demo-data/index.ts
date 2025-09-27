import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedRequest {
  action?: 'seed' | 'cleanup';
  confirm?: boolean;
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

    const body: SeedRequest = await req.json();
    const { action = 'seed', confirm = false } = body;

    if (!confirm) {
      return new Response(
        JSON.stringify({ 
          error: 'Confirmation required. Set confirm: true to proceed with demo data operation.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    let result;

    switch (action) {
      case 'seed':
        result = await seedDemoData(supabase, user.id);
        break;
      case 'cleanup':
        result = await cleanupDemoData(supabase, user.id);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in seed-demo-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'SEED_ERROR',
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

async function seedDemoData(supabase: any, userId: string) {
  console.log('Starting demo data seeding for user:', userId);

  // Check if demo data already exists
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)
    .ilike('name', '%[DEMO]%');

  if (existingProjects && existingProjects.length > 0) {
    throw new Error('Demo data already exists. Use cleanup action first.');
  }

  try {
    // Create demo teams
    const teams = [
      {
        name: '[DEMO] Desenvolvimento',
        description: 'Equipe responsável pelo desenvolvimento de software',
        leader_id: userId,
        color: '#3B82F6'
      },
      {
        name: '[DEMO] Design',
        description: 'Equipe criativa e de experiência do usuário',
        leader_id: userId,
        color: '#8B5CF6'
      },
      {
        name: '[DEMO] Marketing',
        description: 'Equipe de marketing e comunicação',
        leader_id: userId,
        color: '#EF4444'
      },
      {
        name: '[DEMO] QA',
        description: 'Equipe de qualidade e testes',
        leader_id: userId,
        color: '#10B981'
      }
    ];

    const { data: createdTeams, error: teamsError } = await supabase
      .from('teams')
      .insert(teams)
      .select();

    if (teamsError) {
      throw new Error(`Failed to create demo teams: ${teamsError.message}`);
    }

    console.log('Created demo teams:', createdTeams.length);

    // Add user to all demo teams
    const teamMemberships = createdTeams.map((team: any) => ({
      team_id: team.id,
      user_id: userId,
      role: 'admin'
    }));

    await supabase
      .from('team_members')
      .insert(teamMemberships);

    // Create demo projects
    const projects = [
      {
        name: '[DEMO] Sistema de Gestão',
        short_description: 'Plataforma completa de gestão empresarial',
        long_description: 'Sistema integrado para gerenciamento de recursos humanos, financeiro e operacional da empresa.',
        owner_id: userId,
        start_date: '2024-01-15',
        end_date: '2024-12-31',
        status: 'active',
        priority: 'high',
        tags: ['gestão', 'sistema', 'integração'],
        progress_percentage: 65
      },
      {
        name: '[DEMO] App Mobile',
        short_description: 'Aplicativo móvel para clientes',
        long_description: 'Desenvolvimento de aplicativo mobile multiplataforma para melhorar a experiência dos clientes.',
        owner_id: userId,
        start_date: '2024-02-01',
        end_date: '2024-08-30',
        status: 'active',
        priority: 'medium',
        tags: ['mobile', 'app', 'clientes'],
        progress_percentage: 40
      },
      {
        name: '[DEMO] Site Institucional',
        short_description: 'Novo website da empresa',
        long_description: 'Redesign completo do site institucional com foco em conversão e experiência do usuário.',
        owner_id: userId,
        start_date: '2024-03-01',
        end_date: '2024-06-15',
        status: 'completed',
        priority: 'medium',
        tags: ['website', 'marketing', 'institucional'],
        progress_percentage: 100
      }
    ];

    const { data: createdProjects, error: projectsError } = await supabase
      .from('projects')
      .insert(projects)
      .select();

    if (projectsError) {
      throw new Error(`Failed to create demo projects: ${projectsError.message}`);
    }

    console.log('Created demo projects:', createdProjects.length);

    // Associate projects with teams
    const projectTeams = [
      { project_id: createdProjects[0].id, team_id: createdTeams[0].id }, // Sistema - Dev
      { project_id: createdProjects[0].id, team_id: createdTeams[3].id }, // Sistema - QA
      { project_id: createdProjects[1].id, team_id: createdTeams[0].id }, // App - Dev
      { project_id: createdProjects[1].id, team_id: createdTeams[1].id }, // App - Design
      { project_id: createdProjects[2].id, team_id: createdTeams[1].id }, // Site - Design
      { project_id: createdProjects[2].id, team_id: createdTeams[2].id }  // Site - Marketing
    ];

    await supabase
      .from('project_teams')
      .insert(projectTeams);

    // Create demo tasks
    const tasks = [
      // Sistema de Gestão tasks
      {
        title: '[DEMO] Implementar autenticação',
        description: 'Desenvolver sistema de login e controle de acesso',
        project_id: createdProjects[0].id,
        priority: 'high',
        status: 'completed',
        progress_percentage: 100,
        due_date: '2024-02-15T23:59:59Z',
        time_spent_minutes: 480
      },
      {
        title: '[DEMO] Dashboard principal',
        description: 'Criar dashboard com métricas e indicadores principais',
        project_id: createdProjects[0].id,
        priority: 'high',
        status: 'in_progress',
        progress_percentage: 70,
        due_date: '2024-04-30T23:59:59Z',
        time_spent_minutes: 720
      },
      {
        title: '[DEMO] Relatórios financeiros',
        description: 'Implementar geração de relatórios financeiros em PDF',
        project_id: createdProjects[0].id,
        priority: 'medium',
        status: 'pending',
        progress_percentage: 0,
        due_date: '2024-06-15T23:59:59Z'
      },
      
      // App Mobile tasks
      {
        title: '[DEMO] Protótipo UI/UX',
        description: 'Criar protótipos navegáveis das principais telas',
        project_id: createdProjects[1].id,
        priority: 'high',
        status: 'completed',
        progress_percentage: 100,
        due_date: '2024-03-01T23:59:59Z',
        time_spent_minutes: 960
      },
      {
        title: '[DEMO] API REST',
        description: 'Desenvolver API para comunicação com o app',
        project_id: createdProjects[1].id,
        priority: 'high',
        status: 'in_progress',
        progress_percentage: 60,
        due_date: '2024-05-15T23:59:59Z',
        time_spent_minutes: 540
      },
      {
        title: '[DEMO] Testes automatizados',
        description: 'Implementar suíte de testes para o aplicativo',
        project_id: createdProjects[1].id,
        priority: 'medium',
        status: 'pending',
        progress_percentage: 0,
        due_date: '2024-07-30T23:59:59Z'
      },

      // Site Institucional tasks
      {
        title: '[DEMO] Design responsivo',
        description: 'Criar layouts responsivos para todas as páginas',
        project_id: createdProjects[2].id,
        priority: 'high',
        status: 'completed',
        progress_percentage: 100,
        due_date: '2024-04-15T23:59:59Z',
        time_spent_minutes: 600
      },
      {
        title: '[DEMO] SEO e Performance',
        description: 'Otimizar site para motores de busca e performance',
        project_id: createdProjects[2].id,
        priority: 'medium',
        status: 'completed',
        progress_percentage: 100,
        due_date: '2024-05-30T23:59:59Z',
        time_spent_minutes: 320
      },
      {
        title: '[DEMO] Formulário de contato',
        description: 'Implementar formulário com validações e envio de email',
        project_id: createdProjects[2].id,
        priority: 'low',
        status: 'completed',
        progress_percentage: 100,
        due_date: '2024-06-10T23:59:59Z',
        time_spent_minutes: 180
      }
    ];

    const { data: createdTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      throw new Error(`Failed to create demo tasks: ${tasksError.message}`);
    }

    console.log('Created demo tasks:', createdTasks.length);

    // Assign tasks to user
    const taskAssignments = createdTasks.map((task: any) => ({
      task_id: task.id,
      user_id: userId
    }));

    await supabase
      .from('task_assignees')
      .insert(taskAssignments);

    // Associate some tasks with teams
    const taskTeams = [
      { task_id: createdTasks[0].id, team_id: createdTeams[0].id }, // Auth - Dev
      { task_id: createdTasks[1].id, team_id: createdTeams[0].id }, // Dashboard - Dev
      { task_id: createdTasks[3].id, team_id: createdTeams[1].id }, // Protótipo - Design
      { task_id: createdTasks[4].id, team_id: createdTeams[0].id }, // API - Dev
      { task_id: createdTasks[6].id, team_id: createdTeams[1].id }, // Design responsivo - Design
      { task_id: createdTasks[7].id, team_id: createdTeams[2].id }  // SEO - Marketing
    ];

    await supabase
      .from('task_teams')
      .insert(taskTeams);

    // Create some demo activity logs
    const activityLogs = [
      {
        actor_id: userId,
        activity_type: 'project_created',
        entity_type: 'projects',
        entity_id: createdProjects[0].id,
        new_values: { name: projects[0].name, status: 'planning' },
        metadata: { demo: true }
      },
      {
        actor_id: userId,
        activity_type: 'task_progress_updated',
        entity_type: 'tasks',
        entity_id: createdTasks[1].id,
        old_values: { progress_percentage: 50 },
        new_values: { progress_percentage: 70 },
        metadata: { demo: true }
      },
      {
        actor_id: userId,
        activity_type: 'team_created',
        entity_type: 'teams',
        entity_id: createdTeams[0].id,
        new_values: { name: teams[0].name },
        metadata: { demo: true }
      }
    ];

    await supabase
      .from('activity_logs')
      .insert(activityLogs);

    return {
      success: true,
      message: 'Demo data created successfully',
      stats: {
        projects: createdProjects.length,
        teams: createdTeams.length,
        tasks: createdTasks.length,
        activity_logs: activityLogs.length
      }
    };

  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

async function cleanupDemoData(supabase: any, userId: string) {
  console.log('Starting demo data cleanup for user:', userId);

  try {
    // Get all demo projects owned by user
    const { data: demoProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', userId)
      .ilike('name', '%[DEMO]%');

    if (!demoProjects || demoProjects.length === 0) {
      return {
        success: true,
        message: 'No demo data found to cleanup',
        stats: { projects: 0, teams: 0, tasks: 0 }
      };
    }

    const projectIds = demoProjects.map((p: any) => p.id);

    // Delete demo tasks (cascade will handle assignees and team associations)
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .in('project_id', projectIds);

    if (tasksError) {
      throw new Error(`Failed to delete demo tasks: ${tasksError.message}`);
    }

    // Delete demo projects (cascade will handle project_teams)
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .in('id', projectIds);

    if (projectsError) {
      throw new Error(`Failed to delete demo projects: ${projectsError.message}`);
    }

    // Delete demo teams (cascade will handle team_members)
    const { error: teamsError } = await supabase
      .from('teams')
      .delete()
      .eq('leader_id', userId)
      .ilike('name', '%[DEMO]%');

    if (teamsError) {
      throw new Error(`Failed to delete demo teams: ${teamsError.message}`);
    }

    // Clean up demo activity logs
    await supabase
      .from('activity_logs')
      .delete()
      .eq('actor_id', userId)
      .eq('metadata->demo', true);

    return {
      success: true,
      message: 'Demo data cleaned up successfully',
      stats: {
        projects: projectIds.length,
        teams: 'cleaned',
        tasks: 'cleaned'
      }
    };

  } catch (error) {
    console.error('Error cleaning up demo data:', error);
    throw error;
  }
}