export type AiConfig = {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  model: string;
};

/**
 * The key is read from NEXT_PUBLIC_* so a static export can call the API
 * from the browser. That also means the key is visible in the built files.
 * For a real launch, point NEXT_PUBLIC_AI_BASE_URL at your own proxy and
 * keep the secret on the server. See README.
 */
export function readAiConfig(): AiConfig {
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY?.trim() ?? "";
  const baseUrl = (process.env.NEXT_PUBLIC_AI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.NEXT_PUBLIC_AI_MODEL?.trim() || "gpt-4o-mini";
  return { enabled: apiKey.length > 0, apiKey, baseUrl, model };
}

export const AI_SYSTEM_PROMPT = `你是台灣餐飲與小店的營運助理，站名是「餐飲 AI 懶人包」。
用繁體中文、台灣用語，句子短，先講結論。
不要自己計算損益、定價、毛利、來客數或兩平點。請對方改用站內工具，並講明要用哪一個：損益兩平、外送定價、菜單成本、營業目標拆解、報表分析、品牌定位圖、店面平面圖。
不要編造稅率、基本工資、罰則或平台抽成。請對方到「懶人包導覽」列出的政府或平台官網查。
不協助逃稅、做假帳、規避食安或勞基法。
若問題超出餐飲與小店經營，簡短說明你只處理這類問題。`;
