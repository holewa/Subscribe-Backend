const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { mongooseConnect } = require("./MongooseConnect");
const {
  getUserFromDb,
  checkForNewAdds,
  removeAddsForGivenSearchWord,
  mailIfNewAdds,
} = require("./DatabaseService");
const { sendMail } = require("./nodemailer");
const { runProgramEveryXMinutes } = require("./ApplicationService");
const {
  startASubscription,
  getEarlierSearchWords,
  removeSearch,
} = require("./UserService");

app.use(cors());
app.use(bodyParser.json());

mongooseConnect();
// runProgramEveryXMinutes(5)

let user;
let searchWord;

//MiddleWare som sätter user innan varje anrop.
const getUserMW = async (req, res, next) => {
  //hämtar den givna användaren
  user = await getUserFromDb(req.body.email);
  searchWord = req.body.searchWord;
  if (user != null) {
    next();
    return;
  } else {
    const response = {
      typeOfAlert: "alert alert-danger alert-dismissible fade show",
      text: "Användaren hittades inte",
      earlierSearches: [],
    };
    res.send(response);
  }
};
app.use(getUserMW);

app.post("/removeAddsForGivenSearchWord", async (req, res) => {
  await removeAddsForGivenSearchWord(user, searchWord);
  await res.send("Annonser borttagna");
});

app.post("/startASubscription", async (req, res) => {
  const response = await startASubscription(user, searchWord);
  await res.send(response);
});

//kollar om nya annonser har tillkommit
app.post("/mailIfNewAdds", async (req, res) => {
  const newAdFound = await checkForNewAdds(user, searchWord);

  if (newAdFound) {
    sendMail(user, newAdFound.adTitle, searchWord, newAdFound.link, newAdFound.imgUrl);
    res.send("Ny annons hittad, mail skickat!");
  } else {
    res.send(
      `Ingen ny annons hittad för sökningen ${user.email} för sökordet ${searchWord} !!`
    );
  }
});

//TODO: Undersök varför inte request body finns/funkar med get request
app.post("/getUsersSubscribes", async (req, res) => {
  const response = await getEarlierSearchWords(user);

  res.send(response);
});

app.post("/removeSearchFromUser", async (req, res) => {
  const response = await removeSearch(user, searchWord);

  res.send(response);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
