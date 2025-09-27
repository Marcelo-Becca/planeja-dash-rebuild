# Planeja+ Backend API Documentation

## Overview

Planeja+ é uma aplicação completa de gerenciamento de projetos e equipes construída com Supabase como backend. Esta documentação cobre todas as funcionalidades, endpoints, regras de negócio e instruções de uso.

## Tecnologias

- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Edge Functions**: Deno/TypeScript
- **Row Level Security (RLS)**: Implementado em todas as tabelas

## Estrutura do Banco de Dados

### Entidades Principais

#### Profiles (Usuários)
- Estende `auth.users` do Supabase
- Campos: `id`, `full_name`, `avatar_url`, `company`, `role`, `email_verified`, `metadata`
- Roles: `owner`, `admin`, `member`, `observer`

#### Projects (Projetos)
- Campos: `id`, `name`, `short_description`, `long_description`, `owner_id`, `start_date`, `end_date`, `status`, `priority`, `tags`, `progress_percentage`
- Status: `planning`, `active`, `paused`, `completed`, `cancelled`
- Priority: `low`, `medium`, `high`, `critical`

#### Teams (Equipes)
- Campos: `id`, `name`, `description`, `leader_id`, `color`
- Relacionamento muitos-para-muitos com Projects através de `project_teams`
- Relacionamento muitos-para-muitos com Users através de `team_members`

#### Tasks (Tarefas)
- Campos: `id`, `title`, `description`, `project_id`, `priority`, `status`, `progress_percentage`, `due_date`, `time_spent_minutes`
- Status: `pending`, `in_progress`, `completed`, `cancelled`
- Relacionamento com usuários através de `task_assignees`
- Relacionamento com equipes através de `task_teams`

#### Invitations (Convites)
- Campos: `id`, `sender_id`, `recipient_email`, `recipient_id`, `target_type`, `target_id`, `role`, `token`, `status`, `message`, `expires_at`
- Status: `pending`, `accepted`, `rejected`, `expired`, `cancelled`

#### Activity Logs (Auditoria)
- Registro completo de todas as ações importantes
- Campos: `id`, `actor_id`, `activity_type`, `entity_type`, `entity_id`, `old_values`, `new_values`, `metadata`

## Regras de Negócio

### 1. Sincronização de Status e Progresso (Tarefas)
- Se progresso = 100% → status = 'completed'
- Se progresso > 0 e status = 'pending' → status = 'in_progress'
- Se status = 'completed' → progresso = 100%

### 2. Permissões por Role
- **Owner**: Controle total do sistema
- **Admin**: Pode gerenciar projetos e convidar membros
- **Member**: Pode participar e colaborar
- **Observer**: Apenas visualização

### 3. Controle de Acesso
- Usuários só veem projetos onde são proprietários ou membros de equipes associadas
- Líderes de equipe podem gerenciar suas equipes
- Proprietários de projeto podem gerenciar seus projetos

### 4. Convites
- Token único gerado automaticamente
- Prevenção de convites duplicados
- Expiração automática baseada na data
- Associação automática ao aceitar convite

## Row Level Security (RLS)

### Profiles
```sql
-- Usuários podem ver todos os perfis
-- Usuários podem editar apenas seu próprio perfil
```

### Projects
```sql
-- Usuários veem projetos onde têm acesso (proprietário ou membro de equipe associada)
-- Apenas proprietários podem editar/deletar projetos
```

### Tasks
```sql
-- Usuários veem tarefas de projetos acessíveis
-- Usuários podem criar/editar tarefas em projetos acessíveis
-- Apenas proprietários de projeto podem deletar tarefas
```

### Teams
```sql
-- Usuários veem equipes onde são membros ou líderes
-- Apenas líderes podem editar/deletar equipes
```

## Endpoints da API (via Supabase Client)

### Autenticação

#### Registro
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
})
```

#### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

#### Logout
```typescript
const { error } = await supabase.auth.signOut()
```

### Projetos

#### Listar Projetos
```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    owner:profiles!owner_id(id, full_name),
    project_teams(
      team:teams(id, name, color)
    )
  `)
  .order('created_at', { ascending: false })
```

#### Criar Projeto
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    name: 'Novo Projeto',
    short_description: 'Descrição breve',
    long_description: 'Descrição detalhada',
    owner_id: user.id,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'planning',
    priority: 'medium'
  })
```

#### Atualizar Projeto
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    name: 'Nome Atualizado',
    status: 'active'
  })
  .eq('id', projectId)
```

### Tarefas

#### Listar Tarefas do Projeto
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select(`
    *,
    task_assignees(
      user:profiles(id, full_name, avatar_url)
    ),
    task_teams(
      team:teams(id, name, color)
    )
  `)
  .eq('project_id', projectId)
  .order('created_at', { ascending: false })
```

#### Criar Tarefa
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Nova Tarefa',
    description: 'Descrição da tarefa',
    project_id: projectId,
    priority: 'medium',
    due_date: '2024-12-31'
  })
```

#### Atualizar Progresso da Tarefa
```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({
    progress_percentage: 75
    // Status será sincronizado automaticamente via trigger
  })
  .eq('id', taskId)
```

### Equipes

#### Listar Equipes
```typescript
const { data, error } = await supabase
  .from('teams')
  .select(`
    *,
    leader:profiles!leader_id(id, full_name),
    team_members(
      user:profiles(id, full_name, avatar_url),
      role
    )
  `)
  .order('name')
```

#### Criar Equipe
```typescript
const { data, error } = await supabase
  .from('teams')
  .insert({
    name: 'Nova Equipe',
    description: 'Descrição da equipe',
    leader_id: user.id,
    color: '#3B82F6'
  })
```

### Convites

#### Criar Convite
```typescript
// Chamada para Edge Function
const { data, error } = await supabase.functions.invoke('manage-invitations', {
  body: {
    action: 'create',
    recipient_email: 'user@example.com',
    target_type: 'project',
    target_id: projectId,
    role: 'member',
    message: 'Venha participar do projeto!',
    expires_in_days: 7
  }
})
```

#### Aceitar Convite
```typescript
const { data, error } = await supabase.functions.invoke('manage-invitations', {
  body: {
    action: 'accept',
    token: 'invitation_token_here'
  }
})
```

### Logs de Atividade

#### Buscar Histórico de Projeto
```typescript
const { data, error } = await supabase
  .from('activity_logs')
  .select(`
    *,
    actor:profiles(full_name, avatar_url)
  `)
  .eq('entity_type', 'projects')
  .eq('entity_id', projectId)
  .order('created_at', { ascending: false })
  .limit(50)
```

## Edge Functions

### 1. manage-invitations
**Endpoint**: `/functions/v1/manage-invitations`

Gerencia todo o ciclo de vida dos convites.

#### Ações Suportadas:
- `create`: Criar novo convite
- `accept`: Aceitar convite
- `reject`: Rejeitar convite
- `cancel`: Cancelar convite
- `resend`: Reenviar convite

#### Exemplo de Uso:
```typescript
const { data, error } = await supabase.functions.invoke('manage-invitations', {
  body: {
    action: 'create',
    recipient_email: 'user@example.com',
    target_type: 'project',
    target_id: 'project-uuid',
    role: 'member',
    expires_in_days: 7
  }
})
```

### 2. seed-demo-data
**Endpoint**: `/functions/v1/seed-demo-data`

Popula dados de demonstração no banco. **USO APENAS PARA DESENVOLVIMENTO**.

#### Exemplo de Uso:
```typescript
const { data, error } = await supabase.functions.invoke('seed-demo-data', {
  body: { confirm: true }
})
```

### 3. reports-analytics
**Endpoint**: `/functions/v1/reports-analytics`

Gera relatórios e análises de performance.

#### Exemplo de Uso:
```typescript
const { data, error } = await supabase.functions.invoke('reports-analytics', {
  body: {
    project_id: 'project-uuid',
    period: '30d',
    metrics: ['tasks_completed', 'team_productivity', 'project_progress']
  }
})
```

## Filtros e Paginação

### Padrão de Filtros
Todos os endpoints de listagem suportam:

#### Filtros por Data
```typescript
.gte('created_at', startDate)
.lte('created_at', endDate)
```

#### Filtros por Status
```typescript
.eq('status', 'active')
.in('status', ['active', 'completed'])
```

#### Paginação
```typescript
.range(0, 19) // Primeiros 20 registros
.range(20, 39) // Próximos 20 registros
```

#### Ordenação
```typescript
.order('created_at', { ascending: false })
.order('name', { ascending: true })
```

## Triggers e Automações

### 1. Sincronização de Progresso de Tarefas
- **Trigger**: `sync_task_progress_status_trigger`
- **Função**: `sync_task_progress_status()`
- **Quando**: BEFORE INSERT OR UPDATE na tabela `tasks`

### 2. Log de Atividades
- **Trigger**: `log_*_activity`
- **Função**: `log_activity()`
- **Quando**: AFTER INSERT, UPDATE, DELETE nas principais tabelas

### 3. Atualização de Timestamps
- **Trigger**: `update_*_updated_at`
- **Função**: `update_updated_at_column()`
- **Quando**: BEFORE UPDATE em todas as tabelas

### 4. Criação Automática de Perfil
- **Trigger**: `on_auth_user_created`
- **Função**: `handle_new_user()`
- **Quando**: AFTER INSERT na tabela `auth.users`

## Dados de Demonstração

### Ativação Manual
Os dados de demonstração NÃO são carregados automaticamente. Para ativar:

1. **Via Edge Function**:
```typescript
const { data, error } = await supabase.functions.invoke('seed-demo-data', {
  body: { confirm: true }
})
```

2. **Via Interface Administrativa** (quando disponível):
- Acesse configurações administrativas
- Clique em "Carregar Dados de Demonstração"
- Confirme a ação

### Conteúdo dos Dados Demo
- 3 projetos exemplo
- 5 equipes com diferentes configurações
- 15 tarefas com vários status
- Relacionamentos entre projetos, equipes e tarefas
- Logs de atividade simulados

### Limpeza dos Dados Demo
```typescript
const { data, error } = await supabase.functions.invoke('seed-demo-data', {
  body: { action: 'cleanup' }
})
```

## Performance e Otimização

### Índices Implementados
- `idx_profiles_role`: Busca por role de usuário
- `idx_projects_owner_id`: Projetos por proprietário
- `idx_projects_status`: Projetos por status
- `idx_tasks_project_id`: Tarefas por projeto
- `idx_tasks_status`: Tarefas por status
- `idx_tasks_due_date`: Tarefas por prazo
- `idx_invitations_token`: Busca por token de convite
- `idx_activity_logs_entity`: Logs por entidade
- `idx_activity_logs_created_at`: Logs por data (DESC)

### Recomendações de Uso

#### Paginação
Sempre use paginação para listas grandes:
```typescript
.range(offset, offset + limit - 1)
```

#### Select Otimizado
Use select específico em vez de `*`:
```typescript
.select('id, name, status, created_at')
```

#### Contagem Eficiente
```typescript
const { count } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true })
  .eq('project_id', projectId)
```

## Segurança

### Validação de Entrada
Todas as Edge Functions implementam validação usando schemas Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'admin', 'member', 'observer']),
  target_id: z.string().uuid()
})
```

### Rate Limiting
Implementado nas Edge Functions críticas:
- Criação de convites: 10/minuto por usuário
- Criação de projetos: 5/minuto por usuário

### Auditoria
Todos os logs de atividade incluem:
- Quem executou a ação
- Quando foi executada
- Valores antigos e novos
- Metadados da ação

## Tratamento de Erros

### Códigos de Status
- `200`: Sucesso
- `400`: Erro de validação de entrada
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Recurso não encontrado
- `409`: Conflito (ex: convite duplicado)
- `429`: Rate limit excedido
- `500`: Erro interno do servidor

### Formato de Resposta de Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email é obrigatório",
    "details": {
      "field": "email",
      "value": ""
    }
  }
}
```

## Testes

### Checklist de Testes Manuais

#### Autenticação
- [ ] Registro de usuário com email/senha
- [ ] Login com credenciais válidas
- [ ] Persistência de sessão após reload
- [ ] Logout limpa sessão completamente

#### Projetos
- [ ] Criar projeto como proprietário
- [ ] Editar projeto próprio
- [ ] Não conseguir editar projeto de outros
- [ ] Deletar projeto próprio

#### Tarefas
- [ ] Criar tarefa em projeto próprio
- [ ] Atualizar progresso sincroniza status
- [ ] Marcar como concluída ajusta progresso para 100%
- [ ] Progresso > 0 muda status para 'in_progress'

#### Equipes
- [ ] Criar equipe como líder
- [ ] Adicionar membros à equipe
- [ ] Membros veem equipes onde participam
- [ ] Líder pode editar equipe

#### Convites
- [ ] Criar convite para projeto/equipe
- [ ] Aceitar convite associa corretamente
- [ ] Convite expira após prazo
- [ ] Não permite convites duplicados

#### Auditoria
- [ ] Ações geram logs automaticamente
- [ ] Logs incluem valores antigos/novos
- [ ] Histórico é visível para usuários autorizados

### Testes Automatizados (Recomendados)
```bash
# Instalar dependências de teste
npm install --save-dev @supabase/supabase-js @testing-library/jest-dom

# Executar testes
npm test
```

## Comandos Úteis

### Resetar Banco de Dados (Desenvolvimento)
```sql
-- Executar no SQL Editor do Supabase
SELECT public.expire_old_invitations(); -- Expira convites antigos
```

### Backup de Dados
```bash
# Via Supabase CLI
supabase db dump > backup.sql
```

### Monitoramento
- **Logs de Auth**: Supabase Dashboard > Auth > Logs
- **Logs de Database**: Supabase Dashboard > Database > Logs  
- **Logs de Edge Functions**: Supabase Dashboard > Edge Functions > [function] > Logs

## Links Úteis
- [Supabase Dashboard](https://supabase.com/dashboard/project/ghhvsjrusobrsckhjtjg)
- [Auth Settings](https://supabase.com/dashboard/project/ghhvsjrusobrsckhjtjg/auth/users)
- [Database Tables](https://supabase.com/dashboard/project/ghhvsjrusobrsckhjtjg/editor)
- [Edge Functions](https://supabase.com/dashboard/project/ghhvsjrusobrsckhjtjg/functions)

---

**Versão**: 1.0  
**Última Atualização**: $(date)  
**Suporte**: Para questões técnicas, consulte os logs do Supabase Dashboard ou abra uma issue no repositório do projeto.