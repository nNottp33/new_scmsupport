const userRouter = require("express").Router();
const userController = require("../../controllers/v1/user.controller");
// for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/files_upload')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now())
    }
})
const upload = multer({ storage: storage })

userRouter.get("/support/scm", userController.UserThread);
userRouter.get("/support/scm/thread/detail", userController.DetailThread);
// userRouter.post("/add/new/ticket", userController.NewTicket);
userRouter.post("/add/new/ticket", upload.single('fileUpload'), userController.NewTicket);

module.exports = userRouter;
