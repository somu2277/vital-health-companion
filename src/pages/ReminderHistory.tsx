import { useState } from "react";
import { History, Filter, Calendar, Droplets, Pill, Moon, Footprints, Bell, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const typeIcons: Record<string, typeof Bell> = {
  water: Droplets,
  medicine: Pill,
  sleep: Moon,
  activity: Footprints,
  general: Bell,
};

const statusColors: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  dismissed: "bg-muted text-muted-foreground border-border",
};

export default function ReminderHistory() {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminder-history", typeFilter, dateFilter?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("reminders", {
        body: {
          action: "get-history",
          data: {
            type: typeFilter === "all" ? null : typeFilter,
            date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : null,
          },
        },
      });
      if (error) throw error;
      return data?.reminders || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="h-7 w-7 text-primary" />
          {t("reminderHistory.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("reminderHistory.description")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("reminderHistory.allTypes")}</SelectItem>
              <SelectItem value="water">{t("reminders.water")}</SelectItem>
              <SelectItem value="medicine">{t("reminders.medicine")}</SelectItem>
              <SelectItem value="sleep">{t("reminders.sleep")}</SelectItem>
              <SelectItem value="activity">{t("reminders.activity")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}>
              <Calendar className="h-4 w-4 mr-2" />
              {dateFilter ? format(dateFilter, "PPP") : t("reminderHistory.pickDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComp
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {dateFilter && (
          <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>
            {t("reminderHistory.clearDate")}
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">{t("reminderHistory.noHistory")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("reminderHistory.noHistoryDesc")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r: any, i: number) => {
            const Icon = typeIcons[r.type] || Bell;
            const statusClass = statusColors[r.status] || "";
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{r.message}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.created_at ? format(new Date(r.created_at), "MMM d, yyyy h:mm a") : ""}
                    {" · "}
                    <span className="capitalize">{r.source === "auto" || r.source === "auto_wearable" ? t("reminders.auto") : t("reminders.manual")}</span>
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] gap-1", statusClass)}>
                  {r.status === "completed" ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                  {r.status === "completed" ? t("reminderHistory.completed") : t("reminderHistory.dismissed")}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
