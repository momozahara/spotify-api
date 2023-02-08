require("dotenv").config();
const fetch = require("node-fetch");

fetch(`${process.env.ENDPOINT}/get`)
.then((response) => {
  return response.json();
})
.then((data) => {
  if (data.artists === undefined) {
    return console.log(data.name);
  }

  let baseString = "Track Name: \x1b[32m%s\x1b[0m By";

  data.artists.map((item) => {
    baseString += " \x1b[32m%s\x1b[0m,"
  });
  baseString = baseString.substring(0, baseString.length - 1);

  console.log(baseString, data.name, ...data.artists);
})