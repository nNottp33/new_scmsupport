const userRouter = require("express").Router();
const userController = require("../../controllers/v1/user.controller");
// for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/files_upload')
    },
    filename: function (req, file, cb) {
        let fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        cb(null, fileName)
    }
})
const upload = multer({ storage: storage })

userRouter.get("/support/scm", userController.UserThread);
userRouter.get("/support/scm/thread/detail/:ticketid", userController.DetailThread);
userRouter.post("/add/new/ticket", upload.single('fileUpload'), userController.NewTicket);
userRouter.post("/ticket/list", userController.ThreadList);
userRouter.get("/ticket/history", userController.HistoryList);
userRouter.post("/ticket/history/search", userController.SearchHistory);

module.exports = userRouter;
