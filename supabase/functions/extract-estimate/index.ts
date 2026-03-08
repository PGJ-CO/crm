import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileBase64, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert at reading contractor estimates and extracting structured data.
Extract the following from the uploaded estimate document:

1. **Line Items**: Every line item with:
   - description: what the work/material is
   - quantity: numeric quantity (default 1 if not specified)
   - unit: unit of measure (ea, sf, lf, hr, etc. - default "ea" if not specified)
   - unitPrice: price per unit as a number (no $ sign)

2. **Contractor Name**: The contractor's business name if visible.

3. **Contractor Contact Info**: Extract any contact details visible on the estimate:
   - phone, email, contact person name, address, city, state, zip, license number

4. **Scope of Work**: A comprehensive summary of the full scope of work described in the estimate. Include all major work items, materials, and deliverables. Write it as a paragraph suitable for a contract's "Scope of Work" section.

5. **Timeline**: Extract any timeline, schedule, or duration information mentioned in the estimate. Include start dates, completion dates, estimated duration, phases, or milestones if mentioned. If no timeline is specified, return an empty string.

You MUST respond using the extract_estimate_data tool.`;

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
      },
      {
        type: "text",
        text: "Extract all line items, scope of work, and timeline from this contractor estimate.",
      },
    ];

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
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_estimate_data",
              description: "Return extracted line items, scope of work, and timeline from a contractor estimate",
              parameters: {
                type: "object",
                properties: {
                  contractorName: { type: "string", description: "Business name of the contractor" },
                  contractorPhone: { type: "string", description: "Phone number if visible, else empty string" },
                  contractorEmail: { type: "string", description: "Email if visible, else empty string" },
                  contractorContactName: { type: "string", description: "Contact person name if visible, else empty string" },
                  contractorAddress: { type: "string", description: "Street address if visible, else empty string" },
                  contractorCity: { type: "string", description: "City if visible, else empty string" },
                  contractorState: { type: "string", description: "State if visible, else empty string" },
                  contractorZip: { type: "string", description: "ZIP if visible, else empty string" },
                  contractorLicense: { type: "string", description: "License number if visible, else empty string" },
                  scopeOfWork: { type: "string", description: "Comprehensive summary of the scope of work for use in a contract" },
                  timeline: { type: "string", description: "Timeline, schedule, duration, or milestone information. Empty string if none found." },
                  lineItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" },
                        unitPrice: { type: "number" },
                      },
                      required: ["description", "quantity", "unit", "unitPrice"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["lineItems", "scopeOfWork", "timeline"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_estimate_data" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-estimate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});