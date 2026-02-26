import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, User, Bell, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio").eq("user_id", user.id).single().then(({ data }) => {
      if (data) { setDisplayName(data.display_name || ""); setBio(data.bio || ""); }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({ user_id: user.id, display_name: displayName, bio }).eq("user_id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { icon: User, label: "Profile" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div className="flex-1 p-6 max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">Profile</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input value={user?.email || ""} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio..." />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white border-0">
              {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-5">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2">
              {theme === "dark" ? <><Sun size={16} />Light Mode</> : <><Moon size={16} />Dark Mode</>}
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">Account</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-xs font-mono text-foreground truncate max-w-[200px]">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email verified</span>
              <span className={`text-xs font-medium ${user?.email_confirmed_at ? "text-accent" : "text-yellow-500"}`}>
                {user?.email_confirmed_at ? "Verified" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Member since</span>
              <span className="text-sm text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
