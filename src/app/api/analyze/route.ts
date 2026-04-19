import { NextRequest, NextResponse } from 'next/server';
import { scanWebsite } from '@/lib/scanner';
import { analyzeUX } from '@/lib/gemini';

// Vercel serverless function config
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`🚀 Starting analysis for: ${url}`);

        // Step 1: Scan the website (Puppeteer)
        const { html, screenshot, ...technicalContext } = await scanWebsite(url);
        console.log("📸 Screenshot and HTML captured");

        // Ensure screenshot is a Buffer
        const screenshotBuffer = Buffer.from(screenshot);

        // Step 2: Analyze with AI (Gemini)
        const analysis = await analyzeUX(screenshotBuffer, html, technicalContext);
        console.log("🤖 AI Analysis complete");

        // Convert screenshot buffer to base64 for frontend display
        const screenshotBase64 = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

        return NextResponse.json({
            success: true,
            data: analysis,
            screenshot: screenshotBase64
        });

    } catch (error: any) {
        console.error("Analysis pipeline failed:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
