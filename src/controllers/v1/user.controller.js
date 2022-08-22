const httpStatus = require("http-status");

const UserThread = async (req, res) => {
  let { member_name } = req.session;

  res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    nameuser: member_name,
  });
};

module.exports = {
  UserThread,
};
