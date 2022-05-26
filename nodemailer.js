const nodemailer = require("nodemailer");

async function sendMail(user, adTitle, searchWord, link, imgUrl) {
  const linkText =
    !link === undefined
      ? `<h3>Tyvärr verkar länken inte fungera</h3>`
      : `<h3>Länk till annonsen: ${link}</h3>`;

  const output = `
  <h3>Ny annons hittad för ditt sökord: ${searchWord}!</h3>
  </br>
  <h3>${adTitle}</h3>
  <img src=${imgUrl}
  </br>
  </br>
  </br>
  ${linkText}
  `;
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    auth: {
      user: "node_1234_1234@outlook.com", // generated ethereal user
      pass: "ettHemligtLosen123", // generated ethereal password
    },
  });

  // send mail with defined transport object
  const options = {
    from: "node_1234_1234@outlook.com",
    to: user.email, // list of receivers
    subject: "Notis ang prenumeration", // Subject line
    html: output, // html body
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(info.response);
    console.log("mail skickat till: ", options.to);
  });
}

module.exports = {
  sendMail,
};
