const httpStatus = require("http-status");

const AuthUser = (req, res, next) => {
  let { role } = req.session.sessionsData;

  if (role !== "user")
    return res.status(httpStatus.FORBIDDEN).render("pages/denied");

  next();
};

const AuthAdmin = (req, res, next) => {
  // let { role } = req.session.sessionsData;
  //   if (role !== "admin")
  //    return res.status(httpStatus.NOT_ACCEPTED).render("pages/error");
  //   next();
};

module.exports = {
  AuthUser,
  AuthAdmin,
};
