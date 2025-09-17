import Layout from "@/components/Layout";
import DaySummaryCard from "@/components/DaySummaryCard";
import WeeklyProgressCard from "@/components/WeeklyProgressCard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Bem-vindo(a), <span className="text-primary">{user?.displayName || user?.name.split(' ')[0]}</span>!
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Aqui está um resumo da sua produtividade hoje
              </p>
            </div>
            
            {/* Optional header actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {/* Day Summary Card */}
            <DaySummaryCard />
            
            {/* Weekly Progress Card */}
            <WeeklyProgressCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
