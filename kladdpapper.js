const { mailIfNewAdds, sleep } = require("./DatabaseService");
const { mongooseConnect } = require("./MongooseConnect");
const Search = require("./Search");

const checkForNewAddsForEveryUserAndSendEmail = async () => {
  //hämtar alla användare ur db
  const dataFromDb = await getDataFromDb();

  //skapar en array med bara användare och sökObj
  const userAndSearches = [];
  dataFromDb.forEach(async (user) => {
    userAndSearches.push({
      email: user.email,
      searches: user.searches,
    });
  });

  // {
  //  'email': 'holewa@gmail.com',
  //   'searches': [ {searchWord: 'blandare'
  //                      adArray{}
  //                      },
  //                   {},
  //                   {}
  //    ]

  //
  // }

  //skapar en array med enbart användare och sökord
  const userAndSearchesObject = [];
  for (let i = 0; i < userAndSearches.length; i++) {
    for (let j = 0; j < userAndSearches[i].searches.length; j++) {
      userAndSearchesObject.push({
        email: userAndSearches[i].email,
        searchWord: userAndSearches[i].searches[j].searchWord,
      });
    }
  }

  //för varje användare + sökord => skapa en prenumeration
  userAndSearchesObject.map(async (obj) => {
    const data = await mailIfNewAdds(obj.email, obj.searchWord);
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

mongooseConnect();

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

module.exports = {
  checkForNewAddsForEveryUserAndSendEmail,
  getDataFromDb,
  runEveryXMinutes,
};
