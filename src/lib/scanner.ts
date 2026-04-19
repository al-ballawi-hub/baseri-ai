import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function scanWebsite(url: string) {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    let browser;

    try {
        console.log(`🌐 Initializing Puppeteer for ${cleanUrl}...`);

        // Detect environment: Vercel (serverless) vs Local development
        const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

        let executablePath: string | undefined;

        if (isVercel) {
            // Vercel/Serverless: Use @sparticuz/chromium
            executablePath = await chromium.executablePath();
        } else {
            // Local development: Use installed Chrome
            const fs = require('fs');
            const localPaths = [
                process.env.CHROME_PATH,
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser',
            ].filter(p => p && fs.existsSync(p));
            executablePath = localPaths[0] as string | undefined;
        }

        browser = await puppeteer.launch({
            args: isVercel ? chromium.args : [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ],
            defaultViewport: { width: 1920, height: 1080 },
            executablePath,
            headless: true,
        });

        const page = await browser.newPage();

        // Optimize: Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Set high-quality User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // Capture Console Logs
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            const type = msg.type() as string;
            if (type === 'error' || type === 'warning') {
                consoleLogs.push(`${type.toUpperCase()}: ${msg.text()}`);
            }
        });

        console.log(`▶️ Navigating to ${cleanUrl}...`);

        // Navigation Strategy: Network Idle is best, but with a safe timeout
        try {
            await page.goto(cleanUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        } catch (e) {
            console.warn("⚠️ Page load timeout (30s) or partial load. Proceeding with analysis...");
        }

        // --- ENHANCED CLEANUP & PREP ---
        await page.evaluate(() => {
            // Remove cookie banners
            const selectors = [
                '#cookie-banner', '#onetrust-banner-sdk', '.cookie-consent',
                '[id*="cookie"]', '[class*="cookie"]', '.modal', '[role="dialog"]'
            ];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach((el: any) => el.style.display = 'none');
            });

            // Force visible scrollbars to hidden for cleaner screenshot
            document.body.style.overflow = 'hidden';
        });

        // Auto-scroll to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 20); // Faster scroll
            });
            window.scrollTo(0, 0);
        });

        // Specific wait for stabilization
        await new Promise(r => setTimeout(r, 1000));

        // Capture Content
        const html = await page.content(); // cleaner than evaluate

        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true,
            captureBeyondViewport: true,
            encoding: 'binary'
        });

        // Basic technical details for context
        let title = "Analyzed Site";
        try {
            title = await page.title();
        } catch (e) { }

        await browser.close();

        const technicalDetails = {
            title,
            viewport: { width: 1920, height: 1080 }
        };

        return {
            html,
            screenshot,
            consoleLogs: consoleLogs.slice(0, 20),
            technicalDetails
        };

    } catch (error) {
        if (browser) await browser.close();
        console.error("❌ Puppeteer Error:", error);
        throw error;
    }
}
