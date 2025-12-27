import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    console.log("Received text length:", text?.length || 0);
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert data extraction assistant. Your task is to extract ALL person names and company names from the provided text.

EXTRACTION RULES:
1. Extract EVERY name mentioned, including partial names
2. Chinese names (e.g., WONG AH MOI, TAN KIM HOCK, LEE CHEE KEONG) are SINGLE person names - do NOT split them
3. Look for names after patterns like: "Name:", "Nama:", "Customer:", "Client:", signatures, greetings
4. Company names often end with: SDN BHD, BHD, PTE LTD, LTD, INC, CORP, LLC, CO, ENTERPRISE
5. Names may appear in ALL CAPS - still extract them
6. Extract the COMPLETE name as written

NAME TYPES:
- chinese: Names like WONG, TAN, LEE, LIM, CHAN, NG, CHEUNG (Cantonese/Mandarin)
- malay: Names with BIN/BINTI, or common names like AHMAD, MUHAMMAD, SITI, NOR
- indian: Names with S/O, D/O, A/L, A/P, or Tamil/Hindi names
- western: English/European names
- other: Any other names

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations.

{
  "persons": [
    {"name": "FULL NAME HERE", "confidence": "high", "type": "chinese"}
  ],
  "companies": [
    {"name": "COMPANY NAME SDN BHD", "confidence": "high"}
  ]
}`;

    console.log("Calling AI Gateway...");

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
          { role: "user", content: `Extract all person names and company names from the following text. Pay special attention to Chinese names (e.g., WONG AH MOI, Won Hai, TAN KIM HOCK) - these are single person names, not multiple people.\n\nText to analyze:\n${text}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("Raw AI response:", content);

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let extractedData;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      
      console.log("Parsing JSON:", jsonStr.trim().substring(0, 200));
      
      extractedData = JSON.parse(jsonStr.trim());
      
      // Ensure the data structure is correct
      if (!extractedData.persons) {
        extractedData.persons = [];
      }
      if (!extractedData.companies) {
        extractedData.companies = [];
      }
      
      // Validate and normalize the data
      extractedData.persons = extractedData.persons.map((p: any) => ({
        name: String(p.name || '').trim(),
        confidence: ['high', 'medium', 'low'].includes(p.confidence) ? p.confidence : 'medium',
        type: ['chinese', 'malay', 'indian', 'western', 'other'].includes(p.type) ? p.type : 'other'
      })).filter((p: any) => p.name.length > 0);
      
      extractedData.companies = extractedData.companies.map((c: any) => ({
        name: String(c.name || '').trim(),
        confidence: ['high', 'medium', 'low'].includes(c.confidence) ? c.confidence : 'medium'
      })).filter((c: any) => c.name.length > 0);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      // Return empty results with the raw response for debugging
      extractedData = {
        persons: [],
        companies: [],
        rawResponse: content
      };
    }

    console.log("Final extraction result:", JSON.stringify(extractedData));

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in extract-names function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Extraction failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});