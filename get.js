require("dotenv").config();
const fetch = require("node-fetch");

fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/get`)
.then((response) => {
  return response.json();
})
.then((data) => {
  console.log(`Track Name: \x1b[32m%s\x1b[0m`, data.response);
})