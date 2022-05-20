const { userExists, getUserFromDb } = require("./DatabaseService");
const Search = require("./Search");

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

    const earlierSearches = await getEarlierSearchWords(email);

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
        earlierSearches: earlierSearches,
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
    await Search.create(search);
  }

  return response;
}

const removeSearch = async (user, searchWordToDelete) => {
  userSearches = user.searches;

  const updatedSearches = userSearches.filter(
    (obj) => obj.searchWord !== searchWordToDelete
  );

  //lista med enbart sökord för response
  const earlierSearches = [];
  updatedSearches.forEach((search) => {
    earlierSearches.push(search.searchWord);
  });

  user.searches = updatedSearches;
  //sparar användarens nya objekt
  await user.save();

  console.log("Sökordet borttaget!");

  const response = {
    typeOfAlert: "alert alert-primary alert-dismissible fade show",
    text: "Prenumeration för sökord borttaget!",
    earlierSearches: earlierSearches,
  };

  return response;
};

const getEarlierSearchWords = async (user) => {
  const earlierSearches = [];
  const userSearchObj = user.searches;

  userSearchObj.forEach((search) => {
    earlierSearches.push(search.searchWord);
  });

  const response = {
    earlierSearches: earlierSearches,
  };

  return response;
};

module.exports = {
  startASubscription,
  removeSearch,
  getEarlierSearchWords,
};