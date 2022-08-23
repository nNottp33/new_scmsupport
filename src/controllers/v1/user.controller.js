const httpStatus = require("http-status");

const UserThread = async (req, res) => {
  let { member_name } = req.session.sessionsData;

  return res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    nameuser: member_name,
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
