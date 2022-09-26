const httpStatus = require("http-status");
const config = require("../configs/config");

const AuthUser = (req, res, next) => {
  let { role } = req.session.sessionsData;

  if (role !== "user")
    return res.status(httpStatus.FORBIDDEN).render("pages/denied");

  next();
};

const AuthAdmin = (req, res, next) => {
  let { role } = req.session.sessionsData;

  if (role !== "admin")
    return res.status(httpStatus.NOT_ACCEPTED).render("pages/error");
  next();
};


const Logout = (req, res, next) => {
  req.session.destroy();

  logger.info("Logout!")
  res.status(200).send({ message: "Logout!" });
}

module.exports = {
  AuthUser,
  AuthAdmin,
  Logout,
};
