import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, GitBranch, Loader2, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WorkflowModule {
  id: string;
  name: string;
  description: string;
  order: number;
  submodules: { id: string; name: string }[];
}

interface Workflow {
  id: string;
  title: string;
  description: string | null;
  modules: WorkflowModule[];
  created_at: string;
}

export default function WorkflowPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);

  const fetchWorkflows = async () => {
    if (!user) return;
    const { data } = await supabase.from("workflows").select("*").eq("user_id", user.id).order("sort_order");
    setWorkflows((data || []).map(w => ({ ...w, modules: (Array.isArray(w.modules) ? w.modules : []) as unknown as WorkflowModule[] })));
    setLoading(false);
  };

  useEffect(() => { fetchWorkflows(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from("workflows").update({ title: form.title, description: form.description }).eq("id", editing.id);
      } else {
        await supabase.from("workflows").insert({ user_id: user.id, title: form.title, description: form.description, modules: [] });
      }
      await fetchWorkflows();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("workflows").delete().eq("id", id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const addModule = async (workflowId: string) => {
    const wf = workflows.find(w => w.id === workflowId);
    if (!wf) return;
    const newModule: WorkflowModule = {
      id: crypto.randomUUID(), name: "New Module", description: "", order: wf.modules.length,
      submodules: []
    };
    const updated = [...wf.modules, newModule];
    await supabase.from("workflows").update({ modules: updated as unknown as import("@/integrations/supabase/types").Json }).eq("id", workflowId);
    setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, modules: updated } : w));
  };

  const toggleExpanded = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Workflow Builder" description="Design and manage your processes" actions={
        <Button onClick={() => { setEditing(null); setForm({ title: "", description: "" }); setOpen(true); }} size="sm" className="gradient-hero text-white border-0">
          <Plus size={16} className="mr-1.5" /> New Workflow
        </Button>
      } />
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GitBranch size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No workflows yet</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Create a workflow to organize your process</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map(wf => (
              <div key={wf.id} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button onClick={() => toggleExpanded(wf.id)} className="text-muted-foreground hover:text-foreground">
                    {expanded.includes(wf.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <GitBranch size={16} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground">{wf.title}</h3>
                    {wf.description && <p className="text-xs text-muted-foreground">{wf.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => addModule(wf.id)} className="text-xs h-7">
                      <Plus size={12} className="mr-1" /> Module
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(wf); setForm({ title: wf.title, description: wf.description || "" }); setOpen(true); }}>
                          <Pencil size={14} className="mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(wf.id)} className="text-destructive">
                          <Trash2 size={14} className="mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {expanded.includes(wf.id) && (
                  <div className="p-4 space-y-2">
                    {wf.modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No modules. Click "+ Module" to add one.</p>
                    ) : (
                      wf.modules.map((mod, idx) => (
                        <div key={mod.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                          <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{mod.name}</p>
                            {mod.description && <p className="text-xs text-muted-foreground">{mod.description}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{mod.submodules?.length || 0} sub</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Workflow" : "New Workflow"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Workflow name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe this workflow" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gradient-hero text-white border-0">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
