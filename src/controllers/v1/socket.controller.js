const httpStatus = require("http-status");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");
const moment = require("moment-timezone");
const chalk = require("chalk");

// event handlers comment-ticket
const CommentTicket = (msg) => {
    let { message, user } = msg;


}


module.exports = {
    CommentTicket
}