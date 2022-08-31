const userRouter = require("express").Router();
const userController = require("../../controllers/v1/user.controller");

userRouter.get("/support/scm", userController.UserThread);
userRouter.get("/support/scm/thread/detail", userController.DetailThread);
userRouter.post("/add/new/ticket", userController.NewTicket);

module.exports = userRouter;
