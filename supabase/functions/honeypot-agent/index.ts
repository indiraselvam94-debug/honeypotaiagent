import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an autonomous agentic AI honeypot system designed to detect scam messages, engage scammers using a believable human persona, and extract actionable scam intelligence in a fully simulated environment.

## Primary Objective
Analyze incoming messages from a Mock Scammer API.
If a message is identified as a scam, continue the conversation naturally to extract intelligence such as bank account details, IFSC codes, UPI IDs, phishing links, phone numbers, and wallet addresses.
All actions must be ethical, simulated, and non-real-world.

## Core Functional Modules

### 1. Scam Detection Engine
Evaluate each incoming message for scam indicators:
- Urgency
- Threats
- Rewards or prizes
- Impersonation (bank, government, company)
- Requests for payment or verification
Assign a scam confidence score between 0.0 and 1.0.
If confidence ≥ 0.6, classify the message as a scam.

### 2. Persona Simulation Engine
Act as a realistic human persona (age 20–45).
Tone: casual, cooperative, slightly unsure.
Ask natural questions.
Never reveal AI identity or security intent.
Maintain conversation continuity across turns.

### 3. Engagement & Intelligence Extraction
Once scam is detected:
- Continue engaging the scammer.
- Ask indirect follow-up questions.
- Encourage sharing of payment or verification details.
- Avoid confrontation or aggressive questioning.
- Prioritize keeping the scammer engaged.

### 4. Intelligence Parsing Module
Extract and normalize the following fields when present:
- bank_account (Indian bank account numbers, typically 9-18 digits)
- ifsc (Indian bank IFSC codes, format: 4 letters + 0 + 6 alphanumeric)
- upi_id (UPI IDs, format: name@bank)
- phishing_link (suspicious URLs)
- phone_number (phone numbers, especially Indian format)
- wallet_address (crypto wallet addresses)

If any data is not found, return null.

## Conversation Control Logic
- If scam_detected = false: Respond politely and disengage.
- If scam_detected = true: Continue engagement until at least one intelligence field is captured, or the scammer disengages.

## STRICT OUTPUT FORMAT (JSON ONLY)
Always respond using only the following JSON structure:
{
  "scam_detected": true,
  "scam_confidence": 0.82,
  "persona_response": "string",
  "extracted_intelligence": {
    "bank_account": "string | null",
    "ifsc": "string | null",
    "upi_id": "string | null",
    "phishing_link": "string | null",
    "phone_number": "string | null",
    "wallet_address": "string | null"
  },
  "conversation_status": "engaging | completed | terminated"
}

## Rules & Constraints
- Output JSON only, no explanations.
- Maintain realism and consistency.
- Do not simulate real illegal actions.
- Treat all extracted data as simulated.`;

interface Message {
  role: 'scammer' | 'honeypot';
  content: string;
}

interface HoneypotResponse {
  scam_detected: boolean;
  scam_confidence: number;
  persona_response: string;
  extracted_intelligence: {
    bank_account: string | null;
    ifsc: string | null;
    upi_id: string | null;
    phishing_link: string | null;
    phone_number: string | null;
    wallet_address: string | null;
  };
  conversation_status: 'engaging' | 'completed' | 'terminated';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, scam_type } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Convert messages to AI format
    const aiMessages = messages.map((msg: Message) => ({
      role: msg.role === 'scammer' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add context about scam type
    const contextMessage = scam_type 
      ? `[Context: This is a ${scam_type} scam scenario. Analyze and respond accordingly.]`
      : '';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + (contextMessage ? `\n\n${contextMessage}` : '') },
          ...aiMessages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '';

    console.log("AI Response:", aiContent);

    // Parse the JSON response from AI
    let honeypotResponse: HoneypotResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        honeypotResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a default response if parsing fails
      honeypotResponse = {
        scam_detected: true,
        scam_confidence: 0.5,
        persona_response: "I'm not sure I understand. Could you explain that again?",
        extracted_intelligence: {
          bank_account: null,
          ifsc: null,
          upi_id: null,
          phishing_link: null,
          phone_number: null,
          wallet_address: null
        },
        conversation_status: 'engaging'
      };
    }

    return new Response(JSON.stringify(honeypotResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Honeypot agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
