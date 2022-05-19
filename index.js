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
  userExists,
  getUserFromDb,
} = require("./BortskankesService");
const { sendMail } = require("./nodemailer");
const { removeSearchFromDb, runEveryXMinutes } = require("./kladdpapper");
const {
  removeSearchFromDb20,
  getUserEarlierSearchWords20,
} = require("./kladdiz");

app.use(cors());
app.use(bodyParser.json());

mongooseConnect();
//runEveryXMinutes(20);

let user;
// checkForNewAddsForEveryUserAndSendEmail();

const userExistsMW = async (req, res, next) => {
  //kollar om användaren finns i db
  const userExists14 = await userExists(req.body.email);
  if (userExists14) {
    user = await getUserFromDb(req.body.email);
    next();
    return;
  } else {
    res.send("user not found");
  }
};

const getUserMW = async (req, res, next) => {
  //hämtar given användare
  const user = await getUserFromDb(req.body.email);
  next();
};

app.use(userExistsMW, getUserMW);

//starta en ny subscription
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
  const response = await getUserEarlierSearchWords20(user);

  res.send(response);
});

app.post("/removeSearchFromUser", async (req, res) => {
  const response = await removeSearchFromDb20(user, req.body.searchWord);

  res.send(response);
});

// app.post("/removeSearchFromUser", async (req, res) => {
//   const response = await removeSearchFromDb(
//     req.body.email,
//     req.body.searchWord
//   );

//   res.send(response);
// });

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
