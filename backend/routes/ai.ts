import express from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const router = express.Router();

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return null instead of throwing to allow graceful handling
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for OpenAI Compatible APIs (Groq, X.AI)
const callOpenAICompatible = async (provider: string, apiUrl: string, apiKey: string, model: string, messages: any[]) => {
    console.log(`[DEBUG AI] callOpenAICompatible called: provider=${provider}, model=${model}`);
    try {
        if (typeof fetch === 'undefined') {
             console.error("[DEBUG AI] Node.js Fetch API is missing. Use Node v18+.");
             return null;
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages,
                model,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[DEBUG AI] ${provider} API Error (${response.status}):`, errorText);
            return null;
        }
        const data = await response.json();
        console.log(`[DEBUG AI] ${provider} response received, content length:`, data.choices?.[0]?.message?.content?.length);
        return data.choices[0]?.message?.content;
    } catch (error) {
        console.error(`[DEBUG AI] ${provider} Network Error:`, error);
        return null;
    }
};

router.post('/chat', async (req, res) => {
    console.log('[DEBUG AI] /chat endpoint hit');
    const { message, history } = req.body;
    console.log('[DEBUG AI] Request body:', { message: message?.substring(0, 50), historyLength: history?.length });
    
    if (!message) {
        console.log('[DEBUG AI] Missing message - returning 400');
        return res.status(400).json({ message: 'Missing message' });
    }
    try {
        const ai = getAI();
        console.log('[DEBUG AI] AI instance:', ai ? 'created' : 'null (no GEMINI_API_KEY)');
        
        const systemPrompt = "You are a professional virtual assistant for the National Land Commission (NLC) of Kenya. Your role is to help citizens with land-related queries, explain the complaint lodging process, and provide general guidance on land laws. Be polite, formal, and concise. Do not mention you are an AI; act as a helpful government support agent.";
        
        const conversationMessages = [
            { role: "system", content: systemPrompt },
            ...(history || []).map((h: any) => ({
                role: h.role === 'model' ? 'assistant' : 'user',
                content: h.text
            })),
            { role: "user", content: message }
        ];

        // 1. Try Groq first (primary provider) - Using llama-3.3-70b-versatile
        if (process.env.GROQ_API_KEY) {
            console.log('[DEBUG AI] Attempting Groq...');
            const response = await callOpenAICompatible("Groq", "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, "llama-3.3-70b-versatile", conversationMessages);
            console.log('[DEBUG AI] Groq response:', response ? 'success' : 'failed/null');
            if (response) return res.json({ text: response });
            console.error("[DEBUG AI] Groq request failed. Falling back to next provider.");
        } else {
            console.log('[DEBUG AI] GROQ_API_KEY not set, skipping Groq');
        }
        
        // 2. Try X.AI (Grok) as fallback
        if (process.env.XAI_API_KEY) {
            console.log("[DEBUG AI] Attempting to generate response with X.AI...");
            const response = await callOpenAICompatible("X.AI", "https://api.x.ai/v1/chat/completions", process.env.XAI_API_KEY, "grok-2-1212", conversationMessages);
            console.log('[DEBUG AI] X.AI response:', response ? 'success' : 'failed/null');
            if (response) return res.json({ text: response });
            console.error("[DEBUG AI] X.AI request failed. No more providers.");
        } else {
            console.log('[DEBUG AI] XAI_API_KEY not set, skipping X.AI');
        }

        if (!ai) {
            console.log('[DEBUG AI] No AI provider available - returning fallback message');
            return res.json({ text: "AI assistance is currently unavailable (API Key missing)." });
        }

        console.log('[DEBUG AI] Attempting Gemini fallback...');
        const chat = ai.chats.create({
            model: "gemini-3.1-pro-preview",
            config: {
                systemInstruction: "You are a professional virtual assistant for the National Land Commission (NLC) of Kenya. Your role is to help citizens with land-related queries, explain the complaint lodging process, and provide general guidance on land laws. Be polite, formal, and concise. Do not mention you are an AI; act as a helpful government support agent.",
            },
            history: (history || []).map((h: any) => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const response = await chat.sendMessage({ message });
        console.log('[DEBUG AI] Gemini response:', response?.text ? 'success' : 'failed/null');
        res.json({ text: response.text });
    } catch (error) {
        console.error("[DEBUG AI] Error in /chat:", error);
        res.status(500).json({ message: "Failed to chat with AI.", error: String(error) });
    }
});

router.post('/analyze-media-structured', async (req, res) => {
  console.log('[DEBUG AI] /analyze-media-structured endpoint hit');
  const { base64Data, mimeType } = req.body;

  if (!base64Data || !mimeType) {
    console.log('[DEBUG AI] Missing base64Data or mimeType');
    return res.status(400).json({ message: 'Missing base64Data or mimeType' });
  }

  try {
    const ai = getAI();
    if (!ai) {
        console.log('[DEBUG AI] Gemini AI not available, using Groq fallback for text analysis');
        // Fallback: Use Groq to generate suggestions based on filename/type if Gemini unavailable
        return res.status(503).json({ 
          message: "Image analysis requires GEMINI_API_KEY. Please add it to your .env.local file."
        });
    }

    console.log('[DEBUG AI] Analyzing media with Gemini...');
    const genAIResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",  // Updated to a valid model
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `You are an expert Land Commission analyst. Analyze this land-related document/image for a formal complaint to the National Land Commission of Kenya.

Provide a detailed analysis with the following:

1. **Title**: A professional, concise title (max 80 characters) that captures the essence of the issue

2. **Category**: Choose the most appropriate from:
   - Land Dispute (ownership conflicts, inheritance issues)
   - Illegal Acquisition (land grabbing, fraudulent transfers)
   - Boundary Dispute (encroachment, fence disputes, beacons)
   - Service Delay (delayed title deeds, processing delays)
   - Staff Misconduct (bribery, unprofessional behavior, negligence)
   - Valuation Issue (disputed land value, unfair compensation)
   - Other (specify in description)

3. **Priority Level**: Assess based on urgency and impact:
   - high: Immediate threat, ongoing illegal activity, safety concern, large financial impact
   - medium: Significant issue requiring timely attention
   - low: Minor issue, informational, can be addressed in normal course

4. **Detailed Description**: A comprehensive 3-5 sentence description that:
   - Identifies key visual elements and documents shown
   - Describes the specific land issue or violation observed
   - Notes any people, landmarks, or identifying features
   - Mentions dates, document numbers, or official stamps visible

5. **Key Issues**: Array of 3-5 specific bullet points identifying:
   - Specific violations or problems visible
   - Documents that appear fraudulent or problematic
   - Evidence of encroachment or boundary violations
   - Any missing or required documentation

Respond in valid JSON format matching the schema.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Professional complaint title" },
            category: { type: Type.STRING, description: "One of: Land Dispute, Illegal Acquisition, Boundary Dispute, Service Delay, Staff Misconduct, Valuation Issue, Other" },
            priority: { type: Type.STRING, description: "One of: low, medium, high" },
            description: { type: Type.STRING, description: "Detailed 3-5 sentence analysis" },
            keyIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 specific issues identified" }
          },
          required: ["title", "category", "priority", "description", "keyIssues"]
        }
      }
    });
    console.log('[DEBUG AI] Media analysis completed successfully');
    res.json(JSON.parse(genAIResponse.text));
  } catch (error) {
    console.error("[DEBUG AI] Error in /analyze-media-structured:", error);
    res.status(500).json({ message: "Failed to analyze media with AI.", error: String(error) });
  }
});

router.post('/thinking-response', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'Missing prompt' });
    }
    try {
        const ai = getAI();

        // Try Groq first for thinking response
        if (process.env.GROQ_API_KEY) {
            const response = await callOpenAICompatible("Groq", "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, "llama-3.3-70b-versatile", [{ role: "user", content: prompt }]);
            if (response) return res.json({ text: response });
        }
        
        // Try X.AI as fallback
        if (process.env.XAI_API_KEY) {
            const response = await callOpenAICompatible("X.AI", "https://api.x.ai/v1/chat/completions", process.env.XAI_API_KEY, "grok-2-1212", [{ role: "user", content: prompt }]);
            if (response) return res.json({ text: response });
        }

        if (!ai) {
            return res.json({ text: "Thinking process unavailable." });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
            }
        });
        res.json({ text: response.text });
    } catch (error) {
        console.error("Error in /thinking-response:", error);
        res.status(500).json({ message: "Failed to get thinking response from AI." });
    }
});

// Admin-specific complaint analysis endpoint
router.post('/admin-analyze-complaint', async (req, res) => {
    console.log('[DEBUG AI] /admin-analyze-complaint endpoint hit');
    const { title, description, category, mediaDescription } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ message: 'Missing title or description' });
    }

    try {
        const analysisPrompt = `You are a senior Land Commission analyst reviewing a complaint case. Provide a professional administrative analysis.

COMPLAINT DETAILS:
Title: ${title}
Category: ${category || 'Not specified'}
Description: ${description}
${mediaDescription ? `Media Evidence: ${mediaDescription}` : ''}

Provide your analysis in this structured format:

1. CASE SUMMARY: 2-3 sentence overview of the core issue

2. SEVERITY ASSESSMENT: 
   - Legal implications (high/medium/low)
   - Financial impact (high/medium/low) 
   - Public interest factor (high/medium/low)

3. KEY CONCERNS: List 4-6 specific red flags or critical points

4. RECOMMENDED ACTIONS:
   - Immediate steps (within 48 hours)
   - Short-term actions (within 2 weeks)
   - Long-term resolution strategy

5. REQUIRED DOCUMENTATION: List what documents/evidence should be requested

6. DEPARTMENT ASSIGNMENT: Which NLC department should handle this and why

7. PRIORITY JUSTIFICATION: Explain why this priority level was chosen

Format as clean, professional text suitable for case files.`;

        // Use Groq for admin analysis (works with text)
        if (process.env.GROQ_API_KEY) {
            const response = await callOpenAICompatible(
                "Groq", 
                "https://api.groq.com/openai/v1/chat/completions", 
                process.env.GROQ_API_KEY, 
                "llama-3.3-70b-versatile", 
                [
                    { role: "system", content: "You are an expert National Land Commission case analyst. Provide thorough, professional administrative assessments." },
                    { role: "user", content: analysisPrompt }
                ]
            );
            
            if (response) {
                console.log('[DEBUG AI] Admin analysis completed');
                return res.json({ analysis: response });
            }
        }

        return res.status(503).json({ message: "AI analysis unavailable - GROQ_API_KEY not configured" });
    } catch (error) {
        console.error("[DEBUG AI] Error in /admin-analyze-complaint:", error);
        res.status(500).json({ message: "Failed to analyze complaint.", error: String(error) });
    }
});

export default router;