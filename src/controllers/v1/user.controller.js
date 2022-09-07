
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
  } catch (err) {
    logger.error(err);
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }

  return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    baseUrl: config.baseUrl,
    memId: member_id,
    memName: member_name,
    memEmail: email,
    role: role,
    category: resultCategory,
  });
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

  res.json({
    status: 200,
    message: 'Create success!'
  })
}

module.exports = {
  UserThread,
  DetailThread,
  NewTicket,
};
