const adminRouter = require("express").Router();
const adminController = require("../../controllers/v1/admin.controller");

// methods GET
adminRouter.get("/support/scm", adminController.AdminThread);
adminRouter.get("/support/scm/thread/detail/:ticketid", adminController.DetailThread);
adminRouter.get("/report", adminController.ReportPage);

// methods POST
adminRouter.post("/report/result", adminController.GetReport);
adminRouter.post("/notification/count", adminController.CountNotification)
adminRouter.post("/notification", adminController.FetchedNotifications)

module.exports = adminRouter;
