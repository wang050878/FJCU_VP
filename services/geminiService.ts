
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role, GroundingSource } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-3-flash-preview';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * 串流發送訊息
   * @param history 對話歷史
   * @param prompt 使用者輸入
   * @param onChunk 每一塊文字傳回時的回調
   * @returns 最終的來源資料
   */
  async streamMessage(
    history: Message[], 
    prompt: string, 
    onChunk: (text: string) => void
  ): Promise<GroundingSource[] | undefined> {
    try {
      const contents = history.map(msg => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const responseStream = await this.ai.models.generateContentStream({
        model: this.modelName,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
          // 這裡可以選擇性加入 thinkingConfig: { thinkingBudget: 0 } 如果想徹底關閉推理思考，
          // 但通常串流就能解決「等待感」的問題。
        },
      });

      let fullText = "";
      let finalSources: GroundingSource[] | undefined;

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          onChunk(fullText);
        }

        // 嘗試從 chunk 中獲取來源資料 (通常在最後幾塊中)
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          const sources: GroundingSource[] = [];
          groundingChunks.forEach((c: any) => {
            if (c.web) {
              sources.push({ title: c.web.title, uri: c.web.uri });
            }
          });
          if (sources.length > 0) finalSources = sources;
        }
      }

      return finalSources;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("發送訊息時發生錯誤，請檢查網路連線。");
    }
  }
}

export const geminiService = new GeminiService();
