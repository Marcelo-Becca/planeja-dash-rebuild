import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, BarChart3, Clock, Zap, Shield, ArrowRight, User, Settings, Target, Star, Quote } from "lucide-react";
import heroMockup from "@/assets/planeja-dashboard-mockup.jpg";
import planejaLogo from "@/assets/planeja-logo.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <img src={planejaLogo} alt="Planeja+" className="h-10 w-auto" />
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Criar conta</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl text-primary">
                  Planeja+
                </h1>
                <p className="text-2xl font-semibold text-secondary mb-6">
                  Gestão simples, resultados maiores.
                </p>
                <p className="text-lg text-muted-foreground max-w-[500px] leading-relaxed">
                  Transforme a forma como sua equipe trabalha: gerencie projetos, acompanhe tarefas e colabore em tempo real.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-brand hover:opacity-90" asChild>
                  <Link to="/register">
                    Comece agora grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/login">
                    Já tenho uma conta
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src={heroMockup} 
                  alt="Dashboard do Planeja+" 
                  className="rounded-xl shadow-2xl max-w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-brand opacity-5 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tighter text-secondary">
              Como funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Em apenas 3 passos simples, você já está organizando sua empresa
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary">Cadastre-se</h3>
              <p className="text-muted-foreground text-lg">
                Crie sua conta em segundos, sem cartão de crédito.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary">Configure</h3>
              <p className="text-muted-foreground text-lg">
                Monte sua equipe, crie projetos e personalize fluxos.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full text-white flex items-center justify-center mx-auto" style={{ backgroundColor: 'hsl(var(--chart-4))' }}>
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary">Gerencie</h3>
              <p className="text-muted-foreground text-lg">
                Acompanhe o progresso, colabore e alcance objetivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tighter text-secondary">
              Principais diferenciais
            </h2>
            <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
              Descubra porque milhares de empresas escolhem o Planeja+ para crescer
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-secondary">Gestão Simplificada</CardTitle>
                <CardDescription className="text-base">
                  Interface intuitiva e fácil de usar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl text-secondary">Colaboração em Equipe</CardTitle>
                <CardDescription className="text-base">
                  Todos alinhados em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-chart-4/10 flex items-center justify-center mb-6">
                  <BarChart3 className="h-7 w-7" style={{ color: 'hsl(var(--chart-4))' }} />
                </div>
                <CardTitle className="text-xl text-secondary">Relatórios Inteligentes</CardTitle>
                <CardDescription className="text-base">
                  Dashboards e métricas claras
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-secondary">Economia de Tempo</CardTitle>
                <CardDescription className="text-base">
                  Automatize tarefas repetitivas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl text-secondary">Agilidade nos Projetos</CardTitle>
                <CardDescription className="text-base">
                  Entregue resultados mais rápidos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-chart-4/10 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7" style={{ color: 'hsl(var(--chart-4))' }} />
                </div>
                <CardTitle className="text-xl text-secondary">Segurança Total</CardTitle>
                <CardDescription className="text-base">
                  Seus dados sempre protegidos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-brand">
        <div className="container">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-white">
              Pronto para revolucionar sua gestão?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de empresas que já aumentaram sua produtividade com o Planeja+
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button size="lg" variant="secondary" className="text-xl px-12 py-8 bg-white text-primary hover:bg-white/95" asChild>
                <Link to="/register">
                  Começar gratuitamente
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
            <p className="text-lg text-white/80 pt-4">
              Não precisa de cartão de crédito • Configuração em minutos
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-secondary">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <img src={planejaLogo} alt="Planeja+" className="h-10 w-auto" />
              <p className="text-base text-white/80 max-w-xs">
                Transformando a gestão de pequenas e médias empresas
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">Produto</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Recursos
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Preços
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Integrações
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">Empresa</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Sobre nós
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Contato
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Carreiras
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">Legal</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="#" className="block text-base text-white/80 hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-base text-white/60">
                © 2024 Planeja+. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}