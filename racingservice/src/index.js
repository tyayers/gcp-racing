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

app.get('/leaderboard/users', async (req, res) => {

  var results = {
    users: []
  };

  db.collection("gcp-racing").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshotsd
        console.log(doc.id, " => ", doc.data());
        var team = doc.data();

        results.users = results.users.concat(team.users);
    });
  
    results.users.sort(function(x, y) {
      return x.duration - y.duration;
    });

    res.send(results);
  });
});


app.get('/leaderboard/teams', async (req, res) => {

  var results = {
    teams: []
  };

  db.collection("gcp-racing").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshotsd
        console.log(doc.id, " => ", doc.data());
        var team = doc.data();

        team.users.sort(function(x, y) {
          return x.duration - y.duration;
        });

        var totalDuration = 0;
        team.users.forEach(user => {
          totalDuration += user.duration;
        });

        var newTeam = {
          team: doc.id
        }

        if (team.users.length > 0) {
          newTeam.fastestUser = team.users[0].user;
          newTeam.fastestDuraction = team.users[0].duration;
          newTeam.fastestDurationString = team.users[0].durationString;
          newTeam.averageDuration = totalDuration / team.users.length;
        }

        results["teams"].push(newTeam);
    });
  
    res.send(results);
  });
});

app.get('/leaderboard/teams/:team', async (req, res) => {

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
    var results = {};
    results[req.params.team] = teamData.users;

    res.send(results);
  }
});

app.post('/leaderboard/teams/:team', async (req, res) => {

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
