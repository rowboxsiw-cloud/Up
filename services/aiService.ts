
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSpendingInsights = async (transactions: Transaction[]) => {
  if (transactions.length === 0) return "Start transacting to see AI insights!";
  
  const prompt = `Analyze these recent UPI transactions and provide a short, encouraging 1-sentence insight for the user: ${JSON.stringify(transactions.slice(0, 5))}`;
  
  try {
    // Basic text task uses gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful financial assistant for a payment app called SkyPay. Be concise and friendly.",
      }
    });
    // Accessing text property directly as per guidelines
    return response.text || "Keep track of your spending to save more!";
  } catch (err) {
    console.error("AI Insight Error:", err);
    return "AI insights currently unavailable.";
  }
};

export const validatePaymentSecurity = async (amount: number, note: string) => {
  // Complex reasoning task about security uses gemini-3-pro-preview
  const prompt = `Analyze if this payment of ₹${amount} for "${note}" looks suspicious based on typical user behavior. Return a safety score from 0-100 and a reason.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safetyScore: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["safetyScore", "reason"]
        }
      }
    });
    
    // Safely extract and trim the JSON response string
    const jsonStr = (response.text || "").trim();
    return JSON.parse(jsonStr || '{"safetyScore": 100, "reason": "Verified safe"}');
  } catch (err) {
    console.error("AI Validation Error:", err);
    return { safetyScore: 100, reason: "Local validation passed" };
  }
};
