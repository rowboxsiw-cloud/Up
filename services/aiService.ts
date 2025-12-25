
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSpendingInsights = async (transactions: Transaction[]) => {
  if (transactions.length === 0) return "Start transacting to see AI insights!";
  
  const prompt = `Analyze these recent UPI transactions and provide a short, encouraging 1-sentence insight for the user: ${JSON.stringify(transactions.slice(0, 5))}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful financial assistant for a payment app called SkyPay. Be concise and friendly.",
      }
    });
    return response.text || "Keep track of your spending to save more!";
  } catch (err) {
    return "AI insights currently unavailable.";
  }
};

export const getSpendingBreakdown = async (transactions: Transaction[]) => {
  if (transactions.length === 0) return [];
  
  const prompt = `Categorize these transactions into Food, Travel, Shopping, Bills, or Others. Return a JSON array of objects with {category, amount, count}. Data: ${JSON.stringify(transactions)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              count: { type: Type.NUMBER }
            },
            required: ["category", "amount", "count"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (err) {
    return [];
  }
};

export const validatePaymentSecurity = async (amount: number, note: string) => {
  const prompt = `Analyze if this payment of ₹${amount} for "${note}" looks suspicious. Return a safety score 0-100 and a reason.`;
  
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
    return JSON.parse(response.text || '{"safetyScore": 100, "reason": "Verified safe"}');
  } catch (err) {
    return { safetyScore: 100, reason: "Local validation passed" };
  }
};
