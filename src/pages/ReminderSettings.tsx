import { useState, useEffect } from "react";
import { Settings, Droplets, Pill, Moon, Footprints, Clock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";
import { motion } from "framer-motion";

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: `${h}:00`, label: `${h}:00` };
});

export default function ReminderSettings() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [waterEnabled, setWaterEnabled] = useState(true);
  const [medicineEnabled, setMedicineEnabled] = useState(true);
  const [sleepEnabled, setSleepEnabled] = useState(true);
  const [activityEnabled, setActivityEnabled] = useState(true);
  const [waterInterval, setWaterInterval] = useState("2");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setWaterEnabled(settings.water_enabled);
      setMedicineEnabled(settings.medicine_enabled);
      setSleepEnabled(settings.sleep_enabled);
      setActivityEnabled(settings.activity_enabled);
      setWaterInterval(String(settings.water_interval_hours));
      setQuietStart(settings.quiet_start);
      setQuietEnd(settings.quiet_end);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        water_enabled: waterEnabled,
        medicine_enabled: medicineEnabled,
        sleep_enabled: sleepEnabled,
        activity_enabled: activityEnabled,
        water_interval_hours: parseInt(waterInterval),
        quiet_start: quietStart,
        quiet_end: quietEnd,
        updated_at: new Date().toISOString(),
      };

      if (settings) {
        const { error } = await supabase
          .from("reminder_settings")
          .update(payload)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reminder_settings")
          .insert(payload);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast.success(t("reminderSettings.saved"));
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reminderTypes = [
    { key: "water", icon: Droplets, label: t("reminders.water"), desc: t("reminderSettings.waterDesc"), enabled: waterEnabled, setEnabled: setWaterEnabled, color: "text-info" },
    { key: "medicine", icon: Pill, label: t("reminders.medicine"), desc: t("reminderSettings.medicineDesc"), enabled: medicineEnabled, setEnabled: setMedicineEnabled, color: "text-primary" },
    { key: "sleep", icon: Moon, label: t("reminders.sleep"), desc: t("reminderSettings.sleepDesc"), enabled: sleepEnabled, setEnabled: setSleepEnabled, color: "text-accent-foreground" },
    { key: "activity", icon: Footprints, label: t("reminders.activity"), desc: t("reminderSettings.activityDesc"), enabled: activityEnabled, setEnabled: setActivityEnabled, color: "text-success" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" />
          {t("reminderSettings.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("reminderSettings.description")}</p>
      </div>

      {/* Reminder Types */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg">{t("reminderSettings.types")}</h2>
        {reminderTypes.map((rt, i) => (
          <motion.div
            key={rt.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
          >
            <div className="flex items-center gap-3">
              <rt.icon className={`h-5 w-5 ${rt.color}`} />
              <div>
                <p className="text-sm font-medium">{rt.label}</p>
                <p className="text-xs text-muted-foreground">{rt.desc}</p>
              </div>
            </div>
            <Switch checked={rt.enabled} onCheckedChange={rt.setEnabled} />
          </motion.div>
        ))}
      </div>

      {/* Water Frequency */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg">{t("reminderSettings.frequency")}</h2>
        <div className="flex items-center gap-4">
          <Droplets className="h-5 w-5 text-info" />
          <div className="flex-1">
            <Label>{t("reminderSettings.waterInterval")}</Label>
          </div>
          <Select value={waterInterval} onValueChange={setWaterInterval}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 {t("reminderSettings.hour")}</SelectItem>
              <SelectItem value="2">2 {t("reminderSettings.hours")}</SelectItem>
              <SelectItem value="3">3 {t("reminderSettings.hours")}</SelectItem>
              <SelectItem value="4">4 {t("reminderSettings.hours")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="border border-border rounded-xl p-6 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">{t("reminderSettings.quietHours")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("reminderSettings.quietDesc")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">{t("reminderSettings.from")}</Label>
            <Select value={quietStart} onValueChange={setQuietStart}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {hours.map(h => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("reminderSettings.to")}</Label>
            <Select value={quietEnd} onValueChange={setQuietEnd}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {hours.map(h => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t("common.save")}
      </Button>
    </div>
  );
}
