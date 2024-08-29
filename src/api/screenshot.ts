import puppeteer from 'puppeteer';

// return the base64 image
export async function save_site(website: string){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the desired website
        await page.goto(website, { waitUntil: 'networkidle0' });

        // Wait for 3 seconds to ensure the site is fully loaded
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Capture the screenshot as a Buffer
        const screenshotBuffer = await page.screenshot({ fullPage: true });

        // Convert the Buffer to a Base64 string
        const screenshotBase64 = screenshotBuffer.toString('base64');

        // Output the Base64 string (or you can use it in your application as needed)
     //   console.log(screenshotBase64);

        // Close the browser
        await browser.close();
    return screenshotBase64;
}