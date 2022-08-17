const axios = require("axios");

const GetMember = async (mem_id) => {
  try {
    const result = await axios({
      method: "GET",
      url: `https://successmore.com/API/Member_Information/Member?mem_id=${mem_id}`,
      headers: {
        Authorization: `Bearer OiDgSxts5DF8gFryMKsViZsDwmVTxYktGWl9BgabOCtcgMT5b4`,
      },
    });

    return {
      status: result.data.STATUS,
      data: result.data.DATA,
    };
  } catch (error) {
    return {
      status: false,
      error: error,
    };
  }
};

module.exports = {
  GetMember,
};
