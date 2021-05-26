const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('../key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// defining the Express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(express.json());

// enabling CORS for all requests
app.use(cors());

var users = [];

// defining an endpoint to return all ads
app.get('/leaderboard/results/:team', async (req, res) => {

  const teamRef = db.collection('gcp-racing').doc(req.params.team);
  const doc = await teamRef.get();
  if (!doc.exists) {
    console.log('No such document!');
    res.status(404);
  } else {
    var teamData = doc.data();

    teamData.users.sort(function(x, y) {
      return x.duration - y.duration;
    });

    res.send({
      "results": teamData.users
    });
  }  
});

app.post('/leaderboard/results/:team', async (req, res) => {

  const teamRef = db.collection("gcp-racing").doc(req.body.team);
  const doc = await teamRef.get();
  var teamData = {};

  if (!doc.exists) {
    console.log('No such team, creating..');
    teamData = {
      createdOn: (new Date).toISOString(),
      users: [ req.body ]
    }
  } else {
    teamData = doc.data();
    var foundUser = false;
    for(var i=0; i<teamData.users.length; i++) {
      var user = teamData.users[i];

      if (user.user == req.body.user) {
        foundUser = true;
        user.duration = req.body.duration;
        user.durationString = req.body.durationString;
        user.dateTime = (new Date).toISOString();
      }
   }

   if (!foundUser) {
     // add user
     req.body.dateTime = (new Date).toISOString();
     teamData.users.push(req.body);
   }
  }
  
  const fb_res = await db.collection('gcp-racing').doc(req.body.team).set(teamData);

  //users.push(req.body);
  res.sendStatus(201);
});

// starting the server
app.listen(8080, () => {
  console.log('listening on port 8080');
});
