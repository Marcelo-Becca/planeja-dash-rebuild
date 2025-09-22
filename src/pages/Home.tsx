import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, BarChart3, Clock, Zap, Shield, ArrowRight, Star, Quote } from "lucide-react";
import heroMockup from "@/assets/planeja-dashboard-mockup.jpg";
import planejaLogo from "@/assets/planeja-logo.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={planejaLogo} alt="Planeja+" className="h-8 w-auto" />
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
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img src={planejaLogo} alt="Planeja+" className="h-12 w-auto" />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
                  Planeja+
                </h1>
                <p className="text-xl text-secondary font-medium mb-4">
                  Faça o seu melhor
                </p>
                <p className="text-lg text-muted-foreground max-w-[600px] leading-relaxed">
                  Transforme a gestão da sua empresa com nossa plataforma intuitiva. 
                  Organize projetos, acompanhe tarefas e gerencie equipes de forma simples e eficiente.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
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
                  className="rounded-lg shadow-2xl max-w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-brand opacity-10 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-secondary">
              Por que escolher o Planeja+?
            </h2>
            <p className="text-lg text-muted-foreground max-w-[800px] mx-auto">
              Nossa plataforma foi desenvolvida especialmente para micro e pequenas empresas 
              que buscam organização, produtividade e crescimento sustentável.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-secondary">
              Benefícios que fazem a diferença
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-secondary">Gestão Simplificada</CardTitle>
                <CardDescription>
                  Interface intuitiva que qualquer pessoa pode usar, sem curva de aprendizado complexa.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-secondary">Colaboração em Equipe</CardTitle>
                <CardDescription>
                  Mantenha todos alinhados com ferramentas de comunicação e acompanhamento em tempo real.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6" style={{ color: 'hsl(var(--chart-4))' }} />
                </div>
                <CardTitle className="text-secondary">Relatórios Inteligentes</CardTitle>
                <CardDescription>
                  Acompanhe o progresso com dashboards visuais e relatórios que ajudam na tomada de decisão.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-secondary">Economia de Tempo</CardTitle>
                <CardDescription>
                  Automatize processos repetitivos e foque no que realmente importa para seu negócio.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-secondary">Agilidade nos Projetos</CardTitle>
                <CardDescription>
                  Metodologias ágeis integradas para entregar resultados mais rápidos e eficientes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" style={{ color: 'hsl(var(--chart-4))' }} />
                </div>
                <CardTitle className="text-secondary">Segurança Total</CardTitle>
                <CardDescription>
                  Seus dados protegidos com criptografia avançada e backup automático na nuvem.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-secondary">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Em apenas 3 passos simples, você já está organizando sua empresa
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-secondary">Cadastre-se</h3>
              <p className="text-muted-foreground">
                Crie sua conta gratuita em segundos. Não precisa de cartão de crédito.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-secondary">Configure</h3>
              <p className="text-muted-foreground">
                Adicione sua equipe, crie projetos e comece a organizar suas tarefas.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full text-white flex items-center justify-center mx-auto text-2xl font-bold" style={{ backgroundColor: 'hsl(var(--chart-4))' }}>
                3
              </div>
              <h3 className="text-xl font-semibold text-secondary">Gerencie</h3>
              <p className="text-muted-foreground">
                Acompanhe o progresso, colabore com a equipe e alcance seus objetivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-secondary">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "O Planeja+ transformou nossa forma de trabalhar. Agora conseguimos entregar projetos no prazo e com muito mais qualidade."
                </p>
                <div>
                  <p className="font-semibold text-secondary">Maria Silva</p>
                  <p className="text-sm text-muted-foreground">CEO, Inovação Digital</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "Interface intuitiva e recursos poderosos. Exatamente o que nossa equipe precisava para crescer de forma organizada."
                </p>
                <div>
                  <p className="font-semibold text-secondary">João Santos</p>
                  <p className="text-sm text-muted-foreground">Diretor, TechStart</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "Conseguimos reduzir em 40% o tempo gasto em reuniões. Tudo fica claro e organizado no sistema."
                </p>
                <div>
                  <p className="font-semibold text-secondary">Ana Costa</p>
                  <p className="text-sm text-muted-foreground">Gerente, Consultoria Plus</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-brand">
        <div className="container">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
              Pronto para revolucionar sua gestão?
            </h2>
            <p className="text-lg text-white/90">
              Junte-se a milhares de empresas que já transformaram sua produtividade com o Planeja+
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link to="/register">
                  Começar gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/70">
              Não precisa de cartão de crédito • Configuração em minutos
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <img src={planejaLogo} alt="Planeja+" className="h-8 w-auto" />
              <p className="text-sm text-white/80">
                Transformando a gestão de pequenas e médias empresas.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Produto</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Recursos
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Preços
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Integrações
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Empresa</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Sobre nós
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Contato
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Carreiras
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="#" className="block text-sm text-white/80 hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-white/60">
                © 2024 Planeja+. Todos os direitos reservados.
              </p>
              <div className="flex space-x-4">
                <Link to="#" className="text-white/60 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <div className="w-5 h-5 bg-white/60 rounded"></div>
                </Link>
                <Link to="#" className="text-white/60 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-5 h-5 bg-white/60 rounded"></div>
                </Link>
                <Link to="#" className="text-white/60 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <div className="w-5 h-5 bg-white/60 rounded"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}