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
    let { role } = req.session.sessionsData;
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

                await conKnex.insert({
                    detail: txt_msg,
                    uid: u_id,
                    uname: u_name,
                    type: "comment",
                    ticket_id: ticketId,
                    createdAt: moment.tz('Asia/Bangkok').unix(),
                    attach_file: filename,
                    urole: role
                })
                    .into('n_log')
                    .then(async function () {

                        return res.status(httpStatus.OK).send({
                            body: commentServer
                        });
                    })
            });
    } catch (e) {
        logger.error(chalk.bold.red(e));

        return res.status(httpStatus.NOT_FOUND).send({
            message: "Can't comment"
        })
    }
}

const ChangeStatus = async (req, res) => {
    let { id, status, user } = req.body;
    let { role, } = req.session.sessionsData;

    try {


        // select status string
        await conKnex('d_statuss').first('status_descEN').where('status_id', status).then(async (row) => {

            // update status
            await conKnex('f_ticket').update('status_id', status).where('ticket_id', id)
                .then(async () => {
                    if (status === 2) await conKnex('f_ticket').update('approve_date', moment.tz('Asia/Bangkok').unix()).where('ticket_id', id)

                    if (status === 3) await conKnex('f_ticket').update('close_date', moment.tz('Asia/Bangkok').unix()).where('ticket_id', id)

                    // save n_log
                    await conKnex.insert({
                        detail: `Update status to ${row.status_descEN} `,
                        uid: user.id,
                        uname: user.uname,
                        type: "update status",
                        ticket_id: id,
                        createdAt: moment.tz('Asia/Bangkok').unix(),

                        urole: role
                    })
                        .into('n_log')
                        .then(async function () {

                            return res.status(httpStatus.OK).send({
                                message: "Update status successfully"
                            })
                        })
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


const ActionReadUnRead = async (req, res) => {
    let { ticket, user, id } = req.body;

    try {

        await conKnex('n_log')
            .where('n_log.id', id)
            .update({
                uread: conKnex.raw('JSON_ARRAY_APPEND( uread, "$", ?)', user)
            })

        return res.status(httpStatus.OK)

    } catch (e) {
        logger.error(chalk.bold.red(e));
        return res.status(httpStatus.BAD_REQUEST)
    }
}

module.exports = {
    AddComment,
    ChangeStatus,
    DeleteComment,
    ActionReadUnRead
}

