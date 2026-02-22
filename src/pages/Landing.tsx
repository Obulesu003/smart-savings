import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Goal-Based Planning',
    description: 'Set financial goals for retirement, education, property, or business and get a roadmap to achieve them.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Our AI analyzes your profile to provide personalized risk assessment and investment recommendations.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Interactive charts showing income breakdown, investment growth projections, and portfolio allocation.',
  },
  {
    icon: Shield,
    title: 'Risk Profiling',
    description: 'Smart risk assessment based on your age, income, expenses, and time horizon.',
  },
  {
    icon: Zap,
    title: 'What-If Scenarios',
    description: 'Explore different scenarios by adjusting variables and see how it affects your goals.',
  },
  {
    icon: TrendingUp,
    title: 'Goal Feasibility',
    description: 'Know exactly how achievable your goals are with a detailed feasibility score and recommendations.',
  },
];

const benefits = [
  'Personalized savings recommendations',
  'Investment allocation based on risk profile',
  'Track multiple financial goals',
  'Export professional PDF reports',
  'Compare different scenarios',
  'Secure and private',
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              AI-Powered Financial Planning
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plan Your Financial Future with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Get personalized savings and investment recommendations powered by AI. 
              Achieve your financial goals for retirement, education, property, or business.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 text-base">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2 text-base">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="text-base">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Plan Your Wealth
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools and AI-powered insights to help you make informed financial decisions.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Take Control of Your Financial Journey
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our intelligent platform analyzes your financial situation and creates 
                a personalized plan tailored to your goals and risk tolerance.
              </p>
              
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                {user ? (
                  <Link to="/new-plan">
                    <Button size="lg" className="gap-2">
                      Create Your First Plan
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2">
                      Start Planning Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-8 lg:p-12">
                <div className="flex h-full flex-col items-center justify-center rounded-xl bg-card p-6 shadow-xl">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
                    <TrendingUp className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold text-foreground">
                    Goal Feasibility
                  </h3>
                  <div className="mt-4 text-6xl font-bold text-accent">87%</div>
                  <p className="mt-2 text-muted-foreground">On track to achieve your goal</p>
                  <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[87%] rounded-full bg-accent transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="rounded-2xl gradient-hero p-8 text-center lg:p-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Start Planning?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Join thousands of users who are taking control of their financial future 
              with AI-powered insights and personalized recommendations.
            </p>
            <div className="mt-8">
              {user ? (
                <Link to="/new-plan">
                  <Button size="lg" variant="secondary" className="gap-2 text-base">
                    Create a New Plan
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth?mode=signup">
                  <Button size="lg" variant="secondary" className="gap-2 text-base">
                    Get Started for Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}