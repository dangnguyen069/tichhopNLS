import { GoogleGenAI, Type } from "@google/genai";
import { IntegratedItem, NLSStandard, GradeLevel } from '../types';

// Ensure API key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API Key is missing in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-will-fail-if-used' });

const cleanAndParseJSON = (text: string): IntegratedItem[] => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("JSON Parse failed, attempting repair for truncated JSON...", e);
    // Attempt to repair truncated JSON array
    // Logic: If it's an array, find the last closing object brace '}', cut everything after, and append ']'
    if (cleanText.startsWith('[')) {
      const lastClosingBrace = cleanText.lastIndexOf('}');
      if (lastClosingBrace !== -1) {
        // Cut off everything after the last valid object
        const repairedText = cleanText.substring(0, lastClosingBrace + 1) + ']';
        try {
          const result = JSON.parse(repairedText);
          console.log("JSON Repaired successfully. Items recovered:", result.length);
          return result;
        } catch (repairError) {
          console.error("JSON Repair failed", repairError);
        }
      }
    }
    // If repair fails, throw original error or a user-friendly one
    throw new Error("Dữ liệu trả về từ AI bị ngắt quãng do quá dài. Vui lòng thử chia nhỏ nội dung đầu vào.");
  }
};

export const integrateNLS = async (
  content: string,
  subject: string,
  grade: GradeLevel,
  nlsStandards: NLSStandard[]
): Promise<IntegratedItem[]> => {

  const modelId = 'gemini-2.5-flash';

  const relevantStandards = nlsStandards.filter(s => s.level === grade);
  
  // Serialize standards for context
  const standardsContext = relevantStandards.map(s => 
    `- Code: ${s.code}\n  Indicator: ${s.indicator}\n  Domain: ${s.domain}`
  ).join('\n');

  const prompt = `
    Bạn là một chuyên gia giáo dục và năng lực số (Digital Competence - NLS).
    Nhiệm vụ của bạn là phân tích nội dung chương trình học (Phụ lục) được cung cấp dưới đây và tích hợp các chỉ báo Năng Lực Số (NLS) phù hợp.

    **Thông tin đầu vào:**
    - Môn học: ${subject}
    - Cấp độ: ${grade === GradeLevel.G6_7 ? 'Lớp 6-7 (TC1)' : 'Lớp 8-9 (TC2)'}
    - Nội dung chương trình:
    """
    ${content}
    """

    **Khung Năng Lực Số (Tham khảo):**
    ${standardsContext}

    **Yêu cầu CHI TIẾT:**
    1. Đọc kỹ nội dung chương trình để hiểu bối cảnh.
    2. Xác định các hoạt động, nội dung, hoặc chủ đề có tiềm năng tích hợp NLS.
    3. Chọn chỉ báo NLS phù hợp nhất từ danh sách "Khung Năng Lực Số".
    4. **QUAN TRỌNG:** Khi điền trường 'nlsIndicator', bạn phải **SAO CHÉP CHÍNH XÁC TỪNG TỪ** nội dung của chỉ báo trong danh sách tham khảo. KHÔNG được tóm tắt, viết lại hay rút gọn.
    5. Đề xuất hoạt động cụ thể, thực tế.
    6. Lý do chọn chỉ báo (trường 'reasoning') cần **NGẮN GỌN, SÚC TÍCH** để tiết kiệm dung lượng.

    Trả về kết quả dưới dạng JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Max output for 2.5 Flash
        temperature: 0.2,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalContent: { type: Type.STRING, description: "Nội dung gốc trong chương trình liên quan." },
              suggestion: { type: Type.STRING, description: "Hoạt động đề xuất để tích hợp NLS." },
              nlsCode: { type: Type.STRING, description: "Mã chỉ báo (ví dụ: 1.1.TC1a)." },
              nlsIndicator: { type: Type.STRING, description: "Nội dung chỉ báo chính xác từ danh sách (không được tóm tắt)." },
              reasoning: { type: Type.STRING, description: "Lý do chọn chỉ báo này (ngắn gọn)." }
            },
            required: ["originalContent", "suggestion", "nlsCode", "nlsIndicator", "reasoning"]
          }
        }
      }
    });

    if (response.text) {
      return cleanAndParseJSON(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
         throw error;
    }
    throw new Error("Không thể tích hợp NLS. Có thể nội dung quá dài hoặc server đang bận.");
  }
};