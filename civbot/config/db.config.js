module.exports = {
    HOST: "localhost",
    USER: "postgres",
    dialect: "postgres",
    DB_SCHEMA:'civbot',
    DB_USER:'postgres',
    DB_HOST:'postgres',
    DB_SSL:false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };