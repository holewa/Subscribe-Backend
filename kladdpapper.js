const { mailIfNewAdds, sleep } = require("./DatabaseService");
const Search = require("./Search");

const checkForNewAddsForEveryUserAndSendEmail = async () => {
  //hämtar alla användare ur db
  const dataFromDb = await getDataFromDb();

  const userAndSearches = [];
  dataFromDb.forEach(async (user) => {
    userAndSearches.push({
      user: user,
      searches: user.searches,
    });
  });

  //skapar en array med enbart unika användare och sökord
  const userAndSearchesObject = [];
  for (let i = 0; i < userAndSearches.length; i++) {
    for (let j = 0; j < userAndSearches[i].searches.length; j++) {
      userAndSearchesObject.push({
        user: userAndSearches[i].user,
        searchWord: userAndSearches[i].searches[j].searchWord,
      });
    }
  }

  //för varje användare + sökord => Skicka ut info om ny annons.
  userAndSearchesObject.map(async (obj) => {
    const data = await mailIfNewAdds(obj.user, obj.searchWord);
    return data;
  });
};

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

const runEveryXMinutes = async (minutes) => {
  while (true) {
    Promise.all[
      (console.log("Kollar behovet av mailutskick..."),
      await checkForNewAddsForEveryUserAndSendEmail())
    ];
    Promise.all[
      (console.log(`Now sleeping for ${minutes} minutes`), await sleep(minutes))
    ];
  }
};

function kladdpappersFunktionen() {
  //   const data = await scrape(
  //     "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
  //     "matta"
  //   );
  //   const dataObj = { searchWord: "matta", data };
  //   console.log(dataObj);
  //   console.log(scrapedDataForEveryData);
  //   console.log(userSearches[0].searches[0].adArray);
  //   userSearches.forEach((obj) => {
  //     console.log(obj.searches);
  //   });
  //   console.log(userSearches);

  //lista med alla sökord som existerar i db
  let searchWordsToScrape = [];
  for (let i = 0; i < userAndSearches.length; i++) {
    for (let j = 0; j < userAndSearches.length; j++) {
      const searchWords = userAndSearches[i].searches[j].searchWord;
      searchWordsToScrape.push(searchWords);
    }
  }
  //lista för unika sökord - för att inte behöva skrapa fler ggr än nödvändigt
  var uniqueSearchWordsToScrape = searchWordsToScrape.filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const emails = [];
  userAndSearches.forEach((post) => {
    emails.push({ email: post.email });
  });

  const searchWords = [];
  userAndSearches.forEach((post) => {
    searchWords.push({ searchWord: post.searches });
  });

  const searches = [];
  searchWords.forEach((post) => {
    searches.push(post);
  });
}

function objectsEqual(o1, o2) {
  const entries1 = Object.entries(o1);
  const entries2 = Object.entries(o2);
  if (entries1.length !== entries2.length) {
    return false;
  }
  for (let i = 0; i < entries1.length; ++i) {
    // Keys
    if (entries1[i][0] !== entries2[i][0]) {
      return false;
    }
    // Values
    if (entries1[i][1] !== entries2[i][1]) {
      return false;
    }
  }

  return true;
}

//PUPPETEER ANTECKNINGAR!
//   //markerar och anger användarnamn
//   await page.waitForSelector(fieldId);

//   await page.click(buttonId);

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

// page.waitForNavigation({ waitUntil: "networkidle0" }),
//ta ett screenshot och se hur syns

module.exports = {
  checkForNewAddsForEveryUserAndSendEmail,
  getDataFromDb,
  runEveryXMinutes,
};
