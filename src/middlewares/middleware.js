const { GetMember } = require("../services/service");
const httpStatus = require("http-status");

// check user
const CheckUser = async (req, res, next) => {
  let { mem_id } = req.query;

  if (!mem_id) {
    res.status(httpStatus.NOT_FOUND).render("pages/error");
  }

  if (mem_id) {
    let resultMember = await GetMember(mem_id);

    if (!resultMember.status) {
      res.status(httpStatus.NOT_FOUND).render("pages/error");
    }

    if (resultMember.status) {
      // req.body = resultMember.data;
      req.session = {
        role: "user",
        member_id: resultMember.data[0].member_id,
        member_name: resultMember.data[0].member_name,
        email: resultMember.data[0].member_id,
        register_date: resultMember.data[0].register_date,
        expire_date: resultMember.data[0].expire_date,
      };

      next();
    }
  }
};

module.exports = {
  CheckUser,
};
