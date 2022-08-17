const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const chalk = require("chalk");
const { port } = require("./src/configs/config");
const routes = require("./src/routes/v1/route");
const { CheckUser } = require("./src/middlewares/middleware");

const app = express();

// enable cors
app.use(cors());
app.options("*", cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// set public assets
app.use("/public", express.static(__dirname + "../public/assets"));

// middleware
app.use(CheckUser);

// set view
app.set("/views", path.join(__dirname, "../public/pages"));

// v1 api routes
app.use("/api/v1", routes);

// send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   return res.status(400).render("../pages/template/error/404.ejs");
// });

app.listen(port || 3033, () =>
  console.log(
    `${chalk.magenta("server is running on port")} ${chalk.blue.bold(port)}`,
  ),
);
