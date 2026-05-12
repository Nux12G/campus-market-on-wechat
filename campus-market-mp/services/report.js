const { request } = require("./request");

function createReport(payload) {
  return request({
    url: "/reports",
    method: "POST",
    data: payload,
  });
}

module.exports = {
  createReport,
};
