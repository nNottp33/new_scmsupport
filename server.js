const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const chalk = require("chalk");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const httpStatus = require("http-status");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const fs = require("fs");

// create http server instance
const server = require('http').Server(app);

// create socket io server instance
const io = require("socket.io")(server);

// custom modules
const { port } = require("./src/configs/config");
const routes = require("./src/routes/v1/route");
const { CheckUser } = require("./src/middlewares/middleware");
const randomString = require("./src/services/string.service");
const logger = require("./src/configs/logger");
const conKnex = require("./src/configs/db");

// enable cors
app.use(cors());
app.options("*", cors());

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: randomString.RandomString(20),
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  }),
);

// parse json
app.use(express.json());

// parse urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

// set public assets
app.use("/public", express.static(path.join(__dirname, "/public/")));
app.use(
  "/assets",
  express.static(path.join(__dirname, "/public/assets/")),
);

// set view
app.set("views", "./src/views");
app.set("view engine", "ejs");

// middleware
app.use(CheckUser);

// session cookie
app.use(cookieParser());

// v1 api routes
app.use("/", routes);

app.use((req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).render("pages/error");
});

server.listen(port || 3033, () =>
  logger.info(`${chalk.magenta("server is running on port")} ${chalk.blue.bold(
    port ? port : 3033,
  )}`)
);

// connection to socket io
io.on('connection', (socket) => {
  // logger when have user connection
  logger.info(chalk.bold.green('Connecting to socket!'));

  console.log(socket);
  // logger.info(chalk.bold.magenta(`ROOM: ${socket.id}`));

  // get (emit) events name comment-ticket from client
  socket.on('comment-ticket', async (msg) => {
    io.to(socket.id).emit('comment-ticket', msg)
  });
})