const userRouter = require("express").Router();
const userController = require("../../controllers/v1/user.controller");

userRouter.get("/support/scm", userController.UserThread);

module.exports = userRouter;
