const { request } = require("./request");

function wxLogin(code) {
  return request({
    url: "/auth/wx-login",
    method: "POST",
    data: { code },
  });
}

function completeProfile(payload) {
  return request({
    url: "/auth/complete-profile",
    method: "POST",
    data: payload,
  });
}

function getCurrentUser() {
  return request({
    url: "/auth/me",
    method: "GET",
  });
}

module.exports = {
  wxLogin,
  completeProfile,
  getCurrentUser,
};
