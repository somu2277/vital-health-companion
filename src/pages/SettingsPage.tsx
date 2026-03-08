import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Loader2, Moon, Sun, Bell, Shield } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { theme, toggle } = useTheme();
  const queryClient = useQueryClient();

  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [saving, setSaving] = useState(false);

  // Sync when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || "");
      setLocation(profile.location || "");
    }
  }, [profile]);

  const { data: notifications } = useQuery({
    queryKey: ["all-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      location: location || null,
    }).eq("user_id", profile.user_id);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Profile updated!");
      refreshProfile();
    }
    setSaving(false);
  };

  const dismissNotification = async (id: string) => {
    await supabase.from("notifications").update({ status: "dismissed" }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success("Notification dismissed");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Profile */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State, Country" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      {/* Appearance */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
          </div>
          <Button variant="outline" onClick={toggle} className="gap-2">
            {theme === "dark" ? <><Sun className="h-4 w-4" /> Light Mode</> : <><Moon className="h-4 w-4" /> Dark Mode</>}
          </Button>
        </div>
      </div>

      {/* Active Reminders */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Active Reminders
        </h2>
        {notifications && notifications.filter(n => n.status === "active").length > 0 ? (
          <div className="space-y-2">
            {notifications.filter(n => n.status === "active").map(n => (
              <div key={n.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{n.message}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => dismissNotification(n.id)}>
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active reminders</p>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Data & Privacy
        </h2>
        <p className="text-sm text-muted-foreground">
          Your health data is protected with row-level security. Only you can access your medical reports, medicines, and health records.
        </p>
      </div>
    </div>
  );
}
