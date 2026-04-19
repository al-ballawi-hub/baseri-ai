import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Chromium binary URL matching the installed @sparticuz/chromium-min version
const CHROMIUM_PACK_URL = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.1/chromium-v147.0.1-pack.x64.tar';

export async function scanWebsite(url: string) {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    let browser;

    try {
        console.log(`🌐 Initializing Puppeteer for ${cleanUrl}...`);

        // Detect environment: Vercel (serverless) vs Local development
        const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

        let executablePath: string | undefined;

        if (isVercel) {
            // Vercel/Serverless: Download chromium binary from GitHub releases
            executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
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
            if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
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

        // Navigation Strategy: fast timeout for Vercel's 60s limit
        try {
            await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // Wait a bit more for dynamic content
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.warn("⚠️ Page load timeout. Proceeding with analysis...");
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

        // Quick scroll to trigger lazy loading (fast version)
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await new Promise(r => setTimeout(r, 300));
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        // Capture Content
        const html = await page.content();

        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false,
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
