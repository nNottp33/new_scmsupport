const router = require("express").Router();
const userRouter = require("./user.router");
const adminRouter = require("./admin.router");

const globalController = require("../../controllers/v1/global.controller");

const filters = require("../../middlewares/auth");
// for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/files_upload')
    },
    filename: function (req, file, cb) {
        let fileName = Buffer.from(`${Date.now()}-${file.originalname}`, 'latin1').toString('utf8');
        cb(null, fileName)
    }
})

const upload = multer({ storage: storage })

router.use("/user", filters.AuthUser, userRouter);
router.use("/admin", filters.AuthAdmin, adminRouter);

// global routes
// post methods
router.post("/add/comment", upload.any('fileComment'), globalController.AddComment);

// put methods
router.put("/update/status", globalController.ChangeStatus);

// delete methods
router.delete("/delete/comment", globalController.DeleteComment);



module.exports = router;
