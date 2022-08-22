const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const chalk = require("chalk");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const httpStatus = require("http-status");

const { port } = require("./src/configs/config");
const routes = require("./src/routes/v1/route");
const { CheckUser, CheckErr } = require("./src/middlewares/middleware");
const randomString = require("./src/services/string.service");

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

// session cookie
app.use(cookieParser());
app.use(
  sessions({
    secret: randomString.RandomString(30),
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
  }),
);

// v1 api routes
app.use("/", routes);

app.use((req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).render("pages/error");
});

app.listen(port || 3033, () =>
  console.log(
    `${chalk.magenta("server is running on port")} ${chalk.blue.bold(
      port ? port : 3033,
    )}`,
  ),
);
