// bin/migrate.js

const db = require("../models");
db.sequelize.sync();
