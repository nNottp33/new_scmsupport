const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const chalk = require("chalk");
const { port } = require("./src/configs/config");
const routes = require("./src/routes/v1/route");
const { CheckUser, CheckErr } = require("./src/middlewares/middleware");

const app = express();

// enable cors
app.use(cors());
app.options("*", cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// set public assets
app.use("/public", express.static(path.join(__dirname, "/public/")));
app.use(
  "/images",
  express.static(path.join(__dirname, "/public/assets/images/")),
);
app.use("/css", express.static(path.join(__dirname, "/public/assets/css/")));

// set view
app.set("views", "./src/views");
app.set("view engine", "ejs");

// middleware
app.use(CheckUser);

// v1 api routes
app.use("/api/v1", routes);

app.listen(port || 3033, () =>
  console.log(
    `${chalk.magenta("server is running on port")} ${chalk.blue.bold(port)}`,
  ),
);
