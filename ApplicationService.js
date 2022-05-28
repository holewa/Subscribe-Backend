const { mailIfNewAdds, sleep, getDataFromDb } = require("./DatabaseService");

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

const runProgramEveryXMinutes = async (minutes) => {
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

module.exports = {
  checkForNewAddsForEveryUserAndSendEmail,
  getDataFromDb,
  runProgramEveryXMinutes,
};
