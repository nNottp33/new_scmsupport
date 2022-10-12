const globalRouter = require("express").Router();
const filters = require("../../middlewares/auth");
const globalController = require("../../controllers/v1/global.controller");
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

// get methods
globalRouter.get("/logout", filters.Logout);

// post methods
globalRouter.post("/add/comment", upload.any('fileComment'), globalController.AddComment);

// put methods
globalRouter.put("/update/status", globalController.ChangeStatus);

// delete methods
globalRouter.delete("/delete/comment", globalController.DeleteComment);


module.exports = globalRouter;