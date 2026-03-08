import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { action, data } = await req.json();

    switch (action) {
      case "sync-demo": {
        // Generate realistic demo data simulating smartwatch readings
        const now = new Date();
        const records = [];
        
        for (let i = 0; i < 24; i++) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hour = time.getHours();
          
          // Simulate realistic patterns
          const isSleeping = hour >= 0 && hour < 7;
          const isActive = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
          
          records.push({
            user_id: userId,
            heart_rate: isSleeping ? 55 + Math.floor(Math.random() * 10) : isActive ? 90 + Math.floor(Math.random() * 30) : 68 + Math.floor(Math.random() * 15),
            steps: isSleeping ? 0 : isActive ? 800 + Math.floor(Math.random() * 400) : 100 + Math.floor(Math.random() * 200),
            sleep_hours: isSleeping ? 1.0 : 0,
            calories: isSleeping ? 30 + Math.floor(Math.random() * 10) : isActive ? 150 + Math.floor(Math.random() * 100) : 60 + Math.floor(Math.random() * 30),
            distance: isSleeping ? 0 : isActive ? 0.5 + Math.random() * 0.5 : 0.05 + Math.random() * 0.1,
            source: "demo_smartwatch",
            recorded_at: time.toISOString(),
          });
        }

        // Delete old demo data for this user
        await supabase.from("wearable_health_data").delete().eq("user_id", userId).eq("source", "demo_smartwatch");
        
        // Insert new demo data
        const { error: insertError } = await supabase.from("wearable_health_data").insert(records);
        if (insertError) throw new Error(insertError.message);

        return new Response(JSON.stringify({ success: true, records_synced: records.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get-latest": {
        const { data: latest, error: fetchError } = await supabase
          .from("wearable_health_data")
          .select("*")
          .eq("user_id", userId)
          .order("recorded_at", { ascending: false })
          .limit(24);

        if (fetchError) throw new Error(fetchError.message);

        if (!latest || latest.length === 0) {
          return new Response(JSON.stringify({ connected: false, data: null }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Aggregate data
        const currentHR = latest[0].heart_rate;
        const totalSteps = latest.reduce((sum: number, r: any) => sum + (r.steps || 0), 0);
        const totalSleep = latest.reduce((sum: number, r: any) => sum + (r.sleep_hours || 0), 0);
        const totalCalories = latest.reduce((sum: number, r: any) => sum + (r.calories || 0), 0);
        const totalDistance = latest.reduce((sum: number, r: any) => sum + (r.distance || 0), 0);

        // Generate alerts
        const alerts: string[] = [];
        if (currentHR && currentHR > 110) alerts.push("high_heart_rate");
        if (totalSleep < 6) alerts.push("low_sleep");
        if (totalSteps < 3000) alerts.push("low_activity");

        return new Response(JSON.stringify({
          connected: true,
          data: {
            heart_rate: currentHR,
            steps: totalSteps,
            sleep_hours: Math.round(totalSleep * 10) / 10,
            calories: totalCalories,
            distance: Math.round(totalDistance * 100) / 100,
            last_synced: latest[0].recorded_at,
            alerts,
            history: latest,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        await supabase.from("wearable_health_data").delete().eq("user_id", userId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "ai-insights": {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("AI not configured");

        const lang = data?.language || "English";
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an AI health coach analyzing wearable device data. Generate 3-4 personalized insights based on the health metrics. IMPORTANT: Respond in ${lang} language (except JSON keys).

Return ONLY valid JSON:
{
  "insights": [
    { "type": "warning|tip|achievement", "title": "short title", "description": "detailed insight", "icon": "heart|steps|sleep|calories" }
  ]
}`,
              },
              { role: "user", content: JSON.stringify(data?.metrics) },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) throw new Error("Rate limited. Try again later.");
          if (response.status === 402) throw new Error("AI usage limit reached.");
          throw new Error("AI gateway error");
        }

        const aiResult = await response.json();
        const text = aiResult.choices?.[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: [] };

        return new Response(JSON.stringify(insights), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("Wearable sync error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
