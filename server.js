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
const socketCtrl = require("./src/controllers/v1/socket.controller");
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

// connection to socket io
io.on('connection', (socket) => {
  // logger when have user connection
  logger.info(chalk.bold.green('Connecting to socket!'));

  // get (emit) events name comment-ticket from client
  socket.on('comment-ticket', async (msg) => {

    let { role, u_id, u_name, txt_msg, ticketId } = msg;

    let commentServer = {
      type: 1,
      u_id: u_id,
      u_name: u_name,
      txt_msg: txt_msg,
      date_mes: moment.tz('Asia/Bangkok').unix(),
      ticket_id: ticketId,
      attach_file: null
    }

    try {
      await conKnex.insert(commentServer)
        .into('t_comment')
        .then(async function (mid) {
          commentServer.mid = mid[0];
          commentServer.role = role;

          // reply to client
          io.emit('comment-ticket', commentServer);
        });
    } catch (e) {
      logger.error(chalk.bold.red(e));
    }
  });
})

app.use((req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).render("pages/error");
});

server.listen(port || 3033, () =>
  logger.info(`${chalk.magenta("server is running on port")} ${chalk.blue.bold(
    port ? port : 3033,
  )}`)
);
