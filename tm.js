'use strict';

console.log ("Running in NODE_ENV=" + process.env.NODE_ENV);

console.log ("Test env variable=", process.env.HELLO);

const express = require('express');
var cookieSession = require('cookie-session');
var Grant = require('grant-express');
var cookieParser = require('cookie-parser');
var Purest = require('purest');
var compression = require('compression');
var Forecast = require('forecast.io');




// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


var habitat = require("habitat"),
    env = habitat.load('.env'),
    flickrOptions = env.get("FLICKR");

flickrOptions.host = appEnv.url;
// TODO fix this properly but need to strip off the HTTP or HTTPS.
if (flickrOptions.host.search("https") != -1 ) {
  flickrOptions.host = flickrOptions.host.replace ("https://", "");
}
if (flickrOptions.host.search("http") != -1 ) {
  flickrOptions.host = flickrOptions.host.replace ("http://", "");
}


console.log ("Loaded options:", flickrOptions);



var options = {
  APIKey: flickrOptions.forecast_api_key
},
forecast = new Forecast(options);



// Constants
const PORT = 8080;


// Load the Grant and Purest libraries used for auth and comms.
var grant = new Grant (
  {
    "server": {
    "protocol": flickrOptions.protocol,
    "host": flickrOptions.host,
    "callback": flickrOptions.callback,
    "transport": "querystring",
    "state": false   // Not needed for OAUTH1
    },
    "flickr": {
      "key": flickrOptions.api_key,
      "secret": flickrOptions.api_secret,
      "scope": [flickrOptions.permissions]
    }
  }
);

var flickr = new Purest({
  provider:'flickr',
  key: flickrOptions.api_key,
  secret: flickrOptions.api_secret}) ;







// App
const app = express();

//var cfmode = false ;

// A bit of a bodge but check if running in Cloud Foundry mode.
// It seems to run all the time but worth keeping in.
//process.argv.forEach(function (val, index, array) {
//  if (index == 2 && val == "cf") {
//    cfmode = true;
//  }
//});

// Map the public directory
app.use(express.static(__dirname + '/public'));


app.use(cookieSession({
  name: 'ftm-session-default',
  keys: [flickrOptions.session_secret1, flickrOptions.session_secret1]
}))



app.use(grant);
app.use(cookieParser());

// Add in some basic security middleware
var helmet = require('helmet');
app.use(helmet());

// Add in compresison to speed up the app generally
app.use(compression());


//******************************************************************************
//
// This route only exists in order to quickly test the Flickr API is working
//
//******************************************************************************
app.get('/flickr_test', function (req, res) {
  // call flickr.test.login
  flickr.get('?method=flickr.test.login', {
    oauth:{token: req.cookies.ftm.access_token, secret: req.cookies.ftm.access_secret},
    qs:{api_key:flickrOptions.api_key}
  },function (err, inres, body) {
    if (err) {
      res.end(JSON.stringify(err));
    } else {
      res.end(JSON.stringify(body));
    }
  });
});


//******************************************************************************
//
// The authentication call back once the call to the server is complete.
// All it does is store the access toke and secret in the cookie.
//
//******************************************************************************
app.get('/authcallback', function (req, res) {
  // TODO this should be one cookie storing an object.
  console.log("Logged on " + req.query.raw.username + " (" + req.query.raw.user_nsid + ")");
  var cookie_content = {};
  cookie_content = req.query;
  cookie_content.user_id = req.query.raw.user_nsid ;

  var expire_time = 5 * 365 * 24 * 3600000;  // 5 years
  res.cookie('ftm' , cookie_content, {maxAge : expire_time});

  res.redirect(flickrOptions.post_auth_redirect);
});


//******************************************************************************
//
// Logs out the user by deleting the session cookie.
//
//******************************************************************************
app.get('/logout', function(req,res){
  // TODO this should be one cookie storing an object.
  res.clearCookie('ftm');
  res.send('Logged out');
});


//******************************************************************************
//
// Run a search against Flickr.
//
//******************************************************************************
app.get('/photos', function (req, res) {

  // Check if the user is logged on.  If they are not then it will
  // initiate the oauth flow.
  if (!req.cookies.ftm) {
    res.end(JSON.stringify({"stat":"fail", "code":"999","message":"Not logged on"}));
    return;
  } else {
    // Refresh the cookie expiry.
    req.cookies.ftm.maxAge = 28 * 24 * 3600000; // 4 weeks
  }

  var params = {
    api_key: flickrOptions.api_key,
    user_id: req.cookies.ftm.user_id,
    privacy_filter: 1,
    extras: "date_taken, geo, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o"
  } ;

  flickr.get('?method=flickr.photos.search', {
    oauth:{token: req.cookies.ftm.access_token, secret: req.cookies.ftm.access_secret},
    qs:params
  },function (err, inres, body) {
    if (err) {
      res.end(JSON.stringify(err));
    } else {
      res.end(JSON.stringify(body));
    }
  });
});

//******************************************************************************
//
// Run a search against Flickr to find photos on a specific date
// Valid query params:  day, month, year, date
// NB: date needs to be in the format: "2016-04-14"
//
// example
// http://localhost:6004/photos/date?date=2016-03-28
//
//******************************************************************************
app.get('/photos/date', function (req, res) {

  // Check if the user is logged on.  If they are not then it will
  // initiate the oauth flow.
  if (!req.cookies.ftm) {
    res.end(JSON.stringify({"stat":"fail", "code":"999","message":"Not logged on"}));
    return;
  } else {
    // Refresh the cookie expiry.
    req.cookies.ftm.maxAge = 28 * 24 * 3600000; // 4 weeks
  }

  var params = {
    api_key: flickrOptions.api_key,
    user_id: req.cookies.ftm.user_id,
    privacy_filter: 1,
    extras: "date_taken, geo, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o",
    sort: "date-taken-asc"
  } ;

/*
  if (req.query.day && req.query.month && req.query.year) {
    var d = new Date (req.query.date);
    params.group_id = req.query.date;
  }
  */

  if (req.query.date) {
    var d = new Date (req.query.date);

    // Get today
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = d.getDate().toString();
    var thedate = yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding

    var today = thedate + " 00:00:00";
    var tomorrow = thedate + " 23:59:59";

    params.min_taken_date = today;
    params.max_taken_date = tomorrow;
  }



  flickr.get('?method=flickr.photos.search', {
    oauth:{token: req.cookies.ftm.access_token, secret: req.cookies.ftm.access_secret},
    qs:params
  },function (err, inres, body) {
    if (err) {
      res.end(JSON.stringify(err));
    } else {
      body.year=yyyy;
      res.end(JSON.stringify(body));
    }
  });
});






//******************************************************************************
//
// Run a search against Flickr to get the oldest photo in the account
// Example:
// http://localhost:6004/photos/oldest
//
//******************************************************************************
app.get('/photos/oldest', function (req, res) {

  // Check if the user is logged on.  If they are not then it will
  // initiate the oauth flow.
  if (!req.cookies.ftm) {
    res.end(JSON.stringify({"stat":"fail", "code":"999","message":"Not logged on"}));
    return;
  } else {
    // Refresh the cookie expiry.
    req.cookies.ftm.maxAge = 28 * 24 * 3600000; // 4 weeks
  }

  var params = {
    api_key: flickrOptions.api_key,
    user_id: req.cookies.ftm.user_id,
    privacy_filter: 1,
    extras: "date_taken, geo",
    sort: "date-taken-asc",
    per_page: "1"
  } ;


  flickr.get('?method=flickr.photos.search', {
    oauth:{token: req.cookies.ftm.access_token, secret: req.cookies.ftm.access_secret},
    qs:params
  },function (err, inres, body) {
    if (err) {
      res.end(JSON.stringify(err));
    } else {
      res.end(JSON.stringify(body));
    }
  });
});


//******************************************************************************
//
// Run a search against Flickr to get the text for the location.
// No authenticaton required
// Example:
// http://localhost:6004/place/FphPyURWU7ux6h4
//
//******************************************************************************
app.get('/place/:place_id', function (req, res) {

    var params = {
      api_key: flickrOptions.api_key,
      place_id: req.params.place_id
    } ;

    flickr.get('?method=flickr.places.getInfo', {
      oauth:{token: req.cookies.ftm.access_token, secret: req.cookies.ftm.access_secret},
      qs:params
    },function (err, inres, body) {
      if (err) {
        res.end(JSON.stringify(err));
      } else {
        res.end(JSON.stringify(body));
      }
    });

});



//******************************************************************************
//
// Run a search against Forecase.io to get the oldest photo in the account
// Example:
// http://localhost:6004/weather/41.901837/12.454934/2014-04-12%2014:11:24
// (Weather in rome)
//
//******************************************************************************
app.get('/weather/:lat/:long/:time', function (req, res) {

  var time = new Date(req.params.time);

  var opt = {
    exclude: 'minutely,hourly,daily,alerts,flags',
    units: 'uk2'
  };

  var timesecs = Number(time) / 1000;

//  forecast.getAtTime(req.params.lat, req.params.long, time, opt, function (err, inres, body) {
//  forecast.get(req.params.lat, req.params.long, opt, function (err, inres, body) {
  forecast.getAtTime(req.params.lat, req.params.long, timesecs, opt, function (err, inres, body) {
    if (err) {
      res.end(JSON.stringify(err));
    } else {
      res.end(JSON.stringify(body));
    }
  });
});





  // start server on the specified port and binding host
  app.listen(appEnv.port, '0.0.0.0', function() {

  // print a message when the server starts listening
  console.log("Flickr Time Machine server starting on " + appEnv.url);
});
