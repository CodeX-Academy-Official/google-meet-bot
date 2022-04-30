// This is the main Node.js source code file of your actor.

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');

Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
    console.log('Going to accounts.google.com...');
    await page.goto('https://accounts.google.com/');

    await navigationPromise;
    await page.waitForSelector('input[type="email"]');
    await page.click('input[type="email"]');

    await navigationPromise;

    console.log('Typing in email...');
    await page.type('input[type="email"]', input.Email);
    await page.waitForSelector('#identifierNext');
    await page.click('#identifierNext');
    await page.waitFor(5000);

    await page.waitForSelector('input[type="password"]');
    await page.click('input[type="password"]');

    console.log('Typing in password...');
    await page.type('input[type="password"]', input.Password);
    await page.waitForSelector('#passwordNext');
    await page.click('#passwordNext');

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    console.log('Logged in to google successfully...');
});
