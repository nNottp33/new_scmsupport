const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");

const AddComment = async (req, res) => {
    let { u_id, u_name, txt_msg, ticketId } = req.body;
    let filename = req.files.length > 0 ? req.files[0].filename : null;

    let commentServer = {
        type: 1,
        u_id: u_id,
        u_name: u_name,
        txt_msg: txt_msg,
        date_mes: moment.tz('Asia/Bangkok').unix(),
        ticket_id: ticketId,
        attach_file: filename,
    }

    try {
        await conKnex.insert(commentServer)
            .into('t_comment')
            .then(async function (mid) {
                commentServer.mid = mid[0];

                return res.status(httpStatus.OK).send({
                    body: commentServer
                });

            });
    } catch (e) {
        logger.error(chalk.bold.red(e));

        return res.status(httpStatus.NOT_FOUND).send({
            message: "Can't comment"
        })
    }
}

const ChangeStatus = async (req, res) => {
    let { id, status } = req.body;

    try {

        await conKnex('f_ticket').update('status_id', status).where('ticket_id', id)
            .then(async () => {
                if (status === 2) await conKnex('f_ticket').update('approve_date', moment.tz('Asia/Bangkok').unix()).where('ticket_id', id)

                if (status === 3) await conKnex('f_ticket').update('close_date', moment.tz('Asia/Bangkok').unix()).where('ticket_id', id)

                return res.status(httpStatus.OK).send({
                    message: "Update status successfully"
                })
            })

    } catch (e) {
        logger.error(chalk.bold.red(e));

        return res.status(httpStatus.NOT_FOUND).send({
            message: "Update status failed"
        })
    }
}

const DeleteComment = async (req, res) => {
    let { comment, file } = req.body;

    try {
        await conKnex('t_comment')
            .where('mid', comment)
            .del()
            .then(() => {
                if (file) {
                    fs.unlinkSync(path.join(__dirname, `../../../public/files_upload/${file}`))
                }
            });

        return res.status(httpStatus.OK).send({
            message: 'Comment deleted!'
        })

    } catch (e) {
        logger.error(chalk.bold.red(e));

        return res.status(httpStatus.NOT_FOUND).send({
            message: "Deleted failed"
        })
    }
}


module.exports = {
    AddComment,
    ChangeStatus,
    DeleteComment
}