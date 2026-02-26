import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FolderOpen, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  color: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: "", description: "", color: "#4F46E5" });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const openNew = () => { setEditing(null); setForm({ title: "", description: "", color: "#4F46E5" }); setOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setForm({ title: p.title, description: p.description || "", color: p.color || "#4F46E5" }); setOpen(true); };

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from("projects").update({ title: form.title, description: form.description, color: form.color }).eq("id", editing.id);
      } else {
        await supabase.from("projects").insert({ user_id: user.id, title: form.title, description: form.description, color: form.color });
      }
      await fetchProjects();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Projects" description="Organize your work into projects" actions={
        <Button onClick={openNew} size="sm" className="gradient-hero text-white border-0">
          <Plus size={16} className="mr-1.5" /> New Project
        </Button>
      } />
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No projects yet</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Create your first project to get started</p>
            <Button onClick={openNew} size="sm" variant="outline">Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (p.color || "#4F46E5") + "20" }}>
                    <FolderOpen size={18} style={{ color: p.color || "#4F46E5" }} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(p)}><Pencil size={14} className="mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{p.title}</h3>
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium capitalize">{p.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Project name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="What's this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <span className="text-sm text-muted-foreground">{form.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gradient-hero text-white border-0">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              {editing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
