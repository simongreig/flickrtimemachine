#Blue/Green

1. First of all rename the old app
 `cf rename flickrtimemachine ftm-old`

2. Then push the updated version with a different route (nftm is the new name)
 `cf push nftm -n nftm`

 `ftm-old => flickrtimemachine.bluemix.net`
 `nftm => nftm.bluemix.net`


*CHECK THE APP IS RUNNING*
curl -I -s http://flickrtimemachine.mybluemix.net | grep HTTP | cut -d' ' -f2
check it returns != 404.


3. Map the route across - *TODO* check if both old and new are called when sharing the route
Answer it balances across both.

`cf map-route nftm mybluemix.net -n flickrtimemachine`

ftm-old => flickrtimemachine.bluemix.net
nftm => nftm.bluemix.net, flickrtimemachine.bluemix.net

4. Remove the old app from the route

 `cf unmap-route ftm-old mybluemix.net -n flickrtimemachine`

 ftm-old =>
 nftm => nftm.bluemix.net, flickrtimemachine.bluemix.net


5. Remove the temp route

`cf unmap-route nftm mybluemix.net -n nftm`


ftm-old =>
nftm => flickrtimemachine.bluemix.net


Now the service is swapped over! Time to tidy up.


5. Delete the old app

cf delete ftm-old -f


6. Rename the new app

`cf rename nftm flickrtimemachine`

DONE!
