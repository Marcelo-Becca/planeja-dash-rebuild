# Planeja+ Testing Checklist

## Manual Testing Checklist

### Authentication & Session Management
- [ ] User registration with email/password
- [ ] User login with valid credentials
- [ ] Session persists after browser refresh
- [ ] Session persists after browser close/reopen
- [ ] Logout clears all session data
- [ ] Profile creation on first registration
- [ ] Cannot access protected routes without auth

### Projects Management
- [ ] Create new project as owner
- [ ] Edit project details (name, description, dates)
- [ ] Update project status and priority
- [ ] View project progress calculation
- [ ] Delete own project
- [ ] Cannot edit/delete others' projects
- [ ] Associate teams with projects

### Tasks Management
- [ ] Create task in accessible project
- [ ] Edit task details and progress
- [ ] Progress 100% automatically sets status to 'completed'
- [ ] Status 'completed' automatically sets progress to 100%
- [ ] Progress > 0 changes 'pending' to 'in_progress'
- [ ] Assign users to tasks
- [ ] Associate teams with tasks
- [ ] Delete tasks (project owners only)

### Teams Management
- [ ] Create team as leader
- [ ] Add/remove team members
- [ ] Edit team details (name, description, color)
- [ ] Team members see teams they belong to
- [ ] Team leaders can manage teams
- [ ] Associate teams with projects

### Invitations System
- [ ] Create invitation for project/team
- [ ] Generate unique invitation token
- [ ] Send invitation via internal notification
- [ ] Copy invitation link
- [ ] Accept invitation (creates associations)
- [ ] Reject invitation
- [ ] Cancel pending invitation
- [ ] Resend invitation with new expiry
- [ ] Invitation expires after set time
- [ ] Prevent duplicate invitations

### Activity Logging & Audit Trail
- [ ] Project creation/update/deletion logged
- [ ] Task creation/update/deletion logged
- [ ] Task progress changes logged
- [ ] Team management actions logged
- [ ] Invitation actions logged
- [ ] Activity logs visible to authorized users
- [ ] Activity logs include old/new values

### Data Demo System
- [ ] Load demo data manually (not automatic)
- [ ] Demo data clearly marked with [DEMO] prefix
- [ ] Demo data includes projects, teams, tasks
- [ ] Demo data cleanup removes all demo items
- [ ] Demo data doesn't interfere with real data

### Reports & Analytics
- [ ] Generate overview reports
- [ ] Task completion reports by period
- [ ] Team productivity metrics
- [ ] Project progress tracking
- [ ] Activity timeline reports
- [ ] Export reports as CSV
- [ ] Filter reports by date range
- [ ] Paginated results for large datasets

### Security & Permissions
- [ ] RLS policies prevent unauthorized access
- [ ] Users only see their accessible projects/teams
- [ ] Role-based permissions enforced
- [ ] Input validation on all endpoints
- [ ] Rate limiting on sensitive operations
- [ ] SQL injection protection
- [ ] XSS protection on user inputs

## Automated Testing Coverage

### Database Functions
- [ ] Task progress/status synchronization
- [ ] Activity logging triggers
- [ ] User profile creation on registration
- [ ] Invitation token generation
- [ ] Permission check functions

### Edge Functions
- [ ] manage-invitations: all actions
- [ ] seed-demo-data: seed and cleanup
- [ ] reports-analytics: all report types
- [ ] Error handling and validation
- [ ] CORS headers configuration

### API Endpoints (via Supabase Client)
- [ ] Authentication flows
- [ ] CRUD operations for all entities
- [ ] Filtered and paginated queries
- [ ] Real-time subscriptions
- [ ] File upload/download (if applicable)

## Performance Testing
- [ ] Large dataset handling (1000+ tasks)
- [ ] Concurrent user operations
- [ ] Database query optimization
- [ ] Index usage verification
- [ ] Memory usage monitoring
- [ ] Response time measurements

## Security Testing
- [ ] Authentication bypass attempts
- [ ] SQL injection attempts
- [ ] XSS vulnerability testing
- [ ] CSRF protection verification
- [ ] Rate limiting effectiveness
- [ ] Data exposure verification

## Integration Testing
- [ ] Frontend-backend communication
- [ ] Real-time updates propagation
- [ ] Email notification system (when enabled)
- [ ] File storage integration
- [ ] External API integrations

## Deployment Testing
- [ ] Database migrations run successfully
- [ ] Edge functions deploy correctly
- [ ] Environment variables configured
- [ ] SSL/TLS certificates valid
- [ ] Performance in production environment

---

## Test Data Sets

### Minimal Test Data
- 1 user (you)
- 1 project
- 1 team with you as leader
- 3 tasks (pending, in_progress, completed)

### Comprehensive Test Data
- Use the demo data seeder function
- Multiple users, projects, teams, tasks
- Various statuses and progress levels
- Complete activity history

## Commands for Testing

### Load Demo Data
```typescript
const { data } = await supabase.functions.invoke('seed-demo-data', {
  body: { confirm: true }
})
```

### Cleanup Demo Data
```typescript
const { data } = await supabase.functions.invoke('seed-demo-data', {
  body: { action: 'cleanup', confirm: true }
})
```

### Generate Reports
```typescript
const { data } = await supabase.functions.invoke('reports-analytics', {
  body: {
    period: '30d',
    metrics: ['overview', 'tasks_completed', 'team_productivity']
  }
})
```

### Monitor Logs
- Supabase Dashboard > Functions > [function-name] > Logs
- Supabase Dashboard > Auth > Logs  
- Supabase Dashboard > Database > Logs