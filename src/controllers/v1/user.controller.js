
const httpStatus = require("http-status");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");
const moment = require("moment-timezone");

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
    });
  } catch (err) {
    logger.error(err);
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }
};

const ThreadList = async (req, res) => {
  let resultTicket = [];
  let { member_id } = req.session.sessionsData;

  try {
    resultTicket = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
      .from('f_ticket')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
      .whereIn('f_ticket.status_id', [1, 2])
      .andWhere('f_ticket.mcode', '=', member_id)
      .orderBy('f_ticket.create_date', 'DESC');
    return res.json({
      status: 200,
      message: 'Successfully fetched',
      data: resultTicket,
    })
  } catch (err) {
    logger.error(err);
    return res.json({
      status: 400,
      message: `Can't fetched Data`
    })
  }

};

const DetailThread = async (req, res) => {
  let { role, member_id, member_name, email } = req.session.sessionsData;
  let { ticketid } = req.params

  let resultTicketDetails = [];

  try {
    resultTicketDetails = await conKnex.select('d_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'f_ticket_detail.*', 'f_ticket.create_date')
      .from('f_ticket_detail')
      .innerJoin('f_ticket', 'f_ticket.ticket_id', 'f_ticket_detail.ticket_id')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .where('f_ticket_detail.ticket_id', '=', ticketid)
      .andWhere('f_ticket.mcode', '=', member_id);
  } catch (err) {
    logger.error(err);
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }

  return res.status(httpStatus.OK).render("pages/user/thread.page.ejs", {
    role: role,
    baseUrl: config.baseUrl,
    memId: member_id,
    memName: member_name,
    memEmail: email,
    forum: resultTicketDetails,
  });
};

const NewTicket = async (req, res) => {
  let { email, member_id, member_name, mobile } = req.session.sessionsData;
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
        try {
          await conKnex.insert(
            {
              ticket_id: ticket_id,
              detail: inputDetail,
              attach_file: filename,
              create_date: moment().tz("Asia/Bangkok").unix(),
            })
            .into('f_ticket_detail')

          logger.info('Inserted ticket successfully');
          return res.json({
            status: 200,
            message: 'Create success!'
          })

        } catch (e) {
          logger.error(e)
          return res.json({
            status: 400,
            message: `Can't inserted Data`
          })
        }
      });
  } catch (error) {
    logger.error(error)
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
  })
};

module.exports = {
  UserThread,
  ThreadList,
  DetailThread,
  NewTicket,
  HistoryList,
};
