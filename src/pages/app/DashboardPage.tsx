import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Target, CheckSquare, Zap, TrendingUp, FolderOpen, FileText } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, goals: 0, docs: 0, completedTasks: 0 });
  const [productivityData, setProductivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [projectsRes, tasksRes, goalsRes, docsRes, scoresRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("tasks").select("id, status", { count: "exact" }).eq("user_id", user.id),
        supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("productivity_scores").select("*").eq("user_id", user.id).order("score_date", { ascending: false }).limit(7),
      ]);
      const completedTasks = tasksRes.data?.filter(t => t.status === "done").length || 0;
      setStats({
        projects: projectsRes.count || 0,
        tasks: tasksRes.count || 0,
        goals: goalsRes.count || 0,
        docs: docsRes.count || 0,
        completedTasks,
      });
      const scores = (scoresRes.data || []).reverse();
      setProductivityData(scores.length > 0 ? scores.map(s => ({
        date: new Date(s.score_date).toLocaleDateString("en", { weekday: "short" }),
        score: s.score,
        tasks: s.tasks_completed,
      })) : [
        { date: "Mon", score: 0, tasks: 0 },
        { date: "Tue", score: 0, tasks: 0 },
        { date: "Wed", score: 0, tasks: 0 },
        { date: "Thu", score: 0, tasks: 0 },
        { date: "Fri", score: 0, tasks: 0 },
        { date: "Sat", score: 0, tasks: 0 },
        { date: "Sun", score: 0, tasks: 0 },
      ]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const name = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const completionRate = stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0;

  const statCards = [
    { label: "Projects", value: stats.projects, icon: FolderOpen, color: "text-primary" },
    { label: "Total Tasks", value: stats.tasks, icon: CheckSquare, color: "text-accent" },
    { label: "Goals", value: stats.goals, icon: Target, color: "text-yellow-500" },
    { label: "Documents", value: stats.docs, icon: FileText, color: "text-blue-400" },
    { label: "Completion", value: `${completionRate}%`, icon: TrendingUp, color: "text-emerald" },
    { label: "Streak", value: "—", icon: Zap, color: "text-orange-400" },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${name} 👋`}
        description="Here's your workspace overview for today"
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <Icon size={18} className={`${color} mb-3`} />
              <div className="text-2xl font-display font-bold text-foreground">{loading ? "—" : value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Productivity Score (7d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Tasks Completed (7d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Bar dataKey="tasks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Quick Start</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "New Project", href: "/app/projects", icon: FolderOpen },
              { label: "New Task", href: "/app/projects", icon: CheckSquare },
              { label: "New Goal", href: "/app/goals", icon: Target },
              { label: "Ask AI", href: "/app/ai", icon: Zap },
            ].map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground">
                <Icon size={16} className="text-primary" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
