import { GoogleGenerativeAI } from "@google/generative-ai";


// Access your API key as an environment variable (best practice)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const askChatbot = async (message) => {
  try {
    // Use the correct Gemini model name for v1 API
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // The input should be wrapped in a 'contents' array
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get response from chatbot");
  }
};