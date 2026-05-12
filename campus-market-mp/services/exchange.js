const { request } = require("./request");

function applyExchange(payload) {
  return request({
    url: "/exchange/apply",
    method: "POST",
    data: payload,
  });
}

function getReceivedRequests() {
  return request({
    url: "/exchange/received",
    method: "GET",
  });
}

function getSentRequests() {
  return request({
    url: "/exchange/sent",
    method: "GET",
  });
}

function approveExchange(id) {
  return request({
    url: `/exchange/${id}/approve`,
    method: "POST",
  });
}

function rejectExchange(id) {
  return request({
    url: `/exchange/${id}/reject`,
    method: "POST",
  });
}

module.exports = {
  applyExchange,
  getReceivedRequests,
  getSentRequests,
  approveExchange,
  rejectExchange,
};
