import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Moon, Dumbbell, SmilePlus, Loader2 } from "lucide-react";

interface WellnessLog {
  id: string;
  log_date: string;
  sleep_hours: number | null;
  mood: number | null;
  workout_minutes: number | null;
  notes: string | null;
}

const moodEmojis = ["", "😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "😍", "🚀"];

export default function WellnessPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sleepVal, setSleepVal] = useState(7);
  const [moodVal, setMoodVal] = useState(7);
  const [workoutVal, setWorkoutVal] = useState(30);
  const [notesVal, setNotesVal] = useState("");
  const [hasToday, setHasToday] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase.from("wellness_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14);
      setLogs(data || []);
      const todayLog = data?.find(l => l.log_date === todayStr);
      if (todayLog) {
        setSleepVal(todayLog.sleep_hours || 7);
        setMoodVal(todayLog.mood || 7);
        setWorkoutVal(todayLog.workout_minutes || 30);
        setNotesVal(todayLog.notes || "");
        setHasToday(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (hasToday) {
        await supabase.from("wellness_logs").update({ sleep_hours: sleepVal, mood: moodVal, workout_minutes: workoutVal, notes: notesVal }).eq("user_id", user.id).eq("log_date", todayStr);
      } else {
        await supabase.from("wellness_logs").insert({ user_id: user.id, log_date: todayStr, sleep_hours: sleepVal, mood: moodVal, workout_minutes: workoutVal, notes: notesVal });
        setHasToday(true);
      }
      const { data } = await supabase.from("wellness_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14);
      setLogs(data || []);
    } finally {
      setSaving(false);
    }
  };

  const chartData = [...logs].reverse().map(l => ({
    date: new Date(l.log_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    sleep: l.sleep_hours,
    mood: l.mood,
    workout: Math.round((l.workout_minutes || 0) / 6),
  }));

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Wellness Tracker" description="Monitor your health and daily habits" />
      <div className="flex-1 p-6 space-y-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-5">Today's Check-In</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Moon size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-foreground">Sleep Hours: {sleepVal}h</span>
              </div>
              <Slider min={0} max={12} step={0.5} value={[sleepVal]} onValueChange={([v]) => setSleepVal(v)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SmilePlus size={16} className="text-yellow-400" />
                <span className="text-sm font-medium text-foreground">Mood: {moodEmojis[moodVal]} {moodVal}/10</span>
              </div>
              <Slider min={1} max={10} step={1} value={[moodVal]} onValueChange={([v]) => setMoodVal(v)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">Workout: {workoutVal}min</span>
              </div>
              <Slider min={0} max={180} step={5} value={[workoutVal]} onValueChange={([v]) => setWorkoutVal(v)} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Input placeholder="Notes for today..." value={notesVal} onChange={e => setNotesVal(e.target.value)} className="flex-1" />
            <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white border-0 shrink-0">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              {hasToday ? "Update" : "Log Today"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Sleep & Mood (14d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Area type="monotone" dataKey="sleep" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} name="Sleep (h)" />
                <Area type="monotone" dataKey="mood" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} name="Mood" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Workout Activity (14d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Area type="monotone" dataKey="workout" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.15)" strokeWidth={2} name="Workout (10min)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4">Recent Logs</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 7).map(log => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    {new Date(log.log_date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-1 text-sm"><Moon size={12} className="text-blue-400" /><span className="text-foreground">{log.sleep_hours}h</span></div>
                  <div className="flex items-center gap-1 text-sm"><SmilePlus size={12} className="text-yellow-400" /><span className="text-foreground">{moodEmojis[log.mood || 0]} {log.mood}/10</span></div>
                  <div className="flex items-center gap-1 text-sm"><Dumbbell size={12} className="text-accent" /><span className="text-foreground">{log.workout_minutes}min</span></div>
                  {log.notes && <span className="text-xs text-muted-foreground truncate flex-1">{log.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
