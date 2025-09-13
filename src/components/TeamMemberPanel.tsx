import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";

interface TeamMemberPanelProps {
  memberName: string;
  onClose: () => void;
}

export default function TeamMemberPanel({ memberName }: TeamMemberPanelProps) {
  // Mock member details based on name
  const getMemberDetails = (name: string) => {
    switch (name) {
      case "Marina Santos":
        return {
          role: "Product Manager",
          email: "marina@example.com",
          completed: 28,
          inProgress: 4,
          overdue: 1,
          totalTasks: 33,
          completionRate: 85,
          avgCompletionTime: 2.3,
          projects: ["Sistema de Gestão", "Website Institucional"],
          recentTasks: [
            { title: "Definir roadmap Q4", status: "completed", date: "2024-01-15" },
            { title: "Review de UI/UX", status: "in-progress", date: "2024-01-14" },
            { title: "Documentação API", status: "overdue", date: "2024-01-12" },
          ]
        };
      case "Carlos Silva":
        return {
          role: "Developer",
          email: "carlos@example.com",
          completed: 25,
          inProgress: 6,
          overdue: 2,
          totalTasks: 33,
          completionRate: 76,
          avgCompletionTime: 3.1,
          projects: ["Sistema de Gestão", "App Mobile"],
          recentTasks: [
            { title: "Implementar autenticação", status: "completed", date: "2024-01-15" },
            { title: "Setup CI/CD", status: "in-progress", date: "2024-01-13" },
            { title: "Code review", status: "pending", date: "2024-01-11" },
          ]
        };
      case "Ana Costa":
        return {
          role: "Designer",
          email: "ana@example.com",
          completed: 22,
          inProgress: 3,
          overdue: 1,
          totalTasks: 26,
          completionRate: 85,
          avgCompletionTime: 1.8,
          projects: ["App Mobile", "Website Institucional"],
          recentTasks: [
            { title: "Design da homepage", status: "completed", date: "2024-01-14" },
            { title: "Protótipo mobile", status: "in-progress", date: "2024-01-13" },
            { title: "Design system", status: "completed", date: "2024-01-12" },
          ]
        };
      case "Pedro Lima":
        return {
          role: "QA Analyst",
          email: "pedro@example.com",
          completed: 12,
          inProgress: 10,
          overdue: 1,
          totalTasks: 23,
          completionRate: 52,
          avgCompletionTime: 4.2,
          projects: ["Sistema de Gestão"],
          recentTasks: [
            { title: "Testes de integração", status: "in-progress", date: "2024-01-15" },
            { title: "Relatório de bugs", status: "completed", date: "2024-01-13" },
            { title: "Testes unitários", status: "overdue", date: "2024-01-10" },
          ]
        };
      default:
        return {
          role: "Membro da equipe",
          email: "membro@example.com",
          completed: 0,
          inProgress: 0,
          overdue: 0,
          totalTasks: 0,
          completionRate: 0,
          avgCompletionTime: 0,
          projects: [],
          recentTasks: []
        };
    }
  };

  const member = getMemberDetails(memberName);

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-chart-1" />;
      case "in-progress": return <Clock className="w-4 h-4 text-chart-2" />;
      case "overdue": return <AlertTriangle className="w-4 h-4 text-chart-4" />;
      default: return <Clock className="w-4 h-4 text-chart-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Concluída";
      case "in-progress": return "Em andamento";
      case "overdue": return "Atrasada";
      default: return "Pendente";
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Member Profile */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg font-medium">
            {memberName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{memberName}</h3>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-card-foreground">Desempenho</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Taxa de Conclusão</span>
            </div>
            <div className="space-y-1">
              <Progress value={member.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">{member.completionRate}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Tempo Médio</span>
            </div>
            <p className="text-sm font-medium text-card-foreground">
              {member.avgCompletionTime} dias
            </p>
          </div>
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 bg-chart-1/10 rounded border border-chart-1/20">
            <p className="text-lg font-bold text-chart-1">{member.completed}</p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
          <div className="p-3 bg-chart-2/10 rounded border border-chart-2/20">
            <p className="text-lg font-bold text-chart-2">{member.inProgress}</p>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </div>
          <div className="p-3 bg-chart-4/10 rounded border border-chart-4/20">
            <p className="text-lg font-bold text-chart-4">{member.overdue}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-lg font-bold text-card-foreground">{member.totalTasks}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-card-foreground">Projetos Ativos</h4>
        <div className="flex flex-wrap gap-2">
          {member.projects.map((project, index) => (
            <Badge key={index} variant="secondary">
              {project}
            </Badge>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-card-foreground">Tarefas Recentes</h4>
        <div className="space-y-2">
          {member.recentTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                {getTaskStatusIcon(task.status)}
                <div>
                  <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}