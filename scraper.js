//scraper
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

async function scrape(url, searchWord) {
  const minimal_args = [
    "--autoplay-policy=user-gesture-required",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-setuid-sandbox",
    "--disable-speech-api",
    "--disable-sync",
    "--hide-scrollbars",
    "--ignore-gpu-blacklist",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pings",
    "--no-sandbox",
    "--no-zygote",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  const browser = await puppeteer.launch({
    headeless: true,
    userDataDir: "./data",
    devtools: false,
    args: minimal_args,
    userDataDir: "./my/path",
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    '["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36", "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/79.0.3945.73 Mobile/15E148 Safari/604.1"]'
  );

  await page.goto(url);

  await page.setViewport({ width: 1200, height: 1822 });

  //klicka på knapp för att expandera sökfältet
  await Promise.all([
    page.waitForSelector("#searchfilterdivtitle > div:nth-child(3) > a"),
    page.click("#searchfilterdivtitle > div:nth-child(3) > a"),
  ]);

  await page.type("#searchtxt", searchWord + "");

  //klickar på sök och väntar på navigation
  await Promise.all([
    page.click(
      "#searchfilterdiv > form > div:nth-child(4) > div:nth-child(2) > button"
    ),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  //page evaluate är puppeteer som tillåter plain js innuti :)
  const titles = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "#ads_table_rwd > tbody > tr > td.ads_td2 > a > h3"
      )
    ).map((x) => x.textContent);
  });

  const times = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "#ads_table_rwd > tbody > tr > td.ads_td4b > div:nth-child(1) > a"
      )
    ).map((x) => x.textContent);
  });

  const links = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "#ads_table_rwd > tbody > tr > td.ads_td2.annonskategoriklass3 > a"
      )
    ).map((x) => x.href);
  });

  const imgUrls = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "#ads_table_rwd > tbody > tr > td.ads_td1 > a > img"
      )
    ).map((x) => x.currentSrc);
  });

  // skapar en array och lägger till titel, tidsstämpel, länk och imgUrl
  const ads = [];
  for (let i = 0; i < times.length; i++) {
    ads.push({
      adTitle: titles[i],
      timeStamp: times[i],
      link: links[i],
      imgUrl: imgUrls[i],
    });
  }

  browser.close();
  return ads;
}

module.exports = {
  scrape,
};
