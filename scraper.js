//scraper
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

async function scrape(url, searchWord) {
  const browser = await puppeteer.launch({
    headeless: true,
    userDataDir: "./data",
    devtools: false,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    '["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36", "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/79.0.3945.73 Mobile/15E148 Safari/604.1"]'
  );

  await page.goto(url);

  //   await page.click(buttonId);

  await page.setViewport({ width: 1200, height: 1822 });

  //   //markerar och anger användarnamn
  //   await page.waitForSelector(fieldId);

  //   await page.type(fieldId, myUser);

  //   //markerar och anger lösenord
  //   await page.waitForSelector(fieldId);

  //   await page.type(fieldId, password);

  //   await Promise.all([
  //     page.click(buttonId),
  //     page.waitForNavigation({ waitUntil: "networkidle0" }),
  //   ]);

  //   const [el] = await page.$x(
  //     "/html/body/ytd-app/div/ytd-page-manager/ytd-browse/div[3]/ytd-c4-tabbed-header-renderer/tp-yt-app-header-layout/div/tp-yt-app-header/div[2]/div[2]/div/div[1]/div/div[1]/ytd-channel-name/div/div/yt-formatted-string"
  //   );

  //   //säkerställer att den browern väntar på både klick och sen naviagtion

  //klicka på knapp för att expandera sökfältet
  await Promise.all([
    page.waitForSelector("#searchfilterdivtitle > div:nth-child(3) > a"),
    page.click("#searchfilterdivtitle > div:nth-child(3) > a"),
    // page.waitForNavigation({ waitUntil: "networkidle0" }),
    //ta ett screenshot och se hur syns
    await page.screenshot({ path: "screenshotz.png" }),
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
  scrape: scrape,
};

//TODO:
//Förbättra performance -> verkar inte fungera på bortskänkes.se

// await page.setRequestInterception(true);
// page.on("request", (request) => {
//   if (request.resourceType() === "document") {
//     request.continue();
//   } else {
//     request.abort();
//   }
// });
