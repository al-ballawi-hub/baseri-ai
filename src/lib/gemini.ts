import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using the fastest stable model
const MODEL_NAME = "gemini-2.0-flash";

export async function analyzeUX(imageBuffer: Buffer, htmlContent: string, technicalContext: any = {}): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    }
  });

  const systemInstruction = `
    You are the **Lead UX Architect & Senior Engineer** at a top-tier tech company (e.g., Linear, Apple, Stripe).
    Your standard is **Perfection (100/100)**. You despise generic, broken, or lazy designs.

    **YOUR TASK:**
    Perform a ruthless, deep-dive audit of the provided website screenshot and HTML.
    
    **ANALYSIS CRITERIA:**
    1. **Psychological UX & Trust:** Does the site instantly establish credibility? Are there dark patterns?
    2. **Visual Hierarchy & Aesthetics:** Analysis of whitespace, typography (rhythm/scale), color harmony, and contrast.
    3. **Conversion Rate Optimization (CRO):** Identify friction points preventing signups/sales. Copywriting analysis.
    4. **Code & Performance:** Check for semantic HTML issues, accessibility (a11y) flaws, and SEO gaps based on the HTML snippet.

    **OUTPUT FORMAT (JSON ONLY):**
    {
      "uxScore": number (0-100), // Be extremely strict. 90+ is world-class.
      "overallSummary": "A concise, executive-level summary of the site's state (2-3 sentences).",
      "croTips": [
        { "tip": "Actionable advice to boost conversion.", "impact": "High" | "Medium" }
      ],
      "criticalIssues": [
        {
          "id": "e.g., '01'",
          "title": "Short, punchy title",
          "description": "Detailed explanation of WHY this is bad for the user/business.",
          "solution": "The exact design/code principle to apply.",
          "suggestedFix": "Precise code snippet (React/Tailwind/CSS) to fix it. Do NOT be generic."
        }
      ]
    }
  `;

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    // Safely truncate HTML to avoid token limits while keeping structure
    const safeHtml = htmlContent ? htmlContent.substring(0, 30000) : "";

    const prompt = `
      Analyze this FULL PAGE screenshot and HTML snippet.
      Context: ${JSON.stringify(technicalContext)}
      
      If the page looks broken, empty, or has a massive error, state that in the summary and give a low score.
      Focus on: Navigation, Hero Section, CTA visibility, and Footer.
    `;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemInstruction }, imagePart, { text: prompt }, { text: `HTML Snippet: ${safeHtml}` }] }
      ]
    });

    const response = await result.response;
    const text = response.text();

    // With responseMimeType: "application/json", we can directly parse
    const parsedData = JSON.parse(text) as AnalysisResult;

    // Sanity check
    if (!parsedData.criticalIssues) parsedData.criticalIssues = [];

    return parsedData;

  } catch (error: any) {
    console.error("❌ Gemini Analysis Error:", error);
    throw new Error(`AI Analysis Failed: ${error.message || "Service Unavailable"}`);
  }
}
