const Search = require("./Search");

const userExists = async (email) => {
  //kollar om användaren finns i db
  const userExists = await Search.exists({ email: email });

  return userExists;
};

module.exports = {
  userExists,
};
