const { GetMember } = require("../services/service");
const httpStatus = require("http-status");

// check user
const CheckUser = async (req, res, next) => {
  let { mem_id } = req.query;

  let resultMember = await GetMember(mem_id);

  if (!resultMember.status) {
    res.status(httpStatus.NOT_FOUND).render("pages/error.ejs");
  } else {
    req.body = resultMember.data;
    next();
  }
};

module.exports = {
  CheckUser,
};
