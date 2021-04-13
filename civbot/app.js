require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const basicPino = require('pino');
const expressPino = require('express-pino-logger');
const basicPinologger = global.DEVFLAG ? basicPino({prettyPrint: {colorize: true, translateTime: 'SYS:mm-dd HH:MM:ss'} }) : basicPino({base: null, level: 'warn' }) ;
const expressApp = express();

const expressLogger = expressPino({basicPinologger});

expressApp.use(expressLogger);
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(cookieParser());
expressApp.use(express.static(path.join(__dirname, 'public')));

const db = require("./models");

if(global.DEVFLAG) {
    dbCreate = require("./database.create")
    db.sequelize.sync({ force : true } ).then(() => {
        console.log("Drop and re-sync db.");
        dbCreate.createDevDB();
    } );
} else {
    db.sequelize.sync();
}

module.exports = expressApp;
