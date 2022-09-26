const adminRouter = require("express").Router();
const adminController = require("../../controllers/v1/admin.controller");

// methods GET
adminRouter.get("/support/scm", adminController.AdminThread);

// methods POST


module.exports = adminRouter;
