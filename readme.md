## Flickr Time Machine
A simple angular app that will show you the photos that you took on this day in history.  Written in Node.js and currently hosted on IBM Bluemix:
[flickrtimemachine.mybluemix.net](http://flickrtimemachine.mybluemix.net)

## Bluemix Upload Details
The steps required to logon to Bluemix are:

1. `bluemix api https://api.ng.bluemix.net`
2. `bluemix login -u <email> -o <email> -s dev`

Then just use `cf push` to upload to Bluemix.
