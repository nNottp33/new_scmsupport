const router = require("express").Router();
const userRouter = require("./user.router");
// const adminRouter = require("./admin.router");

const filters = require("../../middlewares/auth");

router.use("/user", filters.AuthUser, userRouter);
// router.use("/admin", adminRouter);

module.exports = router;
