const pino = require('pino');
const logger =  global.DEVFLAG ? 
                pino({base: null, level: 'info', prettyPrint: {colorize: true, translateTime: 'SYS:mm-dd HH:MM:ss'} })
                : pino({base: null, level: 'warn' });
                
//logger.info('log.js - test successful');
module.exports = logger;
