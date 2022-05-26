const Search = require("./Search");
const { scrape } = require("./scraper");
const { sendMail } = require("./nodemailer");

const getAllAdsForGivenSearchWord = async (searchWord) => {
  //skrapade annonser för givet sökord
  const data = await scrape(
    "https://www.bortskankes.se/stockholm/",
    searchWord
  );

  return data;
};

const getLastAddForGivenSearch = async (searchWord) => {
  const data = await getAllAdsForGivenSearchWord(searchWord);
  const lastAd = data[0];

  return lastAd;
};

const userExists = async (email) => {
  //kollar om användaren finns i db
  const userExists = await Search.exists({ email: email });

  return userExists;
};

const mailIfNewAdds = async (user, searchWord) => {
  const newAdsFound = await checkForNewAdds(user, searchWord);

  if (newAdsFound) {
    const lastAdTitle = newAdsFound.adTitle;
    const lastAdLink = newAdsFound.link;
    const lastAdImgUrl = newAdsFound.imgUrl;
    sendMail(user, lastAdTitle, searchWord, lastAdLink, lastAdImgUrl);
  }
};

const sleep = (minutes) => {
  const minutesInMilliSeconds = minutes * 1000 * 60;
  return new Promise((resolve) => {
    setTimeout(resolve, minutesInMilliSeconds);
  });
};

async function checkForNewAdds(user, searchWord) {
  //TODO: kolla om användaren prenumererar på det valda ordet

  //skrapar data från hemsidan
  const lastScrapedAds = await getAllAdsForGivenSearchWord(searchWord);

  //senaste annonsen för givet sökord
  const lastScrapedAd = lastScrapedAds[0];

  const searchesFromDb = user.searches;

  let newAdsFound = true;

  searchesFromDb.forEach(async (search) => {
    if (search.searchWord === searchWord) {
      length = search.adArray.length;

      //hämtar ut den senaste annonsrubriken och tidsstämpeln ur listan

      for (let i = 0; i < length; i++) {
        //kollar om den senast skrapade annons finns i db
        if (
          search.adArray[i].link === lastScrapedAd.link
          // search.adArray[i].timeStamp === lastScrapedTimeStamp
        ) {
          newAdsFound = false;
        }
      }

      if (newAdsFound) {
        // stoppar in senaste annons- och tidsstämpel från skrap
        search.adArray.push({
          adTitle: lastScrapedAd.adTitle,
          timeStamp: lastScrapedAd.timeStamp,
          link: lastScrapedAd.link,
        });
        //skapar ett uppdaterat searchObject som läggs in i db
        const updSearch = {
          email: user.email,
          searches: searchesFromDb,
        };
        await user.save(updSearch);

        //TODO: response?
        console.log(
          `Ny annons hittad för sökningen: ${user.email} för sökordet ${searchWord} sparad i db!`
        );
      } else {
        console.log(
          `Ingen ny annons hittad för sökningen ${user.email} för sökordet ${searchWord} !!`
        );
      }
    }
  });

  return newAdsFound ? lastScrapedAd : false;
}

module.exports = {
  checkForNewAdds,
  getLastAddForGivenSearch,
  userExists,
  mailIfNewAdds,
  sleep,
  checkForNewAdds,
};
