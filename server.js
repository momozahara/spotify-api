require("dotenv").config();
const open = require("open");
const fetch = require("node-fetch");
const { randomBytes } = require("crypto");
const express = require("express");
const app = express();
const port = process.env.PORT || 8888;

const baseUrl = `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${port}`
const auth = (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'));
let access_token;
let refresh_token;

app.get("/login", (req, res) => {
  var client_id = process.env.CLIENT_ID;
  var redirect_uri = `${baseUrl}/callback`;

  var state = randomBytes(16).toString("hex");
  var scope = 'user-read-playback-state';

  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=code';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  url += '&state=' + encodeURIComponent(state);

  res.redirect(url);
})

app.get("/callback", (req, res) => {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    getAccessToken(code);
    res.json({ status: 200 });
  }
})

app.get("/get", async (req, res) => {
  const response = await getPlayingState();
  res.json({ response: response });
})

app.get("/refresh", (req, res) => {
  refreshAccessToken();
  res.json({ status: 200 });
})

app.listen(port, () => {
  open(`${baseUrl}/login`);
});

function getAccessToken(code) {
  let headersList = {
    "Authorization": "Basic " + auth,
    "Content-Type": "application/x-www-form-urlencoded"
   }

  let bodyContent = "code=" + code;
  bodyContent += "&redirect_uri=" + `${baseUrl}/callback`;
  bodyContent += "&grant_type=authorization_code";

  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: bodyContent,
    headers: headersList
  })
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    access_token = data.access_token;
    refresh_token = data.refresh_token;
  });
}

async function getPlayingState() {
  let headersList = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + access_token
  }

  return await fetch("https://api.spotify.com/v1/me/player", {
    method: "GET",
    headers: headersList
  })
  .then((response) => {
    if (response.status === 204) {
      return "Currently Does Not Playing Any Track";
    }
    return response.json();
  })
  .then((data) => {
    if (data.is_playing === false) {
      return "Currently Does Not Playing Any Track";
    }
    return data.item.name;
  })
  .catch(async () => {
    await refreshAccessToken();
    return await getPlayingState();
  });
}

async function refreshAccessToken() {
  let headersList = {
    "Authorization": "Basic " + auth,
    "Content-Type": "application/x-www-form-urlencoded"
  }

  let bodyContent = "grant_type=refresh_token";
  bodyContent += "&refresh_token=" + refresh_token;

  await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: bodyContent,
    headers: headersList
  })
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    refresh_token = data.refresh_token;
  })
}