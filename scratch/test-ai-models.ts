import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing!");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to list models
  try {
    // Note: The SDK doesn't have a direct listModels method, but we can try a simple request
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`✅ Model ${modelName} is working!`);
      } catch (err: any) {
        console.log(`❌ Model ${modelName} failed: ${err.message.slice(0, 100)}`);
      }
    }
  } catch (err) {
    console.error("General error:", err);
  }
}

main();
