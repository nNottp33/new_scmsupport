
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

  try {
    resultTicket = await conKnex.select('f_ticket.*', 'd_catalog.catalog_nameTH', 'd_catalog.catalog_nameEN', 'd_statuss.status_descEN as status')
      .from('f_ticket')
      .innerJoin('d_catalog', 'd_catalog.catalog_id', 'f_ticket.catalog_id')
      .innerJoin('d_statuss', 'd_statuss.status_id', 'f_ticket.status_id')
      .orderBy('f_ticket.create_date', 'DESC')
      .limit(100);
    res.json({
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
  return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    nameuser: "user pass",
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

module.exports = {
  UserThread,
  ThreadList,
  DetailThread,
  NewTicket,
};
