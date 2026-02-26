import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, CheckSquare, Target, Zap } from "lucide-react";

export default function ProductivityPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, "in-progress": 0, done: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [scoresRes, tasksRes] = await Promise.all([
        supabase.from("productivity_scores").select("*").eq("user_id", user.id).order("score_date", { ascending: false }).limit(14),
        supabase.from("tasks").select("status").eq("user_id", user.id),
      ]);
      const reversed = (scoresRes.data || []).reverse();
      setScores(reversed.map(s => ({
        date: new Date(s.score_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        score: s.score,
        tasks: s.tasks_completed,
        focus: s.focus_minutes,
      })));
      const tasks = tasksRes.data || [];
      setTaskStats({
        todo: tasks.filter(t => t.status === "todo").length,
        "in-progress": tasks.filter(t => t.status === "in_progress").length,
        done: tasks.filter(t => t.status === "done").length,
      });
    };
    fetch();
  }, [user]);

  const total = taskStats.todo + taskStats["in-progress"] + taskStats.done;
  const completionRate = total > 0 ? Math.round((taskStats.done / total) * 100) : 0;

  const pieData = [
    { name: "Todo", value: taskStats.todo, color: "hsl(var(--muted-foreground))" },
    { name: "In Progress", value: taskStats["in-progress"], color: "hsl(var(--primary))" },
    { name: "Done", value: taskStats.done, color: "hsl(var(--accent))" },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: "Total Tasks", value: total, icon: CheckSquare, color: "text-primary" },
    { label: "Completed", value: taskStats.done, icon: Target, color: "text-accent" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "text-yellow-500" },
    { label: "In Progress", value: taskStats["in-progress"], icon: Zap, color: "text-blue-400" },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Productivity" description="Track your performance and output" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <Icon size={18} className={`${color} mb-3`} />
              <div className="text-2xl font-display font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Weekly Productivity Score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scores.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Task Status</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No tasks yet</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Tasks Completed (14d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
