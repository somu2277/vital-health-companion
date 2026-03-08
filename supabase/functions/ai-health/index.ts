import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiCall = async (systemPrompt: string, userPrompt: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limited. Please try again later.");
        if (response.status === 402) throw new Error("AI usage limit reached. Please add credits.");
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || "";
    };

    let result;

    switch (action) {
      case "analyze-report": {
        const systemPrompt = `You are a medical document analyzer. Extract structured information from the following prescription/medical report text. Return ONLY valid JSON with this structure:
{
  "disease": "string or null",
  "medicines": [{ "name": "string", "dosage": "string", "frequency": "string", "duration": "string" }],
  "summary": "brief summary of the report",
  "report_type": "prescription | lab_report | xray | other"
}`;
        const text = await aiCall(systemPrompt, data.reportText);
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse AI response" };
        break;
      }

      case "predict-disease-stage": {
        const systemPrompt = `You are a medical AI system. Based on the disease, medicines, and symptoms provided, predict the disease stage. Return ONLY valid JSON:
{
  "disease": "string",
  "stage": "Stage 1 | Stage 2 | Stage 3 | Recovery",
  "confidence": number (0-100),
  "explanation": "brief explanation"
}`;
        const text = await aiCall(systemPrompt, JSON.stringify(data));
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse" };
        break;
      }

      case "generate-care-plan": {
        const systemPrompt = `You are an AI healthcare planner. Generate a comprehensive care plan. Return ONLY valid JSON:
{
  "diet": ["suggestion1", "suggestion2"],
  "exercise": ["suggestion1", "suggestion2"],
  "sleep": ["suggestion1", "suggestion2"],
  "medication_schedule": ["schedule1", "schedule2"],
  "followups": ["followup1", "followup2"]
}`;
        const text = await aiCall(systemPrompt, JSON.stringify(data));
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse" };
        break;
      }

      case "generate-precautions": {
        const systemPrompt = `You are a medical advisor. Generate precautions based on disease and medicines. Return ONLY a JSON array of strings: ["precaution1", "precaution2", ...]`;
        const text = await aiCall(systemPrompt, JSON.stringify(data));
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        break;
      }

      case "analyze-symptoms": {
        const systemPrompt = `You are a diagnostic AI. Given the symptoms, return possible conditions. Return ONLY valid JSON:
{
  "possible_conditions": [{ "name": "string", "probability": "high | medium | low", "description": "brief description" }]
}`;
        const text = await aiCall(systemPrompt, JSON.stringify(data));
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { possible_conditions: [] };
        break;
      }

      case "medicine-safety": {
        const systemPrompt = `You are a pharmaceutical AI assistant. Analyze medicine safety. Return ONLY valid JSON:
{
  "safety_score": number (0-100),
  "warnings": ["warning1"],
  "interactions": ["interaction1"],
  "side_effects": ["effect1"]
}`;
        const text = await aiCall(systemPrompt, JSON.stringify(data));
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { safety_score: 0 };
        break;
      }

      case "chat": {
        const systemPrompt = `You are a helpful AI health assistant called VitalWave AI. You can only help with medical and health-related questions. If asked about non-health topics, politely redirect. Keep answers clear, concise, and always include a disclaimer to consult a doctor. Format responses in markdown.`;
        const text = await aiCall(systemPrompt, data.message);
        result = { response: text };
        break;
      }

      default:
        result = { error: "Unknown action" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
