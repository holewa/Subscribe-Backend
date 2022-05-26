// const Search = require("./Search");
// const { sendMail } = require("./nodemailer");

// const userExists = async (email) => {
//   //kollar om användaren finns i db
//   const userExists = await Search.exists({ email: email });

//   return userExists;
// };

// const mailIfNewAdds = async (user, searchWord) => {
//   const newAdsFound = await checkForNewAdds(user, searchWord);

//   if (newAdsFound) {
//     const lastAdTitle = newAdsFound.adTitle;
//     const lastAdLink = newAdsFound.link;
//     const lastAdImgUrl = newAdsFound.imgUrl;
//     sendMail(user, lastAdTitle, searchWord, lastAdLink, lastAdImgUrl);
//   }
// };

// const sleep = (minutes) => {
//   const minutesInMilliSeconds = minutes * 1000 * 60;
//   return new Promise((resolve) => {
//     setTimeout(resolve, minutesInMilliSeconds);
//   });
// };

// module.exports = {
//   userExists,
//   mailIfNewAdds,
//   sleep,
// };
