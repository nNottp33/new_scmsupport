const { GetMember } = require("../services/service");
const httpStatus = require("http-status");
const logger = require("../configs/logger");

const CheckUser = async (req, res, next) => {
  let { mem_id } = req.query;

  // check session
  if (req.session.sessionsData) {
    return next();
  }

  // check params query
  if (!mem_id) return res.status(httpStatus.NOT_FOUND).render("pages/error");

  // fetch user with api for check
  let resultMember = await GetMember(mem_id);

  // if user not found
  if (!resultMember.status) {
    logger.error(resultMember.error.message);
    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }

  // set the session
  req.session.sessionsData = {
    isAuth: true,
    role: "user",
    member_id: resultMember.data[0].member_id,
    member_name: resultMember.data[0].member_name,
    email: resultMember.data[0].email,
    register_date: resultMember.data[0].register_date,
    expire_date: resultMember.data[0].expire_date,
  };

  logger.info("Set session!");
  next();
};

module.exports = {
  CheckUser,
};
