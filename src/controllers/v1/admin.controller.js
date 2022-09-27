const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");

const AdminThread = async (req, res) => {
    let { role, adminId, adminUname, branch } = req.session.sessionsData;

    try {

        let result = await conKnex.select(conKnex.raw('COUNT(f_ticket.ticket_id) as all_t , SUM(CASE WHEN f_ticket.status_id = 1 THEN 1 ELSE 0 END) as new_t, SUM(CASE WHEN f_ticket.status_id = 2 THEN 1 ELSE 0 END) as pen_t'), conKnex.raw('JSON_ARRAYAGG( JSON_OBJECT("ticket_id", f_ticket.ticket_id, "mcode", f_ticket.mcode, "mname", f_ticket.mname, "email", f_ticket.email, "mobile", f_ticket.mobile, "createdAt", f_ticket.create_date, "u_id", f_ticket.u_id, "approved", f_ticket.approve_date, "closed", f_ticket.close_date, "status", ( JSON_OBJECT("id", f_ticket.status_id, "TH", d_statuss.status_descTH, "EN", d_statuss.status_descEN ) ), "catalog", ( JSON_OBJECT("id", f_ticket.catalog_id, "TH", d_catalog.catalog_nameTH, "EN", d_catalog.catalog_nameEN ) ) ) ) as t_list'))
            .from('f_ticket')
            .innerJoin('d_statuss', 'd_statuss.status_id', '=', 'f_ticket.status_id')
            .innerJoin('d_catalog', 'd_catalog.catalog_id', '=', 'f_ticket.catalog_id');

        return res.status(httpStatus.OK).render("pages/admin/admin.page.ejs", {
            baseUrl: config.baseUrl,
            pages: {
                name: "Ticket",
                link: `/admin/support/scm?user=${branch}-${adminId}-${adminUname}`,
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

module.exports = {
    AdminThread
}