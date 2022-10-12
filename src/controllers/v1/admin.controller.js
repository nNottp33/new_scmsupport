const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");
const { Encrypt, Decrypt } = require("../../services/encryption.service");

const AdminThread = async (req, res) => {
    let { role, adminId, adminUname, branch } = req.session.sessionsData;

    try {

        let result = await conKnex.select(conKnex.raw('COUNT(f_ticket.ticket_id) as all_t , SUM(CASE WHEN f_ticket.status_id = 1 THEN 1 ELSE 0 END) as new_t, SUM(CASE WHEN f_ticket.status_id = 2 THEN 1 ELSE 0 END) as pen_t'), conKnex.raw('JSON_ARRAYAGG( JSON_OBJECT("ticket_id", f_ticket.ticket_id, "mcode", f_ticket.mcode, "mname", f_ticket.mname, "email", f_ticket.email, "mobile", f_ticket.mobile, "createdAt", f_ticket.create_date, "u_id", f_ticket.u_id, "approved", f_ticket.approve_date, "closed", f_ticket.close_date, "status", ( JSON_OBJECT("id", f_ticket.status_id, "TH", d_statuss.status_descTH, "EN", d_statuss.status_descEN ) ), "catalog", ( JSON_OBJECT("id", f_ticket.catalog_id, "TH", d_catalog.catalog_nameTH, "EN", d_catalog.catalog_nameEN ) ) ) ) as t_list'))
            .from('f_ticket')
            .innerJoin('d_statuss', 'd_statuss.status_id', '=', 'f_ticket.status_id')
            .innerJoin('d_catalog', 'd_catalog.catalog_id', '=', 'f_ticket.catalog_id');

        result[0].c_group = await conKnex('f_ticket').select(conKnex.raw(' d_catalog.* , SUM( CASE WHEN d_catalog.catalog_id = f_ticket.catalog_id THEN 1 ELSE 0 END) as total'))
            .innerJoin('d_catalog', 'd_catalog.catalog_id', '=', 'f_ticket.catalog_id')
            .groupBy('d_catalog.catalog_id');

        return res.status(httpStatus.OK).render("pages/admin/admin.page.ejs", {
            baseUrl: config.baseUrl,
            pages: {
                name: "Ticket",
                status: "active",
                user: Encrypt(`${branch}-${adminId}-${adminUname}`)
            },
            role: role,
            admin: adminUname,
            id: adminId,
            branch: branch,
            ticket: result,
        });

    } catch (e) {
        logger.error(chalk.bold.red(e))
        return res.status(httpStatus.BAD_REQUEST).render("pages/error");
    }
}

const DetailThread = async (req, res) => {
    let { role, adminUname, adminId, branch } = req.session.sessionsData;
    let { ticketid } = req.params

    try {

        let resultTicketDetails = await conKnex.select('f_ticket.mname', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'f_ticket_detail.*', 'f_ticket.status_id', 'f_ticket.create_date',
            conKnex.raw('JSON_ARRAYAGG( JSON_OBJECT( "mid", t_comment.mid, "txt_msg", t_comment.txt_msg, "date_mes", t_comment.date_mes , "ticket_id", t_comment.ticket_id, "u_id", t_comment.u_id, "attach_file", t_comment.attach_file, "type", t_comment.type, "u_name", t_comment.u_name, "role", CASE WHEN f_ticket.mname = t_comment.u_name THEN "user" ELSE "admin" END)) as comment'))
            .from('f_ticket_detail')
            .innerJoin('f_ticket', 'f_ticket.ticket_id', 'f_ticket_detail.ticket_id')
            .leftJoin('t_comment', 't_comment.ticket_id', 'f_ticket_detail.ticket_id')
            .crossJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
            .where('f_ticket_detail.ticket_id', '=', ticketid)
            .groupBy('f_ticket_detail.ticket_id');



        return res.status(httpStatus.OK).render("pages/admin/detail.page.ejs", {
            baseUrl: config.baseUrl,
            pages: {
                name: `Ticket`,
                status: "active",
                user: Encrypt(`${branch}-${adminId}-${adminUname}`)
            },
            role: role,
            admin: adminUname,
            id: adminId,
            branch: branch,
            forum: resultTicketDetails,
        });

    } catch (err) {
        logger.error(chalk.red(err.code));
        await conKnex.raw(`SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));`)
        return res.status(httpStatus.NOT_FOUND).render("pages/error");
    }

}


const ReportPage = async (req, res) => {
    let { role, adminUname, adminId, branch } = req.session.sessionsData;

    try {

        let resultUserTicket = await conKnex('f_ticket').distinct('mcode', 'mname');
        let resultCatalog = await conKnex('d_catalog').select();

        return res.status(httpStatus.OK).render("pages/admin/report.page.ejs", {
            baseUrl: config.baseUrl,
            pages: {
                name: `Report`,
                status: "active",
                user: Encrypt(`${branch}-${adminId}-${adminUname}`)
            },
            role: role,
            admin: adminUname,
            id: adminId,
            branch: branch,
            users: resultUserTicket,
            catalogs: resultCatalog,
        });

    } catch (err) {
        logger.error(chalk.red(err));
        return res.status(httpStatus.NOT_FOUND).render("pages/error");
    }
}


const GetReport = async (req, res) => {
    let { dateStart, dateEnd, selectUsers, selectCatalog } = req.body;
    let resultReport = [];

    try {

        if (selectCatalog.length === 0 && selectUsers.length === 0) {

            resultReport = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
                .from('f_ticket')
                .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
                .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
                .where('f_ticket.create_date', '>=', moment.tz(dateStart, "Asia/Bangkok").unix())
                .andWhere('f_ticket.create_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
                .orderBy('f_ticket.create_date', 'DESC');

            return res.status(httpStatus.OK).send(resultReport);
        }


        if (selectUsers.length > 0 && selectCatalog.length === 0) {

            resultReport = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
                .from('f_ticket')
                .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
                .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
                .whereIn('f_ticket.mcode', selectUsers)
                .andWhere('f_ticket.create_date', '>=', moment.tz(dateStart, "Asia/Bangkok").unix())
                .andWhere('f_ticket.create_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
                .orderBy('f_ticket.create_date', 'DESC');

            return res.status(httpStatus.OK).send(resultReport);

        }

        if (selectUsers.length === 0 && selectCatalog.length > 0) {

            resultReport = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
                .from('f_ticket')
                .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
                .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
                .whereIn('f_ticket.catalog_id', selectCatalog)
                .andWhere('f_ticket.create_date', '>=', moment.tz(dateStart, "Asia/Bangkok").unix())
                .andWhere('f_ticket.create_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
                .orderBy('f_ticket.create_date', 'DESC');

            return res.status(httpStatus.OK).send(resultReport);
        }

        resultReport = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
            .from('f_ticket')
            .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
            .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
            .whereIn('f_ticket.catalog_id', selectCatalog)
            .orWhereIn('f_ticket.mcode', selectUsers)
            .andWhere('f_ticket.create_date', '>=', moment.tz(dateStart, "Asia/Bangkok").unix())
            .andWhere('f_ticket.create_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
            .orderBy('f_ticket.create_date', 'DESC');

        return res.status(httpStatus.OK).send(resultReport);

    } catch (err) {
        logger.error(chalk.red(err));
        return res.status(httpStatus.NOT_FOUND).render("pages/error");
    }
}

const CountNotification = async (req, res) => {
    let { user } = req.body;

    try {
        let count = await conKnex.select(conKnex.raw('c_f_ticket.total as n_ticket, c_t_comment.total as n_comment'))
            .fromRaw('( SELECT COUNT(f_ticket.ticket_id) AS total FROM f_ticket WHERE f_ticket.approve_date = 0) AS c_f_ticket, ( SELECT COUNT(t_comment.mid) AS total FROM t_comment WHERE t_comment.status = 0 AND t_comment.u_id <> ' + user + ' AND t_comment.ticket_id IN ( ( SELECT t_comment.ticket_id FROM t_comment WHERE u_id = "' + user + '" )  ) ) AS c_t_comment');

        return res.status(httpStatus.OK).send(count);

    } catch (e) {
        logger.error(chalk.bold.red(e));
    }
}

// *** NOTE:
// ตัด CountNotification ออกใช้แค่ FetchedNotifications แล้วเอา length จาก key => data ของทั้ง 2 type มา + กัน จะได้จำนวนทั้งหมด

const FetchedNotifications = async (req, res) => {
    let { user } = req.body;

    try {

        let resulteNotifications = await conKnex.select(conKnex.raw('JSON_ARRAYAGG(JSON_OBJECT( "id", n_l_ticket.ticket_id, "uid", n_l_ticket.mcode, "uname", n_l_ticket.mname, "catalog", (JSON_OBJECT( "TH", n_l_ticket.catalog_nameTH, "EN", n_l_ticket.catalog_nameEN, "id", n_l_ticket.catalog_id )),"createdAt", n_l_ticket.create_date) ) AS ticket'))
            .fromRaw('( SELECT f_ticket.*, d_catalog.catalog_nameTH,  d_catalog.catalog_nameEN FROM f_ticket INNER JOIN d_catalog ON d_catalog.catalog_id = f_ticket.catalog_id WHERE status = 0 ORDER BY ticket_id DESC ) AS n_l_ticket')

        let notificationList = [
            {
                type: "ticket",
                data: resulteNotifications[0].ticket,
            },
            {
                type: "comment",
                data: resulteNotifications[0].comment,
            }
        ]

        console.log(resulteNotifications[0]);

        console.log(notificationList);

        // return res.status(httpStatus.OK).send(notificationList)

    } catch (e) {
        logger.error(chalk.bold.red(e));
    }
}

// NOTE:
// Expected data
// [
//     {
//         key: "ticket",
//         value: [
//             {
//                 id: 1,
//                 uname: "Chawisa",
//                 catalog: {
//                     TH: 'ยกเลิกคำสั่งซื้อ',
//                     EN: 'Cancel bill',
//                     id: 1,
//                 },
//                 createdAt: 1223039495,
//             },
//         ],
//     },
//     {
//         key: "comment",
//         value: [
//             {
//                 id: 1,
//                 ticketId: 1,
//                 msg: "ทดสอบ",
//                 createdAt: 1232234233,
//                 uid: 0112,
//                 uname: "Nattapon",
//                 attachFile: '1232234233-something.jpg',
//             }
//         ]
//     },
// ]

module.exports = {
    AdminThread,
    DetailThread,
    ReportPage,
    GetReport,
    CountNotification,
    FetchedNotifications
}