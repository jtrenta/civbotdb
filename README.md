# CivbotDB

10/20/2020
This is a ground up rewrite of my previous project - Civbot.  Civilization 6 play by mail games can be configured to send out turn notifications via http.  I created a node.js discord bot to receive these turn notifications and in turn send messages to configured Discord channels.

This version will replace the .json files that stored game and player data with a postgreSQL database.  It will be configured to run in a docker container for ease of use.  I will use a debug log package (pino) instead of trying to roll my own.  And I intend to keep the code well documented and clean.
