var app = angular.module('flickrTimeMachineApp', ['ngAnimate', 'ngCookies', 'sticky']);
app.controller('FlickrTimeMachineController', function($scope, $location, $timeout, $http, $q, $window, $sce, $cookies){




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

    const COLOURS = [
      "#b320ff",
      "#20a8ff",
      "#ffb320",
      "#ff2020"
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

    // Test data for when offline with no network!
    /*
    $scope.details = [
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Windmill","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"}]},"stat":"ok","year":"2015"},
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Under Clouds","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5675538032","owner":"32563803@N00","secret":"7dfddc4308","server":"5150","farm":6,"title":"Field at Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:13:05","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5150/5675538032_7dfddc4308_z.jpg","height_z":"427","width_z":"640"},{"id":"5680047064","owner":"32563803@N00","secret":"ca258687d6","server":"5230","farm":6,"title":"Flower in Focus","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:16:27","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5679514517","owner":"32563803@N00","secret":"0ec65f6db9","server":"5221","farm":6,"title":"Field with Sunburst","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:18:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5221/5679514517_0ec65f6db9_z.jpg","height_z":"427","width_z":"640"},{"id":"5680122194","owner":"32563803@N00","secret":"f43a407bb9","server":"5028","farm":6,"title":"Pathway Through the Fields","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:24:06","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5680122194_f43a407bb9_z.jpg","height_z":"427","width_z":"640"},{"id":"5679566815","owner":"32563803@N00","secret":"25580b51cf","server":"5028","farm":6,"title":"Field After Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:26:51","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5679566815_25580b51cf_z.jpg","height_z":"427","width_z":"640"},{"id":"5679582035","owner":"32563803@N00","secret":"f37778694b","server":"5067","farm":6,"title":"Field Panorama","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:46:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5067/5679582035_f37778694b_z.jpg","height_z":"153","width_z":"640"}]},"stat":"ok","year":"2014"},
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Under Clouds","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5675538032","owner":"32563803@N00","secret":"7dfddc4308","server":"5150","farm":6,"title":"Field at Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:13:05","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5150/5675538032_7dfddc4308_z.jpg","height_z":"427","width_z":"640"},{"id":"5680047064","owner":"32563803@N00","secret":"ca258687d6","server":"5230","farm":6,"title":"Flower in Focus","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:16:27","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5679514517","owner":"32563803@N00","secret":"0ec65f6db9","server":"5221","farm":6,"title":"Field with Sunburst","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:18:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5221/5679514517_0ec65f6db9_z.jpg","height_z":"427","width_z":"640"},{"id":"5680122194","owner":"32563803@N00","secret":"f43a407bb9","server":"5028","farm":6,"title":"Pathway Through the Fields","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:24:06","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5680122194_f43a407bb9_z.jpg","height_z":"427","width_z":"640"},{"id":"5679566815","owner":"32563803@N00","secret":"25580b51cf","server":"5028","farm":6,"title":"Field After Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:26:51","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5679566815_25580b51cf_z.jpg","height_z":"427","width_z":"640"},{"id":"5679582035","owner":"32563803@N00","secret":"f37778694b","server":"5067","farm":6,"title":"Field Panorama","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:46:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5067/5679582035_f37778694b_z.jpg","height_z":"153","width_z":"640"}]},"stat":"ok","year":"2013"},
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Under Clouds","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5675538032","owner":"32563803@N00","secret":"7dfddc4308","server":"5150","farm":6,"title":"Field at Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:13:05","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5150/5675538032_7dfddc4308_z.jpg","height_z":"427","width_z":"640"},{"id":"5680047064","owner":"32563803@N00","secret":"ca258687d6","server":"5230","farm":6,"title":"Flower in Focus","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:16:27","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5679514517","owner":"32563803@N00","secret":"0ec65f6db9","server":"5221","farm":6,"title":"Field with Sunburst","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:18:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5221/5679514517_0ec65f6db9_z.jpg","height_z":"427","width_z":"640"},{"id":"5680122194","owner":"32563803@N00","secret":"f43a407bb9","server":"5028","farm":6,"title":"Pathway Through the Fields","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:24:06","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5680122194_f43a407bb9_z.jpg","height_z":"427","width_z":"640"},{"id":"5679566815","owner":"32563803@N00","secret":"25580b51cf","server":"5028","farm":6,"title":"Field After Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:26:51","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5679566815_25580b51cf_z.jpg","height_z":"427","width_z":"640"},{"id":"5679582035","owner":"32563803@N00","secret":"f37778694b","server":"5067","farm":6,"title":"Field Panorama","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:46:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5067/5679582035_f37778694b_z.jpg","height_z":"153","width_z":"640"}]},"stat":"ok","year":"2012"},
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Under Clouds","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5675538032","owner":"32563803@N00","secret":"7dfddc4308","server":"5150","farm":6,"title":"Field at Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:13:05","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5150/5675538032_7dfddc4308_z.jpg","height_z":"427","width_z":"640"},{"id":"5680047064","owner":"32563803@N00","secret":"ca258687d6","server":"5230","farm":6,"title":"Flower in Focus","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:16:27","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5679514517","owner":"32563803@N00","secret":"0ec65f6db9","server":"5221","farm":6,"title":"Field with Sunburst","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:18:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5221/5679514517_0ec65f6db9_z.jpg","height_z":"427","width_z":"640"},{"id":"5680122194","owner":"32563803@N00","secret":"f43a407bb9","server":"5028","farm":6,"title":"Pathway Through the Fields","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:24:06","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5680122194_f43a407bb9_z.jpg","height_z":"427","width_z":"640"},{"id":"5679566815","owner":"32563803@N00","secret":"25580b51cf","server":"5028","farm":6,"title":"Field After Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:26:51","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5679566815_25580b51cf_z.jpg","height_z":"427","width_z":"640"},{"id":"5679582035","owner":"32563803@N00","secret":"f37778694b","server":"5067","farm":6,"title":"Field Panorama","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:46:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5067/5679582035_f37778694b_z.jpg","height_z":"153","width_z":"640"}]},"stat":"ok","year":"2011"},
      {"photos":{"page":1,"pages":1,"perpage":100,"total":"7","photo":[{"id":"5670430300","owner":"32563803@N00","secret":"769f271aa8","server":"5309","farm":6,"title":"Under Clouds","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 17:48:17","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5675538032","owner":"32563803@N00","secret":"7dfddc4308","server":"5150","farm":6,"title":"Field at Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:13:05","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5150/5675538032_7dfddc4308_z.jpg","height_z":"427","width_z":"640"},{"id":"5680047064","owner":"32563803@N00","secret":"ca258687d6","server":"5230","farm":6,"title":"Flower in Focus","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:16:27","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_l":"test_img.jpg","height_z":"427","width_z":"640"},{"id":"5679514517","owner":"32563803@N00","secret":"0ec65f6db9","server":"5221","farm":6,"title":"Field with Sunburst","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:18:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5221/5679514517_0ec65f6db9_z.jpg","height_z":"427","width_z":"640"},{"id":"5680122194","owner":"32563803@N00","secret":"f43a407bb9","server":"5028","farm":6,"title":"Pathway Through the Fields","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:24:06","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5680122194_f43a407bb9_z.jpg","height_z":"427","width_z":"640"},{"id":"5679566815","owner":"32563803@N00","secret":"25580b51cf","server":"5028","farm":6,"title":"Field After Sunset","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:26:51","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5028/5679566815_25580b51cf_z.jpg","height_z":"427","width_z":"640"},{"id":"5679582035","owner":"32563803@N00","secret":"f37778694b","server":"5067","farm":6,"title":"Field Panorama","ispublic":1,"isfriend":0,"isfamily":0,"datetaken":"2011-04-15 18:46:47","datetakengranularity":"0","datetakenunknown":0,"latitude":"51.220459","longitude":"-0.539451","accuracy":"16","context":0,"place_id":"p.N47Y5TU7PPPA","woeid":"21990","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_z":"https://farm6.staticflickr.com/5067/5679582035_f37778694b_z.jpg","height_z":"153","width_z":"640"}]},"stat":"ok","year":"2010"}
    ];
    */
    // End test data



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
    // Returns a colour for the banner.  Based on the index.
    //
    //******************************************************************************
    $scope.getBannerColour = function (index) {
      return COLOURS[index % COLOURS.length];
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

/*
  //****************************************************************************
  //
  // This is the scroll checking directive to make the day banners stick
  // to the top of the screen.
  //
  // The banners are unique with the class ID of "year-"
  //
  // Check out how this person did it
  // http://codepen.io/chrissp26/pen/gBrdo
  //
  //****************************************************************************
  app.directive('setClassWhenAtTop', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var topClass = attrs.setClassWhenAtTop,
        offsetTop = element.prop('offsetTop');

        $win.on('scroll', function (e) {
          if ($window.pageYOffset >= offsetTop-30) { // TODO I don't like this being hard coded to 30, it should get the height from the code
            element.addClass(topClass);
          } else {
            element.removeClass(topClass);
          }
        });
      }
    };
  });

  function getElementOffset(element)
  {
    var de = document.documentElement;
    var box = element.getBoundingClientRect();
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left };
  }*/
