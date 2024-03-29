
const httpStatus = require("http-status");
const moment = require("moment-timezone");
const chalk = require("chalk");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");
const { Encrypt, Decrypt } = require("../../services/encryption.service");

const UserThread = async (req, res) => {
  let { email, member_id, member_name, role } = req.session.sessionsData;

  // query category
  let resultCategory = [];
  try {
    resultCategory = await conKnex.select().from('d_catalog').orderBy('catalog_id', 'ASC');
    return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
      baseUrl: config.baseUrl,
      memId: member_id,
      memName: member_name,
      memEmail: email,
      role: role,
      category: resultCategory,
      user: Encrypt(member_id)
    });
  } catch (err) {
    logger.error(chalk.red(err));
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }
};

const ThreadList = async (req, res) => {
  let { status } = req.body;
  let { member_id } = req.session.sessionsData;
  let resultTicket = [];

  try {
    resultTicket = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
      .from('f_ticket')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
      .whereIn('f_ticket.status_id', status)
      .andWhere('f_ticket.mcode', '=', member_id)
      .orderBy('f_ticket.create_date', 'DESC');
    return res.json({
      status: 200,
      message: 'Successfully fetched',
      data: resultTicket,
    })
  } catch (err) {
    logger.error(chalk.red(err));
    return res.json({
      status: 400,
      message: `Can't fetched Data`
    })
  }

};

const DetailThread = async (req, res) => {
  let { role, member_id, member_name, email } = req.session.sessionsData;
  let { ticketid } = req.params

  try {

    let resultTicketDetails = await conKnex.select('f_ticket.mname', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'f_ticket_detail.*', 'f_ticket.status_id', 'f_ticket.create_date',
      conKnex.raw('JSON_ARRAYAGG( JSON_OBJECT( "mid", t_comment.mid, "txt_msg", t_comment.txt_msg, "date_mes", t_comment.date_mes, "ticket_id", t_comment.ticket_id, "u_id", t_comment.u_id, "attach_file", t_comment.attach_file, "type", t_comment.type, "u_name", t_comment.u_name, "role", CASE WHEN f_ticket.mname = t_comment.u_name THEN "user" ELSE "admin" END)) as comment'))
      .from('f_ticket_detail')
      .innerJoin('f_ticket', 'f_ticket.ticket_id', 'f_ticket_detail.ticket_id')
      .leftJoin('t_comment', 't_comment.ticket_id', 'f_ticket_detail.ticket_id')
      .crossJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .where('f_ticket_detail.ticket_id', '=', ticketid)
      .andWhere('f_ticket.mcode', '=', member_id)
      .groupBy('f_ticket_detail.ticket_id');

    return res.status(httpStatus.OK).render("pages/user/thread.page.ejs", {
      role: role,
      baseUrl: config.baseUrl,
      memId: member_id,
      memName: member_name,
      memEmail: email,
      user: Encrypt(member_id),
      forum: resultTicketDetails,
    });

  } catch (err) {
    logger.error(chalk.red(err.code));
    await conKnex.raw(`SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));`)
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }
};

const NewTicket = async (req, res) => {
  let { email, member_id, member_name, mobile, role } = req.session.sessionsData;
  let { selectType, inputDetail } = req.body;
  let filename = req.file ? req.file.filename : null;

  try {
    await conKnex.insert(
      {
        catalog_id: selectType,
        mcode: member_id,
        mname: member_name,
        email: email,
        mobile: mobile ? mobile : 0,
        create_date: moment().tz("Asia/Bangkok").unix(),
      })
      .into('f_ticket')
      .then(async function (ticket_id) {

        await conKnex.insert(
          {
            ticket_id: ticket_id,
            detail: inputDetail,
            attach_file: filename,
            create_date: moment().tz("Asia/Bangkok").unix(),
          })
          .into('f_ticket_detail')
          .then(async function () {

            await conKnex.insert({
              detail: inputDetail,
              uid: member_id,
              uname: member_name,
              type: "ticket",
              ticket_id: ticket_id,
              createdAt: moment.tz('Asia/Bangkok').unix(),
              attach_file: filename,
              urole: role
            })
              .into('n_log')
              .then(async function () {
                logger.info('Inserted ticket successfully');
                return res.json({
                  status: 200,
                  message: 'Create success!'
                })
              });
          });
      })

  } catch (error) {
    logger.error(chalk.red(error))
    return res.json({
      status: 400,
      message: `Can't inserted Data`
    })
  }
}


const HistoryList = async (req, res) => {
  let { email, member_id, member_name, role } = req.session.sessionsData;

  return res.status(200).render("pages/user/history.page.ejs", {
    role: role,
    baseUrl: config.baseUrl,
    memId: member_id,
    memName: member_name,
    user: Encrypt(member_id)
  })
};

const SearchHistory = async (req, res) => {
  let { status, dateStart, dateEnd } = req.body;
  let { member_id } = req.session.sessionsData;
  let resultTicket = [];

  try {
    resultTicket = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
      .from('f_ticket')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
      .whereIn('f_ticket.status_id', status)
      .andWhere('f_ticket.mcode', '=', member_id)
      .andWhere('f_ticket.create_date', '>=', moment.tz(dateStart, "Asia/Bangkok").unix())
      .andWhere('f_ticket.create_date', '<=', moment.tz(dateEnd, "Asia/Bangkok").unix())
      .orderBy('f_ticket.create_date', 'DESC');


    return res.json({
      status: 200,
      message: 'Successfully fetched',
      data: resultTicket,
    })
  } catch (err) {
    logger.error(chalk.red(err));
    return res.json({
      status: 400,
      message: `Can't fetched Data`
    })
  }
}

const FetchedNotifications = async (req, res) => {
  let { user } = req.body;

  try {
    let resultNotification = await conKnex.distinct('ntf_comment.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'f_ticket_detail.detail AS d_ticket')
      .fromRaw('(SELECT * FROM n_log WHERE uid <> ? AND ticket_id IN (SELECT ticket_id FROM f_ticket WHERE mcode = ?) )  ntf_comment', [user, user])
      .innerJoin('f_ticket_detail', 'ntf_comment.ticket_id', 'f_ticket_detail.ticket_id')
      .innerJoin('f_ticket', 'ntf_comment.ticket_id', 'f_ticket.ticket_id')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')

    return res.status(httpStatus.OK).send(resultNotification);

  } catch (e) {
    logger.error(chalk.bold.red(e));
  }
}


module.exports = {
  UserThread,
  ThreadList,
  DetailThread,
  NewTicket,
  HistoryList,
  SearchHistory,
  FetchedNotifications
};

