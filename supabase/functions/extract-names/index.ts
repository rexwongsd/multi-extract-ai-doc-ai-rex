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

    const systemPrompt = `You are an expert data extraction assistant specializing in extracting names and company names from documents. You have deep knowledge of:

1. **Chinese Names** (both traditional and simplified):
   - Cantonese romanization: WONG, CHAN, LEE, LAU, NG, CHEUNG, LEUNG, HO, TANG, FUNG
   - Mandarin pinyin: WANG, ZHANG, LI, LIU, WU, CHEN, YANG, HUANG, ZHAO, SUN
   - Common patterns: Family name (1 syllable) + Given name (1-2 syllables)
   - Examples: WONG AH MOI, TAN KIM HOCK, LEE CHEE KEONG, CHEN WEI MING, LIM AH KOW
   - Malaysian Chinese: Often 3 parts - surname + 2-part given name

2. **Malay Names**:
   - Patterns: Name BIN/BINTI Father's Name (e.g., AHMAD BIN ISMAIL)
   - Common: MUHAMMAD, AHMAD, MOHD, SITI, NOR, NURUL

3. **Indian Names**:
   - Tamil: S/O (son of), D/O (daughter of) patterns
   - A/L, A/P for Malaysian Indian names

4. **Company Names**:
   - Suffixes: SDN BHD, BHD, PTE LTD, LTD, INC, CORP, LLC, CO
   - Trading names, Enterprise, Holdings

**CRITICAL RULES**:
- Extract the FULL name as written, do not split or truncate
- Chinese names like "WONG AH MOI" is ONE person's full name, not multiple names
- "Won Hai" is a Chinese given name, extract completely
- Names in ALL CAPS are still valid names
- If a name appears multiple times, include it once
- Distinguish between person names and company names
- Return confidence score (high/medium/low) for each extraction

Return JSON format:
{
  "persons": [
    { "name": "FULL NAME HERE", "confidence": "high/medium/low", "type": "chinese/malay/indian/western/other" }
  ],
  "companies": [
    { "name": "COMPANY NAME HERE", "confidence": "high/medium/low" }
  ]
}`;

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

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let extractedData;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      extractedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return raw content if parsing fails
      extractedData = {
        persons: [],
        companies: [],
        rawResponse: content
      };
    }

    console.log("Extraction successful:", extractedData);

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
