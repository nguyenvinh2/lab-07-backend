'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();

app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(express.static('./'));
app.get('/',(request,response) => {
  response.status(200).send('Connected!');
});

app.get('/location',(request,response) => {
  try {
    const location = require('./data/geo.json');
    const res = parserExplorer(location,request);
    response.send(res);
  } catch(err) {
    handleError(err, response);
  }
});

app.get('/weather', weatherApp);

function weatherApp(req, res) {
  const darkSkyUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;
  console.log(darkSkyUrl);
  return superagent.get(darkSkyUrl)
    .then( result => {
      const weatherSummaries = result.body.daily.data.map( day => {
        return new Weather(day);
      });
      res.send(weatherSummaries);
    })
    .catch( error => handleError(error, res));
}


function handleError(err, res) {
  if (res) res.status(500).send('Internal 500 error!');
}

const parserExplorer = (location, req) => {
  const loc = new Location(req.query.data, location.results[0].formatted_address, location.results[0].geometry.location.lat, location.results[0].geometry.location.lng);
  return loc;
};

function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
  this.created_at = Date.now();
}

function Location(query, name, lat, lon) {
  this.search_query = query;
  this.formatted_query = name;
  this.latitude = lat;
  this.longitude = lon;
}


app.listen(PORT, () => console.log(`Listening on ${PORT}`));
