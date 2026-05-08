import { GoogleGenAI } from "@google/genai";
import { isValidGeminiKey } from "../lib/utils";

const getApiKey = () => {
  const processApiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '';
  return import.meta.env.VITE_GEMINI_API_KEY || processApiKey || '';
};

const getAiClient = () => {
  const apiKey = getApiKey();
  if (!isValidGeminiKey(apiKey)) {
    throw new Error("API Key Gemini tidak valid atau belum diatur. Silakan dapatkan API Key di aistudio.google.com dan pastikan di awali dengan 'AIza'.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function summarizeContent(content: string) {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [{
          text: `Anda adalah asisten AI di platform LuminaLMS. 
          Tolong rangkum materi berikut dalam bahasa Indonesia yang mudah dimengerti, dalam bentuk poin-poin.
          
          Materi:
          ${content}`
        }]
      }],
    });
    return response.text || "Gagal merangkum materi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat merangkum. Pastikan API Key sudah benar.";
  }
}

export async function askAssistant(content: string, question: string) {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [{
          text: `Anda adalah asisten AI di platform LuminaLMS. 
          Berdasarkan materi modul di bawah ini, bantu jawab pertanyaan siswa.
          
          Materi:
          ${content}
          
          Pertanyaan Siswa:
          ${question}`
        }]
      }],
    });
    return response.text || "Tidak ada jawaban.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat mencari jawaban. Pastikan API Key sudah benar.";
  }
}
