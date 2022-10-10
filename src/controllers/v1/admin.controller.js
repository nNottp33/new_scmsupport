const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");
const { select } = require("../../configs/db");

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
            conKnex.raw('JSON_ARRAYAGG( JSON_OBJECT( "mid", t_comment.mid, "txt_msg", t_comment.txt_msg, "date_mes", t_comment.date_mes, "ticket_id", t_comment.ticket_id, "u_id", t_comment.u_id, "attach_file", t_comment.attach_file, "type", t_comment.type, "u_name", t_comment.u_name, "role", CASE WHEN f_ticket.mname = t_comment.u_name THEN "user" ELSE "admin" END)) as comment'))
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
                .andWhere('f_ticket.close_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
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
                .andWhere('f_ticket.close_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
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
                .andWhere('f_ticket.close_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
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
            .andWhere('f_ticket.close_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
            .orderBy('f_ticket.create_date', 'DESC');

        return res.status(httpStatus.OK).send(resultReport);

    } catch (err) {
        logger.error(chalk.red(err));
        return res.status(httpStatus.NOT_FOUND).render("pages/error");
    }
}

module.exports = {
    AdminThread,
    DetailThread,
    ReportPage,
    GetReport
}