  angular.module('flickrTimeMachineApp', ['ngAnimate', 'ngCookies']);
  angular.module('flickrTimeMachineApp').controller('FlickrTimeMachineController', function($scope, $location, $timeout, $http, $q, $window, $sce, $cookies){



    const MONTHNAMES = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const SHORTWEEKNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
      "Saturday", "Sunday"
    ];

    const WEATHERMAP = [ //see what I did there?!
        {forecast:"clear-day", icon:"wi-day-sunny"},
        {forecast:"clear-night", icon:"wi-night-clear"},
        {forecast:"rain", icon:"wi-rain"},
        {forecast:"snow", icon:"wi-snow"},
        {forecast:"sleet", icon:"wi-sleet"},
        {forecast:"wind", icon:"wi-strong-wind"},
        {forecast:"fog", icon:"wi-fog"},
        {forecast:"cloudy", icon:"wi-cloud"},
        {forecast:"partly-cloudy-day", icon:"wi-day-cloudy"},
        {forecast:"partly-cloudy-night", icon:"wi-night-cloudy"}
    ];


    var weatherIconLookup = [];
    for (i = 0; i < WEATHERMAP.length; i++) {
      weatherIconLookup[WEATHERMAP[i].forecast] = WEATHERMAP[i].icon;
    }

    $scope.details = [];
    $scope.weather = [];
    $scope.loc = [];

    var textparam = $location.path();
    textparam = textparam.replace('/', '');
    console.log (textparam);
    if (textparam) {
      $scope.today = new Date(textparam);
    } else {
      $scope.today = new Date();
    }



    fetch();


    //******************************************************************************
    //
    // Gets the base URL from the browser of where this app is running.
    //
    //******************************************************************************
    function GetBaseURL () {
      // Get it from the browser URL.
      var url = $location.protocol()+ "://" + $location.host() + ":" + $location.port();
      return url;
    }

    //******************************************************************************
    //
    // Creates a query string.  Takes an object and returns a querystring
    // e.g.
    // var obj = {name:"Fred", city:"Bedrock"};
    // var query = serialise (obj);
    // console.log (query);
    //
    // Returns: name=Fred&city=Bedrock
    //
    //******************************************************************************
    function serialise (obj) {
      var str = [];
      for(var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }


    //******************************************************************************
    //
    // Create a heading string to say how many years ago this year was.
    // Note that it is attached the the $scope so that it is callable fro
    // the angular code.
    //
    //******************************************************************************
    $scope.getTodayString = function () {

      return $scope.today.getDate() + " " + MONTHNAMES[$scope.today.getMonth()];
    }

    //******************************************************************************
    //
    // Create a heading string to say how many years ago this year was.
    // Note that it is attached the the $scope so that it is callable fro
    // the angular code.
    //
    //******************************************************************************
    $scope.getYearsAgo = function (year) {
      var diff = new Date().getFullYear() - year;
      var years = "years";
      if (diff == 1) {
        years = "year"
      }

      return diff +" " + years + " ago in " + year ;
    }

    //******************************************************************************
    //
    // Create a heading string to say how many years ago this year was.
    // Note that it is attached the the $scope so that it is callable fro
    // the angular code.
    //
    //******************************************************************************
    $scope.getDayofWeek = function (year) {
      var histdate = $scope.today;
      histdate.setFullYear(year);


      return SHORTWEEKNAMES[histdate.getDay()];
    }

    //******************************************************************************
    //
    // Returns a text string of the location based on the lat/long.
    //
    //******************************************************************************
    getLocationDetails = function (photo) {
      if (photo.latitude != 0 && photo.longitude != 0) {
        var url = GetBaseURL () + "/place/" + photo.place_id;
        console.log(url);

        $http.get(url).then(function(response){
          $scope.loc[photo.id] = response.data;
        });
      }
    }

    //******************************************************************************
    //
    // Returns a text string of the weather when the photo was taken.
    //
    //******************************************************************************
    getWeatherDetails = function (photo) {

      //  https://api.forecast.io/forecast/<FLICKR_DARKSKY_API>/41.901837,12.454934,2014-04-15T08:53:43?units=uk2&exclude=minutely,hourly,daily,alerts,flags
      // Need to create a server proxy to hide the API key
      //
      // This will return a JSON string.
      // Weather icon text = response.data.currently.icon
      // Temp = response.data.apparentTemperature
      // To display the result then populate some sort of array with the result which the HTML code can reference.
      // Just use photo ID as the reference:   photo.id
      //  Need to call the Weather API:
      // http://localhost:6004/weather/photo.latitude/photo.longitude/photo.datetaken

      if (photo.latitude != 0 && photo.longitude != 0) {
        var url = GetBaseURL () + "/weather/" + photo.latitude + "/" + photo.longitude + "/" + photo.datetaken;
        console.log(url);

        $http.get(url).then(function(response){
          $scope.weather[photo.id] = { icon: weatherIconLookup[response.data.currently.icon], temp: Math.round(response.data.currently.apparentTemperature) + "°C"};
        });

      }

    }





    //******************************************************************************
    //
    // Does the main lookup on the server.
    //
    //******************************************************************************
    function fetch() {


      // First things first find the year of the oldest photo in the account
      var url = GetBaseURL() + "/photos/oldest";
      $http.get(url).then(function(response){
        console.log("Get:", url, response.data);

        // Check logged on.
        if (response.data.stat == "fail" && response.data.code == "999") {
          // Need to log on the user
          $window.location.href = GetBaseURL() + "/connect/flickr";
        }


        // Just get the date and ignore the time part.
        // Split on the first dash as the year comes first
        var oldest_year = response.data.photos.photo[0].datetaken.split('-')[0];

        var today = $scope.today;
        var current_year = today.getFullYear();

        // Now make a call to Flickr for every year between now and then
        for (yearIdx = current_year; yearIdx >= oldest_year; yearIdx--) {

          var yyyy = yearIdx;
          var mm = (today.getMonth()+1).toString(); // getMonth() is zero-based
          var dd  = today.getDate().toString();
          var thedate = yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding

          var annualURL = GetBaseURL() + "/photos/date?date=" + thedate;

          // Make the call to get photos for this date.
          $http.get(annualURL).then(function(annresponse){
            console.log("Get:", annualURL, annresponse.data);
            if (annresponse.data.photos.total > 0)
            {
              $scope.details.push(annresponse.data)


              // Get the weather & location details
              for (i=0; i<annresponse.data.photos.photo.length;i++)
              {
                getWeatherDetails (annresponse.data.photos.photo[i]);
                getLocationDetails (annresponse.data.photos.photo[i]);
              }


            }
            console.log(annresponse.data.year, $scope.details);
          });

        }
      });
    }
  });
