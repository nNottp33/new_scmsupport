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

// custom modules
const { port } = require("./src/configs/config");
const routes = require("./src/routes/v1/route");
const { CheckUser } = require("./src/middlewares/middleware");
const randomString = require("./src/services/string.service");
const logger = require("./src/configs/logger");
const conKnex = require("./src/configs/db");
const socketCtrl = require("./src/controllers/v1/socket.controller");

// create socket io server instance
const io = require("socket.io")(server);

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

// server running
server.listen(port || 3033, () =>
  logger.info(`${chalk.magenta("server is running on port")} ${chalk.blue.bold(
    port ? port : 3033,
  )}`)
);


// connection to socket has namespace /thread
io.of('/thread').on('connection', (socket) => {
  // logger when have user connection
  logger.info(chalk.bold.green('Connected to socket!'));

  // join group post
  socket.on("join-post", ({ name, room }, callBack) => {
    // set data to group post
    const { post, error } = socketCtrl.AddUserToRoom({ id: socket.id, name, room });
    // when error return error
    if (error) return callBack(error);


    // set join group post
    socket.join(post.room);
    logger.info(chalk.bold.magenta(`${post.name} ${chalk.blue('Joined')} post ${post.room}`));

    // get event when user comment on post
    socket.on('comment', (msg) => {
      io.of('/thread').to(post.room).emit('comment', msg)
    })

    // when have no error return null
    callBack(null);
  });

  // when users leave post
  socket.on("disconnect", () => {
    // remove user data from group post
    const user = socketCtrl.RemoveFromRoom(socket.id);
    logger.info(chalk.bold.blackBright(`Leave post`));
  });
})