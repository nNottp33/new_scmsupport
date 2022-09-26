const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");

const AdminThread = (req, res) => {
    let { role, adminId, adminUname, branch } = req.session.sessionsData;

    return res.status(httpStatus.OK).render("pages/admin/admin.page.ejs", {
        baseUrl: config.baseUrl,
        role: role,
        admin: adminUname,
        branch: branch
    });
}

module.exports = {
    AdminThread
}