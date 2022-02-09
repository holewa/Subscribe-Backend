const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { mongooseConnect } = require("./MongooseConnect");
const {
  startASubscription,
  checkForNewAdds,
  getUserEarlierSearchWords,
  getLastAddForGivenSearch,
} = require("./BortskankesService");
const { sendMail } = require("./nodemailer");
const {
  removeSearchFromDb,
  getDataFromDb,
  checkForNewAddsForEveryUserAndSendEmail,
  runEveryXMinutes,
} = require("./kladdpapper");

app.use(cors());
app.use(bodyParser.json());

mongooseConnect();
runEveryXMinutes(10);

// const userExistsMW = async (req, res, next) => {
//   //kollar om användaren finns i db
//   const userExists = await userExists(req.body.email);
//   if (userExists) {
//     next();
//     return;
//   } else {
//     res.send("user not found");
//   }
// };

// const getUserMW = async (req, res, next) => {
//   //hämtar given användare
//   const user = await getUserFromDb(req.body.email);
//   next();
// };

// app.use(userExistsMW, getUserMW);

//starta en ny subscription från frontend endpoint
app.post("/startASubscription", async (req, res) => {
  const response = await startASubscription(
    req.body.email,
    req.body.searchWord
  );
  await res.send(response);
});

//kollar om nya annonser har tillkommit
app.post("/mailIfNewAdds", async (req, res) => {
  const newAdsFound = await checkForNewAdds(
    req.body.email,
    req.body.searchWord
  );
  const lastAdd = await getLastAddForGivenSearch(req.searchWord);
  const linkToLastAdd = lastAdd.link;

  if (newAdsFound) {
    sendMail(req.body.email, req.body.searchWord, linkToLastAdd);
  }
});

//TODO: Undersök varför inte request body finns/funkar med get request
app.post("/getUsersSubscribes", async (req, res) => {
  const response = await getUserEarlierSearchWords(req.body.email);
  res.send(response);
});

app.post("/removeSearchFromUser", async (req, res) => {
  const response = await removeSearchFromDb(
    req.body.email,
    req.body.searchWord
  );
  res.send(response);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
