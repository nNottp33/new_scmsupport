const { GetMember } = require("../services/service");

// check user
const CheckUser = async (req, res, next) => {
  let { mem_id } = req.query;

  let resultMember = await GetMember(mem_id);

  resultMember.status
    ? next()
    : res.json({
        status: resultMember.status,
        message: resultMember.error.message,
      });
};

module.exports = {
  CheckUser,
};
