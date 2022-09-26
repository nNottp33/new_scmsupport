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

// get methods
userRouter.get("/support/scm", userController.UserThread);
userRouter.get("/support/scm/thread/detail/:ticketid", userController.DetailThread);
userRouter.get("/ticket/history", userController.HistoryList);

// post methods
userRouter.post("/ticket/list", userController.ThreadList);
userRouter.post("/add/new/ticket", upload.single('fileUpload'), userController.NewTicket);
userRouter.post("/ticket/history/search", userController.SearchHistory);
userRouter.post("/add/comment", upload.any('fileComment'), userController.AddComment);

// delete methods
userRouter.delete("/delete/comment", userController.DeleteComment);

module.exports = userRouter;