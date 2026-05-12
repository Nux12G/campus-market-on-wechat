const { request } = require("./request");

function getAdminDashboard() {
  return request({
    url: "/admin/dashboard",
    method: "GET",
  });
}

function getAdminGoods() {
  return request({
    url: "/admin/goods",
    method: "GET",
  });
}

function getAdminUsers() {
  return request({
    url: "/admin/users",
    method: "GET",
  });
}

function banUser(payload) {
  return request({
    url: "/admin/ban-user",
    method: "POST",
    data: payload,
  });
}

function unbanUser(payload) {
  return request({
    url: "/admin/unban-user",
    method: "POST",
    data: payload,
  });
}

function forceOffShelfGoods(payload) {
  return request({
    url: "/admin/force-off-shelf",
    method: "POST",
    data: payload,
  });
}

function getAdminAnnouncements() {
  return request({
    url: "/admin/announcements",
    method: "GET",
  });
}

function createAnnouncement(payload) {
  return request({
    url: "/admin/announcements",
    method: "POST",
    data: payload,
  });
}

function getAdminPenalties() {
  return request({
    url: "/admin/penalties",
    method: "GET",
  });
}

function createPenalty(payload) {
  return request({
    url: "/admin/penalties",
    method: "POST",
    data: payload,
  });
}

function getSensitiveWords() {
  return request({
    url: "/admin/sensitive-words",
    method: "GET",
  });
}

function addSensitiveWord(payload) {
  return request({
    url: "/admin/sensitive-words",
    method: "POST",
    data: payload,
  });
}

function getAdminReports() {
  return request({
    url: "/admin/reports",
    method: "GET",
  });
}

function processReport(payload) {
  return request({
    url: "/admin/reports/process",
    method: "POST",
    data: payload,
  });
}

module.exports = {
  getAdminDashboard,
  getAdminGoods,
  getAdminUsers,
  banUser,
  unbanUser,
  forceOffShelfGoods,
  getAdminAnnouncements,
  createAnnouncement,
  getAdminPenalties,
  createPenalty,
  getSensitiveWords,
  addSensitiveWord,
  getAdminReports,
  processReport,
};
