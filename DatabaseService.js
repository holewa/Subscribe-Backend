const Search = require("./Search");
const { scrape } = require("./scraper");
const { sendMail } = require("./nodemailer");
const { where } = require("./Search");

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
  //skrapar data från hemsidan
  const lastScrapedAds = await getAllAdsForGivenSearchWord(searchWord);

  //senaste annonsen för givet sökord
  const lastScrapedAd = lastScrapedAds[0];

  const searchesFromDb = user.searches;

  let newAdsFound = true;

  searchesFromDb.forEach(async (search) => {
    if (search.searchWord === searchWord) {
      const length = search.adArray.length;
      //hämtar ut den senaste annonsrubriken och tidsstämpeln ur listan
      for (let i = 0; i < length; i++) {
        if (
          //kollar om den senast skrapade annons finns i db
          search.adArray[i].adTitle === lastScrapedAd.adTitle &&
          search.adArray[i].timeStamp === lastScrapedAd.timeStamp
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

const getDataFromDb = async () => {
  const data = await Search.find({}, function (err, result) {
    if (err) {
      console.log(err);
    }
  })
    .clone()
    .catch(function (err) {
      console.log(err);
    });

  return data;
};

const removeAddsForGivenSearchWord = async (user, searchWordToDelete) => {
  userSearches = user.searches;

  for (let i = 0; i < userSearches.length; i++) {
    if (userSearches[i].searchWord === searchWordToDelete) {
      userSearches[i].adArray = [];
    }
  }
  await user.save();

  console.log("Annonser för sökordet borttagna!");
};

const manuallyCheckForNewAdds = async (user, searchWordToDelete) => {
  console.log("Allt i sin ordning");
};

module.exports = {
  checkForNewAdds,
  getUserFromDb,
  getLastAddForGivenSearch,
  userExists,
  mailIfNewAdds,
  sleep,
  getDataFromDb,
  removeAddsForGivenSearchWord,
  manuallyCheckForNewAdds,
};
