const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { mongooseConnect } = require("./MongooseConnect");
const { getUserFromDb } = require("./DatabaseService");
const { sendMail } = require("./nodemailer");
const { runEveryXMinutes } = require("./kladdpapper");

const {
  startASubscription,
  getEarlierSearchWords,
  removeSearch,
} = require("./UserService");

const { checkForNewAdds } = require("./Testing2");

app.use(cors());
app.use(bodyParser.json());

mongooseConnect();
// runEveryXMinutes(1);

// sendMail("holewa@gmail.com", "CylindasGiiigpis", "spis", "länk", "bild");

let user;
let searchWord;
// checkForNewAddsForEveryUserAndSendEmail();

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

app.post("/startASubscription", async (req, res) => {
  const response = await startASubscription(user, searchWord);
  await res.send(response);
});

//kollar om nya annonser har tillkommit
app.post("/mailIfNewAdds", async (req, res) => {
  const newAdFound = await checkForNewAdds(user, searchWord);

  if (newAdFound) {
    sendMail(user, newAdFound.adTitle, searchWord, newAdFound.link);
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
