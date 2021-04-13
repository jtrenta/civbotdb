module.exports = app => {
var express = require('express');
var router = express.Router();
const indexController = require("../controllers/index.controller.js");

  //For now just gets a default Express page
  router.get('/', indexController.base);

  //Hook to allow external trigger for game turn reminders
  //TODO: Change to internal timer
  router.get('/CheckForTurnReminders', indexController.checkForTurnReminders);

  //Hook for JSON message from Civ servers
  router.post('/',indexController.processMessage);

  app.use('/', router);
}
