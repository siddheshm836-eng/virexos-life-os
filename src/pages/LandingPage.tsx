import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Zap, Sun, Moon, LayoutDashboard, GitBranch, Target, BarChart2, Heart, Bot,
  ArrowRight, CheckCircle, Star
} from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Get a bird's eye view of your entire work and life system in one place." },
  { icon: GitBranch, title: "Workflow Builder", desc: "Design nested workflows with drag-and-drop modules for any process." },
  { icon: Target, title: "Goals & Milestones", desc: "Set ambitious goals with milestone tracking and progress visualization." },
  { icon: BarChart2, title: "Productivity Analytics", desc: "Charts and scores to understand and improve your weekly performance." },
  { icon: Heart, title: "Wellness Tracker", desc: "Log sleep, mood, and workouts. Track your health over time." },
  { icon: Bot, title: "AI Assistant", desc: "VirexAI analyzes your workflows and suggests improvements — assistive only." },
];

const plans = [
  { name: "Free", price: "$0", features: ["3 Projects", "10 Tasks", "Basic Workflows", "Goal Tracking"], cta: "Get Started" },
  { name: "Pro", price: "$12", features: ["Unlimited Projects", "Unlimited Tasks", "AI Assistant", "Analytics", "Wellness Tracker"], cta: "Start Free Trial", highlighted: true },
  { name: "Team", price: "$29", features: ["Everything in Pro", "5 Team Members", "Shared Workflows", "Priority Support"], cta: "Contact Sales" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">VirexOS</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/auth"><Button size="sm" className="gradient-hero text-white border-0">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 gradient-hero blur-3xl" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground mb-6">
            <Zap size={12} className="text-primary" />
            <span>AI-Assisted Operating System for Work & Life</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Your Life,<br />
            <span className="text-gradient">Intelligently Organized</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            VirexOS combines project management, workflow automation, goal tracking, wellness monitoring, and AI assistance into one powerful platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="gradient-hero text-white border-0 font-semibold px-8">
                Start for Free <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="font-semibold px-8">Explore Features</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30" id="features">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete system for your professional and personal life</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all group">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-xl font-display font-semibold text-foreground mb-2">"VirexOS replaced 5 different tools for me"</p>
          <p className="text-muted-foreground">— Product Manager at a tech startup</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, scale when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-2xl p-7 border ${plan.highlighted ? "gradient-hero text-white border-transparent shadow-elevated" : "bg-card border-border shadow-card"}`}>
                <h3 className={`font-display font-bold text-lg mb-1 ${plan.highlighted ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                <div className={`text-4xl font-display font-bold mb-1 ${plan.highlighted ? "text-white" : "text-foreground"}`}>{plan.price}</div>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>/month</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className={plan.highlighted ? "text-white/80" : "text-accent"} />
                      <span className={plan.highlighted ? "text-white/90" : "text-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className={`w-full ${plan.highlighted ? "bg-white text-primary hover:bg-white/90" : "gradient-hero text-white border-0"}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-12 shadow-elevated">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Ready to take control?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of professionals using VirexOS to work smarter.</p>
            <Link to="/auth">
              <Button size="lg" className="gradient-hero text-white border-0 font-semibold px-10">
                Get Started Free <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-hero flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">VirexOS</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 VirexOS. AI-Assisted Operating System for Work & Life.</p>
          <div className="flex gap-4">
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
