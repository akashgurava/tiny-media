const express = require("express");
var app = express();

const TorrentSearchApi = require("torrent-search-api");
const ptt = require("parse-torrent-title");

const makeResponse = (status, reason, data) => {
  return {
    status,
    reason,
    data
  };
};

TorrentSearchApi.enableProvider('1337x');
TorrentSearchApi.enableProvider('Rarbg');

app.get("/", async (request, response) => {
  const query = request.query.query;
  if (query) {
    const category = request.query.category || "All";
    const limit = parseInt(request.query.limit) || 20;

    try {
      const results = await TorrentSearchApi.search(query, category, 1);
      const resultsDetailed = results.map(result => {
        const title = result.title;
        const data = ptt.parse(title);
        data.link = result.magnet;
        return Object.assign(result, data);
      });
      response.send(makeResponse("success", {}, resultsDetailed));
    } catch (error) {
      response.status(423);
      response.send(makeResponse("error", error, []));
    }
  } else {
    response.status(422);
    response.send(makeResponse("error", { info: "query is mandatory" }, []));
  }
});

app.listen(3000)