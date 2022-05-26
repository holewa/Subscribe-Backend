const Search = require("./Search");
const { scrape } = require("./scraper");
const { sendMail } = require("./nodemailer");

async function checkForNewAdds(email, searchWord) {
  //TODO: kolla om användaren prenumererar på det valda ordet

  //skrapar data från hemsidan
  const lastScrapedAds = await getAllAdsForGivenSearchWord(searchWord);

  //senaste annonsen för givet sökord
  const lastScrapedAd = lastScrapedAds[0];

  //senaste annonsens länk, titel och tidsstämpel
  const lastScrapedAdLink = lastScrapedAd.link;
  const lastScrapedAdTitle = lastScrapedAd.adTitle;
  const lastScrapedTimeStamp = lastScrapedAd.timeStamp;

  // hämtar användare ur db och kollar sista annonsens titel och tidsstämpel
  const user = await getUserFromDb(email);

  const searchesFromDb = user.searches;

  let newAdsFound = true;

  searchesFromDb.forEach(async (search) => {
    if (search.searchWord === searchWord) {
      const length = search.adArray.length;

      //hämtar ut den senaste annonsrubriken och tidsstämpeln ur listan

      for (let i = 0; i < length; i++) {
        //kollar om den senast skrapade annons finns i db
        if (
          search.adArray[i].link === lastScrapedAdLink
          // search.adArray[i].timeStamp === lastScrapedTimeStamp
        ) {
          newAdsFound = false;
        }
      }

      if (newAdsFound) {
        // stoppar in senaste annons- och tidsstämpel från skrap
        search.adArray.push({
          adTitle: lastScrapedAdTitle,
          timeStamp: lastScrapedTimeStamp,
          link: lastScrapedAdLink,
        });
        //skapar ett uppdaterat searchObject som läggs in i db
        const updSearch = {
          email: email,
          searches: searchesFromDb,
        };
        await user.save(updSearch);

        //TODO: response?
        console.log(
          `Ny annons hittad för sökningen: ${email} för sökordet ${searchWord} sparad i db!`
        );
      } else {
        console.log(
          `Ingen ny hittad för sökningen ${email} för sökordet ${searchWord} !!`
        );
      }
    }
  });

  return newAdsFound ? lastScrapedAd : false;
}

const getUserFromDb = async (email) => {
  //hämtar given användare
  const user = await Search.where({ email: email }).findOne({
    searchWord: "",
  });

  return user;
};

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

const mailIfNewAdds = async (email, searchWord) => {
  const newAdsFound = await checkForNewAdds(email, searchWord);

  if (newAdsFound) {
    const lastAdTitle = newAdsFound.adTitle;
    const lastAdLink = newAdsFound.link;
    const lastAdImgUrl = newAdsFound.imgUrl;
    sendMail(email, lastAdTitle, searchWord, lastAdLink, lastAdImgUrl);
  }
};

const mailIfNewAdds2 = async (email, searchWord) => {
  const newAdsFound = await checkForNewAdds(email, searchWord);

  if (newAdsFound) {
    const lastAdTitle = newAdsFound.adTitle;
    const lastAdLink = newAdsFound.link;
    const lastAdImgUrl = newAdsFound.imgUrl;
    sendMail(email, lastAdTitle, searchWord, lastAdLink, lastAdImgUrl);
  }
};

const sleep = (minutes) => {
  const minutesInMilliSeconds = minutes * 1000 * 60;
  return new Promise((resolve) => {
    setTimeout(resolve, minutesInMilliSeconds);
  });
};

module.exports = {
  checkForNewAdds,
  getUserFromDb,
  getLastAddForGivenSearch,
  userExists,
  mailIfNewAdds,
  sleep,
  mailIfNewAdds2,
};
