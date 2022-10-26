const router = require("express").Router();
const userRouter = require("./user.router");
const adminRouter = require("./admin.router");
const globalRouter = require("./global.router");
const filters = require("../../middlewares/auth");

router.use("/", globalRouter);
router.use("/user", filters.AuthUser, userRouter);
router.use("/admin", filters.AuthAdmin, adminRouter);

module.exports = router;
