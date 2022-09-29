const { GetMember } = require("../services/service");
const httpStatus = require("http-status");
const logger = require("../configs/logger");
const config = require("../configs/config");
const chalk = require("chalk");

const CheckUser = async (req, res, next) => {

  let { mem_id, user } = req.query;
  // split data from query params
  let resultAdminData = user ? user.split("-") : 'unknow';

  // check session
  if (req.session.sessionsData) return next();

  if (user) {
    if (resultAdminData.length === 3) {
      // set session data admin
      req.session.sessionsData = {
        isAuth: true,
        role: "admin",
        adminId: resultAdminData[1],
        adminUname: resultAdminData[2],
        branch: resultAdminData[0],
      };

      logger.info(`Set session! Admin: ${resultAdminData[2]} has logged in`)

      return next();
    }
  }

  // fetch user with api for check
  let resultMember = await GetMember(mem_id);

  // if user not found
  if (!resultMember.status) {
    logger.error(chalk.red(resultMember.error));
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
