#!/bin/bash
# A script to automate blue/green deplyoments on Bluemix

RED='\033[0;31m'
NC='\033[0m' # No Color

HOST='mybluemix.net'

if [ $# -eq 0 ]
then
  echo "$0 usage: $0 [bluemixappname]"

else

  # Check the app exists
  if [ `cf apps | grep $1 | wc -l` -eq 0 ]
  then
    echo "$1 is not a bluemix app!"
    exit
  else
    echo -e "${RED}Step 1: Rename existing${NC}"
    cf rename $1 $1-old

    echo -e "${RED}Step 2: Add the new service${NC}"
    cf push $1-new -n $1-new --no-start

    if [ -e ./local/set-envs.sh ]
    then
      echo -e "${RED}Step 2a: Setting environment variables${NC}"
      ./local/set-envs.sh $1-new
    else
      echo -e "${RED}Step 2a: No environment variables found so skipping${NC}"
    fi

    cf start $1-new

    echo -e "${RED}Step 3: Check new service is RUNNING${NC}"
    HTTPRESP=`curl --write-out "%{http_code}\n" --silent --output /dev/null "http://$1-new.$HOST"`

    if [ $HTTPRESP -eq 404 ]
    then
      echo -e "${RED}$1-new is not running.  Exiting!${NC}"
      exit
    else

      if [ $# -eq 2 ] && [ $2 == "stop" ]
      then
        echo -e "${RED}Stopping after deploy, check http://$1-new.mybluemix.net for new service${NC}"
        cf apps
        exit
      else
        echo -e "${RED}Step 4: Create new network route${NC}"
        cf map-route $1-new $HOST -n $1
        echo Now new app is load balanced with old

        echo -e "${RED}Step 5: Remove the old app from the route${NC}"
        cf unmap-route $1-old $HOST -n $1
        echo Now new app is 100% live

        echo -e "${RED}Step 6: Remove the temporary route${NC}"
        cf unmap-route $1-new $HOST -n $1-new

        echo -e "${RED}Step 7: Delete the old app${NC}"
        cf delete $1-old -f

        echo -e "${RED}Step 8: Rename the app to the main app${NC}"
        cf rename $1-new $1

        echo -e "${RED}DONE!${NC}"
        cf apps
      fi
    fi
  fi
fi
