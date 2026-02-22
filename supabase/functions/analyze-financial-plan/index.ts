import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputs, savings, feasibility, allocation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional financial advisor AI. Analyze the user's financial profile and provide clear, actionable insights. Be specific with numbers and percentages. Keep responses concise but informative. Do not use markdown formatting.`;

    const userPrompt = `Analyze this financial profile:

PROFILE:
- Age: ${inputs.age} years old
- Monthly Income: $${inputs.monthlyIncome}
- Monthly Expenses: $${inputs.monthlyExpenses}
- Expense Ratio: ${savings.expenseRatio.toFixed(1)}%
- Remaining Income: $${savings.remainingIncome}

GOAL:
- Type: ${inputs.goalType}
- Target Amount: $${inputs.goalAmount}
- Timeline: ${inputs.timePeriod} years
- Stated Risk Preference: ${inputs.riskPreference}

CALCULATED PLAN:
- Monthly Savings (Emergency Fund): $${savings.monthlySavings.toFixed(0)}
- Monthly Investment: $${savings.monthlyInvestment.toFixed(0)}
- Optimal Savings Rate: ${savings.optimalSavingsPercentage}%
- Projected Portfolio Value: $${feasibility.projectedValue}
- Goal Feasibility Score: ${feasibility.score.toFixed(1)}%
- Goal Achievable: ${feasibility.isAchievable ? 'Yes' : 'No'}
${feasibility.shortfall > 0 ? `- Shortfall: $${feasibility.shortfall}` : ''}

RECOMMENDED ALLOCATION:
${(allocation as Array<{ name: string; percentage: number; expectedReturn: number }>).map((a) => `- ${a.name}: ${a.percentage}% (expected ${a.expectedReturn}% return)`).join('\n')}

Please provide three separate analyses:

1. RISK ASSESSMENT (2-3 sentences): Evaluate if their stated ${inputs.riskPreference} risk preference is appropriate given their age, timeline, and financial situation. Suggest adjustments if needed.

2. INVESTMENT RECOMMENDATIONS (3-4 sentences): Explain why the recommended portfolio allocation is suitable for their profile. Mention specific investment types and why they're appropriate.

3. GOAL FEASIBILITY EXPLANATION (3-4 sentences): Explain the feasibility score. If the goal is not achievable, provide specific actionable steps with exact dollar amounts or timeline extensions needed.

Format your response exactly as:
RISK_ASSESSMENT:
[your risk assessment]

RECOMMENDATIONS:
[your investment recommendations]

EXPLANATION:
[your goal feasibility explanation]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the structured response
    const riskMatch = content.match(/RISK_ASSESSMENT:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/);
    const recsMatch = content.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=EXPLANATION:|$)/);
    const explMatch = content.match(/EXPLANATION:\s*([\s\S]*?)$/);

    const riskAssessment = riskMatch ? riskMatch[1].trim() : "";
    const recommendations = recsMatch ? recsMatch[1].trim() : "";
    const explanation = explMatch ? explMatch[1].trim() : "";

    return new Response(
      JSON.stringify({
        riskAssessment,
        recommendations,
        explanation,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-financial-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});