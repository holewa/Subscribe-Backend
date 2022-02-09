const Search = require("./Search");
const { scrape } = require("./scraper");
const { sendMail } = require("./nodemailer");

async function startASubscription(email, searchWord) {
  let response = {};

  if (searchWord.length < 3) {
    const response = {
      typeOfAlert: "alert alert-danger alert-dismissible fade show",
      text: "Vänligen skriv in ett ord med minst tre bokstäver",
    };
    return response;
  }

  //kollar om användaren finns i db
  const userExist = await userExists(email);

  //om användaren redan finns:
  if (userExist) {
    const user = await getUserFromDb(email);

    //hämtar användarens olika sökningar inkl resultat
    const searchArray = user.searches;

    let searchDoneBefore = false;
    //Ittererar över användarens tidigare sökningar och ser om samma sökning gjorts
    searchArray.forEach((ad) => {
      if (ad.searchWord === searchWord) {
        searchDoneBefore = true;
      }
    });

    //om searchDoneBefore är false skapas en ny sökning för given användare
    if (!searchDoneBefore) {
      //skrapar data
      const data = await scrape(
        "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
        searchWord
      );

      response = {
        typeOfAlert: "alert alert-primary alert-dismissible fade show",
        text: "Prenumeration skapad!",
      };

      //lägger till den nya datan i arrayen som plockades ur från användaren
      searchArray.push({ searchWord: searchWord, adArray: data });

      //sparar användarens nya objekt
      user.searches = searchArray;
      await user.save();
    } else {
      response = {
        typeOfAlert: "alert alert-danger alert-dismissible fade show",
        text: "Du prenumererar redan på det valda sökordet",
      };
    }
  } else {
    //skrapar data
    const data = await scrape(
      "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
      searchWord
    );
    //skapar ett searchObject som läggs till i db
    const search = {
      email: email,
      searches: [
        {
          searchWord: searchWord,
          adArray: data,
        },
      ],
    };

    //skapar data för ny användare
    const dbData = await Search.create(search);
  }

  return response;
}

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
      length = search.adArray.length;

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

const getUserEarlierSearchWords = async (email) => {
  const userExist = await userExists(email);

  const earlierSearches = [];

  if (userExist) {
    const user = await getUserFromDb(email);

    const userSearchObj = user.searches;

    userSearchObj.forEach((search) => {
      earlierSearches.push(search.searchWord);
    });
  }
  const response = {
    typeOfAlert: "alert alert-primary alert-dismissible fade show",
    text: "Inga sökningar hittades!",
    earlierSearches: earlierSearches,
  };

  return response;
};

const getAllAdsForGivenSearchWord = async (searchWord) => {
  //skrapade annonser för givet sökord
  const data = await scrape(
    "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
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

const sleep = (minutes) => {
  const minutesInMilliSeconds = minutes * 1000 * 60;
  return new Promise((resolve) => {
    setTimeout(resolve, minutesInMilliSeconds);
  });
};

module.exports = {
  startASubscription,
  checkForNewAdds,
  getUserFromDb,
  getUserEarlierSearchWords,
  getLastAddForGivenSearch,
  userExists,
  mailIfNewAdds,
  sleep,
};
