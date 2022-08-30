const httpStatus = require("http-status");
const knex = require("../../configs/db");

const UserThread = async (req, res) => {
  let { member_id, member_name, role } = req.session.sessionsData;

  let resultCategory = knex('d_catalog').select();
  console.log(resultCategory);

  return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    memId: member_id,
    memName: member_name,
    role: role,
  });
};

const DetailThread = async (req, res) => {
  return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    nameuser: "user pass",
  });
};

module.exports = {
  UserThread,
  DetailThread,
};
