// const removeSearchFromDb20 = async (user, searchWordToDelete) => {
//   //hämtar användarens
//   const userEarlierSearches = await getUserEarlierSearchWords20(user);

//   const userSearches = userEarlierSearches.earlierSearches;

//   const updatedSearches = userSearches.filter(
//     (obj) => obj !== searchWordToDelete
//   );

//   console.log(user.searches);

//   await user.save();

//   console.log("Sökordet borttaget!");

//   const response = {
//     typeOfAlert: "alert alert-primary alert-dismissible fade show",
//     text: "Prenumeration för sökord borttaget!",
//     earlierSearches: updatedSearches,
//   };

//   return response;
// };
// const removeSearchFromDb20 = async (user, searchWordToDelete) => {
//   //hämtar användarens
//   const userEarlierSearches = await getUserEarlierSearchWords20(user);

//   const userSearches = userEarlierSearches.earlierSearches;

//   const updatedSearches = userSearches.filter(
//     (obj) => obj !== searchWordToDelete
//   );

//   console.log(user.searches);

//   await user.save();

//   console.log("Sökordet borttaget!");

//   const response = {
//     typeOfAlert: "alert alert-primary alert-dismissible fade show",
//     text: "Prenumeration för sökord borttaget!",
//     earlierSearches: updatedSearches,
//   };

//   return response;
// };

const removeSearchFromDb20 = async (user, searchWordToDelete) => {
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

const getUserEarlierSearchWords20 = async (user) => {
  const earlierSearches = [];
  const userSearchObj = user.searches;

  userSearchObj.forEach((search) => {
    earlierSearches.push(search.searchWord);
  });

  const response = {
    typeOfAlert: "alert alert-primary alert-dismissible fade show",
    text: "Inga sökningar hittades!",
    earlierSearches: earlierSearches,
  };

  return response;
};

module.exports = {
  removeSearchFromDb20,
  getUserEarlierSearchWords20,
};
