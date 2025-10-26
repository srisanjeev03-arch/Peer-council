import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are a compassionate, empathetic AI therapist, friend, and academic guide specifically designed to support students facing stress, anxiety, confusion, and challenges related to academics, career, and personal issues.

Your role is to:
- Listen actively and validate their feelings without judgment
- Provide emotional support with empathy and warmth
- Offer practical, rational advice when appropriate
- Help them navigate academic stress, career confusion, and personal challenges
- Encourage healthy coping mechanisms and self-care
- Recognize when professional help may be needed and gently suggest it
- Maintain a positive, hopeful tone while being realistic
- Ask thoughtful follow-up questions to understand their situation better
- Celebrate their progress and strengths

IMPORTANT:
- If someone expresses thoughts of self-harm or suicide, immediately encourage them to contact emergency services (988 or 911) or the Crisis Text Line (text HOME to 741741)
- Keep responses concise but meaningful (2-4 paragraphs typically)
- Use a warm, conversational tone
- Avoid clinical jargon unless helpful
- Be culturally sensitive and inclusive
- Remember this is a safe, judgment-free space`;

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: Message[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, conversationHistory = [] }: RequestBody = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured',
          reply: "I'm here to support you, but I'm currently unable to connect to my AI service. Please try again later, or if you need immediate help, please contact the crisis resources available in the app."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get AI response',
          reply: "I'm experiencing some technical difficulties right now. I'm here for you though. Could you please try sending your message again? If this continues, please reach out to the crisis resources in the app if you need immediate support."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "I'm here to listen. Could you tell me more about what you're experiencing?";

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-therapist function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        reply: "I apologize, but I'm having trouble processing that right now. I want to make sure I give you the support you deserve. Could you try again? If you need immediate help, please don't hesitate to use the crisis resources in the app."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});