const { GetMember } = require("../services/service");
const httpStatus = require("http-status");
const logger = require("../configs/logger");
const config = require("../configs/config");

const CheckUser = async (req, res, next) => {
  let { mem_id } = req.query;

  // check session
  if (req.session.sessionsData) {
    return next();
  }

  // check params query user
  if (!mem_id) {
    if (config.node_env !== 'development') return res.status(httpStatus.NOT_FOUND).redirect('https://www.successmore1.com/member/index.php?sessiontab=6')

    return res.status(httpStatus.NOT_FOUND).render("pages/error");
  }

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
    mobile: resultMember.data[0].mobile,
    register_date: resultMember.data[0].register_date,
    expire_date: resultMember.data[0].expire_date,
  };

  logger.info(`Set session! user: ${resultMember.data[0].member_id} ${resultMember.data[0].member_name} has logged in`)
  next();
};

module.exports = {
  CheckUser,
};
