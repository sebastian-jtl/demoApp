# Wawi dev demo app

This app is meant as a purely educational tool for jtl devs to play around with an app in the dev environment of our cloud hub (this is very hacked together, dont expect great code :P). I will try to give a quick and simple cookbook to start getting on baord with this as quickly as possible. If there are any questions contact me on teams (Sebastian Schreiber). Thanks goes out to Christian Krause who gave me his app (with a lot more stuff in it, but this is meant to be as small as possible) so i could rip it apart and learn. Btw it's a React frontend with a node/express backend.

## Step 1: Get your Wawi connected

First off you need a running install of the Wawi (i used the latest 1.10.11 build, should work with 1.11) and connect your JTL customer center account to it. You will also need a license for the RestAPI.

Once that is done you need to copy the appSettings.json from the _files folder to your C:\ProgramData\JTL-Software folder (this sets up all urls for the dev environment). After this you need to enable the beta feature 'JTL.Wawi.CloudConnected.UI' to be able to connect to the hub.

Then its time to connect to the hub (menu Admin->JTL-Cloud Verbindung) where you will be prompted to log in to the hub with your jtl email that you connected the Wawi to (ahh yeah, before you do that you should register on the dev hub first https://hub.dev.jtl-cloud.com/). If there is an issue where you dont get a login page but are already connected to the hub, just logout on the popup window, close all open dialog windows and try again.

Now its time to start the API server. For this start JTL-Administrator.exe from your install dir and create a new API server. Make sure you enable the cloudConnect option. From here you can also start and stop your server (make sure the command shell is not in edit mode after or the server wont respond). You should see a bunch of messages on api start that it did some websocket handshakes with the cloud. This means its ok. Some indicators in the wawi might still show red, but thats fine.

## Step 2: Register your app

In the dev hub head over to the partner portal and create a new app. You should use the provided manifest.json from the _files folder (or read the docs and make one yourself! https://developer.jtl-software.com/products/appregistration/manifest). After you submit the manifest you will get a clientId and secret. Make sure to write this down as you wont get the secret a second time without making a new app! Now in the hub head over to Administration->Apps and activate your newly created app. This should fail, after all its not running.

## Step 3: Start the app

You will need node installed on your system for all of this (and yarn installed). First you need to go to the backend folder and create an .env file with the same content as the .env.example file but fill in your clientId and secret. Never push this into version control. Then its time to install packages, build and run your backend and frontend (respectively in the backend and frontend folder):

   * yarn install
   * yarn build
   * npm run dev

Now everything should be running. At this point you can activate the app in the hub and it should work. Next you want to start the JTL ERP APP from your app dashboard (did i mention you need to activate that too with a running connected api server beforehand?).

## Step 4: Try stuff

With backend and frontend running in dev mode you can freely change the code or ui while its running and both will automagically reload. Contact me if things go wrong or i need to improve this manual.

## Notes

The cloud sdk is not yet publically available and is in the sdk folder. Once its a proper public package this make no more sense. The UI is barebones shadcn. I dit not play around with our component lib yet.