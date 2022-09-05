const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `../../app.env`),
});

module.exports = {
  node_env: process.env.NODE_ENV,
  baseUrl: process.env.BASEURL,
  port: process.env.PORT,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbname: process.env.DB_NAME,
  },
};
