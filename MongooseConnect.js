const mongoose = require("mongoose");

const mongooseConnect = () => {
  mongoose.connect(
    "mongodb+srv://holewa:mittlosen@cluster0.rdysa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  );
};

module.exports = {
  mongooseConnect,
};
