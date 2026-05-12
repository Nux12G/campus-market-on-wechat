const { getToken } = require("../utils/storage");

const BASE_URL = "http://127.0.0.1:3000/api";

function request(options = {}) {
  const {
    url = "",
    method = "GET",
    data = {},
    header = {},
  } = options;

  return new Promise((resolve, reject) => {
    const token = getToken();

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header,
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        reject(res);
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

module.exports = {
  request,
  BASE_URL,
};
