const AuthUser = (req, res, next) => {
  if (req.session.role == "user") {
    next();
  }
};

const AuthAdmin = (req, res, next) => {
  if (req.session.role == "admin") {
    next();
  }
};

module.exports = {
  AuthUser,
  AuthAdmin,
};
