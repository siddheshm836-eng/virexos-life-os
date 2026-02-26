import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Target, Loader2, MoreHorizontal, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string;
  category: string | null;
  target_date: string | null;
}

interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "personal", target_date: "" });
  const [saving, setSaving] = useState(false);
  const [milestoneInput, setMilestoneInput] = useState<{ [goalId: string]: string }>({});

  const fetchData = async () => {
    if (!user) return;
    const [goalsRes, milestonesRes] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("milestones").select("*").eq("user_id", user.id),
    ]);
    setGoals(goalsRes.data || []);
    setMilestones(milestonesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from("goals").update({ title: form.title, description: form.description, category: form.category, target_date: form.target_date || null }).eq("id", editing.id);
      } else {
        await supabase.from("goals").insert({ user_id: user.id, title: form.title, description: form.description, category: form.category, target_date: form.target_date || null });
      }
      await fetchData();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const addMilestone = async (goalId: string) => {
    const title = milestoneInput[goalId]?.trim();
    if (!title || !user) return;
    await supabase.from("milestones").insert({ user_id: user.id, goal_id: goalId, title });
    setMilestoneInput(m => ({ ...m, [goalId]: "" }));
    fetchData();
  };

  const toggleMilestone = async (m: Milestone) => {
    await supabase.from("milestones").update({ completed: !m.completed }).eq("id", m.id);
    const goalMilestones = milestones.filter(ms => ms.goal_id === m.goal_id);
    const completedCount = goalMilestones.filter(ms => ms.id === m.id ? !m.completed : ms.completed).length;
    const progress = goalMilestones.length > 0 ? Math.round((completedCount / goalMilestones.length) * 100) : 0;
    await supabase.from("goals").update({ progress }).eq("id", m.goal_id);
    fetchData();
  };

  const categoryColors: { [k: string]: string } = { personal: "text-blue-400", work: "text-primary", health: "text-accent", finance: "text-yellow-500" };

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Goals & Milestones" description="Track your long-term objectives" actions={
        <Button onClick={() => { setEditing(null); setForm({ title: "", description: "", category: "personal", target_date: "" }); setOpen(true); }} size="sm" className="gradient-hero text-white border-0">
          <Plus size={16} className="mr-1.5" /> New Goal
        </Button>
      } />
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No goals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const goalMilestones = milestones.filter(m => m.goal_id === goal.id);
              return (
                <div key={goal.id} className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-foreground">{goal.title}</h3>
                        <span className={`text-xs font-medium capitalize ${categoryColors[goal.category || "personal"] || "text-muted-foreground"}`}>
                          {goal.category}
                        </span>
                      </div>
                      {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(goal); setForm({ title: goal.title, description: goal.description || "", category: goal.category || "personal", target_date: goal.target_date?.slice(0, 10) || "" }); setOpen(true); }}>
                          <Pencil size={14} className="mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => { await supabase.from("goals").delete().eq("id", goal.id); fetchData(); }} className="text-destructive">
                          <Trash2 size={14} className="mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span><span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <div className="space-y-1 mb-3">
                    {goalMilestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleMilestone(m)}>
                        {m.completed ? <CheckCircle2 size={14} className="text-accent shrink-0" /> : <Circle size={14} className="text-muted-foreground shrink-0" />}
                        <span className={`text-sm ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add milestone..." value={milestoneInput[goal.id] || ""} onChange={e => setMilestoneInput(m => ({ ...m, [goal.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addMilestone(goal.id)} className="h-8 text-sm" />
                    <Button size="sm" variant="outline" onClick={() => addMilestone(goal.id)} className="h-8 px-2"><Plus size={14} /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Goal title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="personal">Personal</option><option value="work">Work</option><option value="health">Health</option><option value="finance">Finance</option>
            </select>
            <Input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white border-0">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}{editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
