
const httpStatus = require("http-status");
const config = require("../../configs/config");
const conKnex = require("../../configs/db");
const logger = require("../../configs/logger");

const UserThread = async (req, res) => {
  let { email, member_id, member_name, role } = req.session.sessionsData;

  // query category
  let resultCategory = [];
  try {
    resultCategory = await conKnex.select().from('d_catalog').orderBy('catalog_id', 'ASC');
  } catch (err) {
    logger.error(err.sqlMessage);
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
  console.log(req.body);

  res.send(req.body);
}

module.exports = {
  UserThread,
  DetailThread,
  NewTicket,
};
