import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  updated_at: string;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    try {
      if (editing) {
        await supabase.from("documents").update({ title: form.title, content: form.content, tags }).eq("id", editing.id);
      } else {
        await supabase.from("documents").insert({ user_id: user.id, title: form.title, content: form.content, tags });
      }
      await fetchDocs();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const filtered = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Documents" description="Rich text notes and documentation" actions={
        <Button onClick={() => { setEditing(null); setForm({ title: "", content: "", tags: "" }); setOpen(true); }} size="sm" className="gradient-hero text-white border-0">
          <Plus size={16} className="mr-1.5" /> New Document
        </Button>
      } />
      <div className="flex-1 p-6">
        <div className="mb-4">
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">{search ? "No results found" : "No documents yet"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow group">
                <div className="flex items-start justify-between mb-2">
                  <FileText size={16} className="text-primary mt-0.5" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(doc); setForm({ title: doc.title, content: doc.content, tags: (doc.tags || []).join(", ") }); setOpen(true); }}>
                        <Pencil size={14} className="mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive">
                        <Trash2 size={14} className="mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{doc.title}</h3>
                {doc.content && <p className="text-sm text-muted-foreground line-clamp-3">{doc.content}</p>}
                <div className="mt-3 flex flex-wrap gap-1">
                  {(doc.tags || []).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{new Date(doc.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Document" : "New Document"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Document title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Write your content here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={10} className="font-mono text-sm" />
            <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white border-0">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
