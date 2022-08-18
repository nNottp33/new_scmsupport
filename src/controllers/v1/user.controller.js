const httpStatus = require("http-status");

const CheckUser = async (req, res) => {
  let { member_name } = req.body[0];

  res.status(httpStatus.OK).render("pages/user/user.page.ejs", {
    nameuser: member_name,
  });
};

module.exports = {
  CheckUser,
};
