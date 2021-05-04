const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// defining the Express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(express.json());

// enabling CORS for all requests
app.use(cors());

var users = [];

// defining an endpoint to return all ads
app.get('/leaderboard/results', (req, res) => {
  users.sort(function(x, y) {
    return x.duration - y.duration;
  });

  res.send({
    "results": users
  });
});

app.post('/leaderboard/results', (req, res) => {
  users.push(req.body);
  res.sendStatus(201);
});

// starting the server
app.listen(8080, () => {
  console.log('listening on port 8080');
});
