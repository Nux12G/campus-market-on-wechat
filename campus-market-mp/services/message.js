const { request } = require("./request");

function getMessageList() {
  return request({
    url: "/messages/list",
    method: "GET",
  });
}

module.exports = {
  getMessageList,
};
