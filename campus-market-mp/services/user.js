const { request } = require("./request");

function getCurrentUserProfile() {
  return request({
    url: "/users/me",
    method: "GET",
  });
}

function updateAvatar(payload) {
  return request({
    url: "/users/avatar",
    method: "POST",
    data: payload,
  });
}

function updateNickname(payload) {
  return request({
    url: "/users/nickname",
    method: "POST",
    data: payload,
  });
}

function updateContact(payload) {
  return request({
    url: "/users/contact",
    method: "POST",
    data: payload,
  });
}

module.exports = {
  getCurrentUserProfile,
  updateAvatar,
  updateNickname,
  updateContact,
};
