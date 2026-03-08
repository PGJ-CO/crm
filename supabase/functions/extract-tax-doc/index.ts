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

    const systemPrompt = `You are an expert at reading IRS tax documents such as W-9 forms and EIN confirmation letters (CP 575 / 147C).

Extract the following information from the uploaded document:

1. **Business Name**: The legal business name as shown on the document.
2. **EIN/TIN**: The Employer Identification Number or Taxpayer Identification Number (format: XX-XXXXXXX).
3. **Tax Classification**: The federal tax classification (e.g., Individual/Sole Proprietor, C Corporation, S Corporation, Partnership, LLC – C Corporation, LLC – S Corporation, LLC – Partnership, LLC – Disregarded Entity, Trust/Estate).
4. **Address**: The street address on the document.
5. **City**: The city.
6. **State**: The state (2-letter abbreviation preferred).
7. **ZIP**: The ZIP code.
8. **Contact Name**: The name of the person who signed or is listed (if visible).

If any field is not found, return an empty string for that field.

You MUST respond using the extract_tax_doc_data tool.`;

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
      },
      {
        type: "text",
        text: "Extract the business name, EIN/TIN, tax classification, address, and contact name from this tax document.",
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
              name: "extract_tax_doc_data",
              description: "Return extracted data from a W-9 or EIN letter",
              parameters: {
                type: "object",
                properties: {
                  businessName: { type: "string", description: "Legal business name" },
                  tin: { type: "string", description: "EIN or TIN in XX-XXXXXXX format" },
                  taxClassification: { type: "string", description: "Federal tax classification" },
                  address: { type: "string", description: "Street address" },
                  city: { type: "string", description: "City" },
                  state: { type: "string", description: "State abbreviation" },
                  zip: { type: "string", description: "ZIP code" },
                  contactName: { type: "string", description: "Name of person listed or who signed" },
                },
                required: ["businessName", "tin", "taxClassification", "address", "city", "state", "zip", "contactName"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_tax_doc_data" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("extract-tax-doc error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});