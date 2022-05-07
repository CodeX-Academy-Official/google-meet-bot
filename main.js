/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
/* eslint-disable comma-dangle */
// This is the main Node.js source code file of your actor.

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');

Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const browser = await Apify.launchPuppeteer({
        useChrome: true,
        launchOptions: {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--use-fake-ui-for-media-stream',
                '--disable-audio-output',
            ],
        },
    });
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
    await page.waitForTimeout(5000);

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
    const meetPage = await browser.newPage();
    await page.setDefaultNavigationTimeout(input.EndTime);
    console.log('Going to meet.google.com...');
    await meetPage.goto('https://meet.google.com/');
    await meetPage.click('input[class="VfPpkd-fmcmS-wGMbrd B5oKfd"]');
    console.log('Entering meet link...');
    await meetPage.type('input[type="text"]', input.MeetLink);
    console.log('Waiting for 3sec...');
    await meetPage.waitForTimeout(3000);
    console.log('Clicking join button...');
    await meetPage.click(
        'button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-dgl2Hf ksBjEc lKxP2d qfvgSe cjtUbb"]'
    );
    console.log('Clicked join button...');
    console.log('Waiting for 2sec...');
    await meetPage.waitForTimeout(2000);
    console.log(
        'Waiting for 10sec to check if the meeting has Ask to join enabled...'
    );
    await meetPage.waitForTimeout(3000);

    // turn off cam using Ctrl+E
    await meetPage.waitForTimeout(8000);
    await meetPage.keyboard.down('ControlLeft');
    await meetPage.keyboard.press('KeyE');
    await meetPage.keyboard.up('ControlLeft');
    await meetPage.waitForTimeout(2000);

    // turn off mic using Ctrl+D
    await meetPage.waitForTimeout(1000);
    await meetPage.keyboard.down('ControlLeft');
    await meetPage.keyboard.press('KeyD');
    await meetPage.keyboard.up('ControlLeft');
    await meetPage.waitForTimeout(2000);

    // Join Now
    await meetPage.click(
        'button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-k8QpJ VfPpkd-LgbsSe-OWXEXe-dgl2Hf nCP5yc AjY5Oe DuMIQc qfvgSe jEvJdc QJgqC"]'
    );
    console.log('Joined class successfully...');
    await meetPage.waitForTimeout(3000);

    const end = Date.now() + input.EndTime;

    while (Date.now() < end) {
        console.log(Date.now());
        if (
            (await meetPage.$(
                'div[class="VfPpkd-Sx9Kwc cC1eCc UDxLd PzCPDd Qb2h6b xInSQ OjJiBf AVesm VfPpkd-Sx9Kwc-OWXEXe-FNFY6c"]'
            )) !== null
        ) {
            const [button] = await meetPage.$x(
                "//button[contains(., 'Admit')]"
            );
            if (button) {
                await button.click();
            }
            // await meetPage.click(
            //     'button[class="VfPpkd-LgbsSe VfPpkd-LgbsSe-OWXEXe-dgl2Hf ksBjEc lKxP2d qfvgSe AjXHhf"]'
            // );
        }
    }
    await meetPage.goBack();
    await browser.close();
});
