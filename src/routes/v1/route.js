const router = require("express").Router();
const userController = require("../../controllers/v1/user.controller");

router.get("/support/scm", userController.CheckUser);

module.exports = router;
