"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY is missing in process.env");
    throw new Error("API Key AI belum dikonfigurasi di server.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function getAiBrain(purpose: string) {
  const result = await prisma.$queryRaw<any[]>`SELECT * FROM "AiBrain" WHERE purpose = ${purpose} LIMIT 1`;
  return result[0] || null;
}

export async function upsertAiBrain(purpose: string, systemPrompt: string) {
  const existing = await getAiBrain(purpose);
  if (existing) {
    return prisma.$executeRaw`UPDATE "AiBrain" SET "systemPrompt" = ${systemPrompt}, "updatedAt" = NOW() WHERE purpose = ${purpose}`;
  } else {
    return prisma.$executeRaw`INSERT INTO "AiBrain" (id, purpose, "systemPrompt", "updatedAt") VALUES (gen_random_uuid(), ${purpose}, ${systemPrompt}, NOW())`;
  }
}

export async function generateWithAi(params: {
  prompt: string;
  systemPromptPurpose: string;
  modelName?: string;
}) {
  try {
    const brain = await getAiBrain(params.systemPromptPurpose);
    const systemPrompt = brain?.systemPrompt || "Anda adalah asisten cerdas.";
    
    const genAI = getGenAI();
    const selectedModel = params.modelName || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: selectedModel });
    
    console.log(`Generating with AI [${selectedModel}] for ${params.systemPromptPurpose}...`);
    
    const fullPrompt = `${systemPrompt}\n\n${params.prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("AI returned empty response");
    
    return text;
  } catch (error: any) {
    console.error("AI Generation failed detailed error:", error.message || error);
    throw new Error(error.message || "Gagal melakukan generate dengan AI.");
  }
}

export async function generateSeoMetadata(title: string, content: string, modelName?: string) {
  try {
    // Force use of a Lite model for SEO to ensure maximum speed during saving
    const fastModel = "gemini-2.5-flash-lite";
    const prompt = `Berikan meta deskripsi (maks 160 karakter) dan 5-10 kata kunci yang relevan untuk artikel berikut. RESPON WAJIB DALAM FORMAT JSON MURNI: { \"description\": \"...\", \"keywords\": \"...\" }\n\nJudul: ${title}\nKonten: ${content.slice(0, 1000)}`;
    
    const text = await generateWithAi({
      prompt,
      systemPromptPurpose: "SEO_METADATA",
      modelName: fastModel
    });
    
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    return {
      description: `Baca selengkapnya tentang ${title}.`,
      keywords: "k3, sertifikasi"
    };
  }
}

export async function generateFullArticle(title: string, outline: string, modelName?: string) {
  const brain = await getAiBrain("ARTICLE_GENERATOR");
  const systemPrompt = brain?.systemPrompt || "Tuliskan artikel lengkap yang mendalam dan informatif dengan format Markdown berdasarkan judul dan outline berikut.";
  
  const prompt = `Judul: ${title}\nOutline/Konteks: ${outline}`;
  
  return generateWithAi({
    prompt,
    systemPromptPurpose: "ARTICLE_GENERATOR",
    modelName
  });
}

export async function suggestArticleTitles(topic: string, modelName?: string) {
  const prompt = `Berikan 5 ide judul artikel SEO-friendly tentang topik: "${topic}". 
  ATURAN: 
  - Harus sesuai dengan volume pencarian tinggi di Google Indonesia.
  - Bahasa formal namun menarik (Click-worthy).
  - JANGAN menyebutkan kompetitor manapun.
  - Tetap jaga etika dan profesionalisme industri K3.
  - Berikan dalam format JSON: { "suggestions": ["judul 1", "judul 2", ...] }`;

  const text = await generateWithAi({
    prompt,
    systemPromptPurpose: "ARTICLE_GENERATOR",
    modelName
  });

  const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanJson);
}
