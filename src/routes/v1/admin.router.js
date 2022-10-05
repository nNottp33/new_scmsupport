const adminRouter = require("express").Router();
const adminController = require("../../controllers/v1/admin.controller");

// methods GET
adminRouter.get("/support/scm", adminController.AdminThread);
adminRouter.get("/support/scm/thread/detail/:ticketid", adminController.DetailThread);
adminRouter.get("/report", adminController.ReportPage);

// methods POST


module.exports = adminRouter;
